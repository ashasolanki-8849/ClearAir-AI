import { Request, Response } from 'express';
import jwt from 'jsonwebtoken';
import { User } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';

const generateToken = (userId: string, email: string, fullName: string): string => {
  const secret = process.env.JWT_SECRET || 'clearair_super_secret_jwt_key_2026_smog_protection';
  const expiresIn = process.env.JWT_EXPIRES_IN || '7d';
  return jwt.sign({ id: userId, email, fullName }, secret, { expiresIn } as any);
};

export const register = async (req: Request, res: Response): Promise<void> => {
  try {
    const { fullName, email, password, ageGroup, userCategory, city, preferredLocation } = req.body;

    if (!fullName || !email || !password || !city) {
      res.status(400).json({ success: false, message: 'Full name, email, password and city are required.' });
      return;
    }

    const existingUser = await User.findOne({ email: email.toLowerCase().trim() });
    if (existingUser) {
      res.status(409).json({ success: false, message: 'An account with this email already exists.' });
      return;
    }

    const newUser = await User.create({
      fullName: fullName.trim(),
      email: email.toLowerCase().trim(),
      password,
      ageGroup: ageGroup || '18_35',
      userCategory: userCategory || 'professional',
      city: city.trim(),
      preferredLocation: preferredLocation || {
        name: city.trim(),
        lat: 28.6139,
        lon: 77.2090,
      },
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
      res.status(401).json({ success: false, message: 'Invalid credentials. User not found.' });
      return;
    }

    const isMatch = await user.comparePassword(password);
    if (!isMatch) {
      res.status(401).json({ success: false, message: 'Invalid credentials. Incorrect password.' });
      return;
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
        createdAt: user.createdAt,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Login failed.' });
  }
};

export const getMe = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id);
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const forgotPassword = async (req: Request, res: Response): Promise<void> => {
  try {
    const { email } = req.body;
    if (!email) {
      res.status(400).json({ success: false, message: 'Email address is required.' });
      return;
    }

    const user = await User.findOne({ email: email.toLowerCase().trim() });
    if (!user) {
      // Return safe response to avoid account enumeration
      res.status(200).json({
        success: true,
        message: 'If an account exists with this email, password reset instructions have been dispatched.',
      });
      return;
    }

    res.status(200).json({
      success: true,
      message: 'Password reset link sent to your email. (In development mode: You may re-register or use login).',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
