import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { User } from '../models/User.js';
import { UserPreferences } from '../models/UserPreferences.js';

export const getProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const user = await User.findById(req.user.id);
    const preferences = await UserPreferences.findOne({ userId: req.user.id });

    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    res.status(200).json({
      success: true,
      profile: {
        id: user._id,
        fullName: user.fullName,
        email: user.email,
        ageGroup: user.ageGroup,
        userCategory: user.userCategory,
        city: user.city,
        preferredLocation: user.preferredLocation,
        createdAt: user.createdAt,
        preferences: preferences || null,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { fullName, ageGroup, userCategory, city, preferredLocation } = req.body;

    const user = await User.findById(req.user.id);
    if (!user) {
      res.status(404).json({ success: false, message: 'User not found' });
      return;
    }

    if (fullName) user.fullName = fullName.trim();
    if (ageGroup) user.ageGroup = ageGroup;
    if (userCategory) user.userCategory = userCategory;
    if (city) user.city = city.trim();
    if (preferredLocation) user.preferredLocation = preferredLocation;

    await user.save();

    res.status(200).json({
      success: true,
      message: 'Profile updated successfully',
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
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updatePreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Unauthorized' });
      return;
    }

    const { theme, standard, notifications, preferredLocation } = req.body;

    const preferences = await UserPreferences.findOneAndUpdate(
      { userId: req.user.id },
      {
        $set: {
          ...(theme && { theme }),
          ...(standard && { standard }),
          ...(notifications && { notifications }),
          ...(preferredLocation && { preferredLocation }),
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Preferences updated successfully',
      preferences,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
