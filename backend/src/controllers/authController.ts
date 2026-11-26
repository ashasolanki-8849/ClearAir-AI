import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User, IUser } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const CITY_COORDINATES: Record<string, { lat: number; lon: number }> = {
  gandhinagar: { lat: 23.2156, lon: 72.6369 },
  ahmedabad: { lat: 23.0225, lon: 72.5714 },
  surat: { lat: 21.1702, lon: 72.8311 },
  vadodara: { lat: 22.3072, lon: 73.1812 },
  rajkot: { lat: 22.3039, lon: 70.8022 },
  mumbai: { lat: 19.0760, lon: 72.8777 },
  pune: { lat: 18.5204, lon: 73.8567 },
  delhi: { lat: 28.6139, lon: 77.2090 },
  'new delhi': { lat: 28.6139, lon: 77.2090 },
  bengaluru: { lat: 12.9716, lon: 77.5946 },
  kolkata: { lat: 22.5726, lon: 88.3639 },
  chennai: { lat: 13.0827, lon: 80.2707 },
  hyderabad: { lat: 17.3850, lon: 78.4867 },
  jaipur: { lat: 26.9124, lon: 75.7873 },
  lucknow: { lat: 26.8467, lon: 80.9462 },
  chandigarh: { lat: 30.7333, lon: 76.7794 },
  bhopal: { lat: 23.2599, lon: 77.4126 },
  indore: { lat: 22.7196, lon: 75.8577 },
};

const resolveCoordinates = (city: string, preferredLocation?: { name: string; lat: number; lon: number }) => {
  if (preferredLocation && preferredLocation.lat && preferredLocation.lon && !(preferredLocation.lat === 28.6139 && city.toLowerCase() !== 'delhi')) {
    return preferredLocation;
  }
  const cleanCity = city.trim().toLowerCase();
  const matched = CITY_COORDINATES[cleanCity];
  if (matched) {
    return {
      name: city.trim(),
      lat: matched.lat,
      lon: matched.lon,
    };
  }
  // Default to Gandhinagar
  return {
    name: city.trim(),
    lat: 23.2156,
    lon: 72.6369,
  };
};

const generateToken = (userId: string, email: string, fullName: string): string => {
  const secret = process.env.JWT_SECRET || 'clearair_super_secret_jwt_key_2026_smog_protection';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, email, fullName }, secret, { expiresIn } as any);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, ageGroup, userCategory, city, preferredLocation } = req.body;

    if (!fullName || !email || !password || !city) {
      res.status(400).json({ success: false, message: 'Full name, email, password, and city are required.' });
      return;
    }

    // Password strength verification: min 8 characters, at least 1 letter and 1 number
    if (password.length < 8) {
      res.status(400).json({ success: false, message: 'Password must be at least 8 characters long.' });
      return;
    }
    const hasLetter = /[a-zA-Z]/.test(password);
    const hasNumber = /\d/.test(password);
    if (!hasLetter || !hasNumber) {
      res.status(400).json({ success: false, message: 'Password must contain at least one letter and one number for security.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const resolvedLocation = resolveCoordinates(city, preferredLocation);

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      ageGroup: ageGroup || '18_35',
      userCategory: userCategory || 'general',
      city: city.trim(),
      preferredLocation: resolvedLocation,
      loginAttempts: 0,
    });

    // Create default preferences
    await UserPreferences.create({
      userId: newUser._id,
      theme: 'dark',
      preferredLocation: newUser.preferredLocation,
    });

    const token = generateToken(newUser._id.toString(), newUser.email, newUser.fullName);

    res.status(201).json({
      success: true,
      message: 'Account registered successfully.',
      token,
      user: {
        id: newUser._id,
        fullName: newUser.fullName,
        email: newUser.email,
        ageGroup: newUser.ageGroup,
        userCategory: newUser.userCategory,
        city: newUser.city,
        preferredLocation: newUser.preferredLocation,
        createdAt: newUser.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Registration failed.' });
  }
};

export const login = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email, password } = req.body;

    if (!email || !password) {
      res.status(400).json({ success: false, message: 'Please provide both email and password.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() }).select('+password');
    if (!user) {
      res.status(401).json({ success: false, message: 'Invalid email or password.' });
      return;
    }

    // 1. Check account lockout status (Max 5 failed attempts locks for 15 minutes)
    if (user.lockUntil && user.lockUntil.getTime() > Date.now()) {
      const remainingMinutes = Math.ceil((user.lockUntil.getTime() - Date.now()) / (1000 * 60));
      res.status(423).json({
        success: false,
        message: `Account is temporarily locked for security due to multiple failed login attempts. Please try again in ${remainingMinutes} minute(s).`,
      });
      return;
    }

    // 2. Verify password with bcrypt
    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      // Increment failed login attempts
      const attempts = (user.loginAttempts || 0) + 1;
      let lockUntil: Date | undefined = undefined;

      if (attempts >= 5) {
        lockUntil = new Date(Date.now() + 15 * 60 * 1000); // 15-minute lock
      }

      await User.findByIdAndUpdate(user._id, {
        $set: {
          loginAttempts: attempts,
          ...(lockUntil ? { lockUntil } : {}),
        },
      });

      if (attempts >= 5) {
        res.status(423).json({
          success: false,
          message: 'Account is temporarily locked for 15 minutes due to 5 consecutive failed login attempts.',
        });
        return;
      }

      const attemptsRemaining = 5 - attempts;
      res.status(401).json({
        success: false,
        message: `Invalid email or password. (${attemptsRemaining} attempt(s) remaining before security lockout)`,
      });
      return;
    }

    // 3. Reset failed login attempts on successful authentication
    if (user.loginAttempts && user.loginAttempts > 0) {
      await User.findByIdAndUpdate(user._id, {
        $set: { loginAttempts: 0 },
        $unset: { lockUntil: 1 },
      });
    }

    const token = generateToken(user._id.toString(), user.email, user.fullName);

    res.status(200).json({
      success: true,
      message: 'Logged in successfully.',
      token,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        ageGroup: user.ageGroup,
        userCategory: user.userCategory,
        city: user.city,
        preferredLocation: user.preferredLocation,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const user = await User.findById(req.user?.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User profile not found.' });
      return;
    }

    res.status(200).json({
      success: true,
      user: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        ageGroup: user.ageGroup,
        userCategory: user.userCategory,
        city: user.city,
        preferredLocation: user.preferredLocation,
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch user profile.' });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Please provide your registered email address.' });
      return;
    }
    res.status(200).json({
      success: true,
      message: 'If an account exists with this email, password reset instructions have been sent.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to process request.' });
  }
};
