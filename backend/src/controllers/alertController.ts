import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Alert } from '../models/Alert.js';

export const getAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;

    // Get user alerts or public broadcast alerts
    const query = userId ? { $or: [{ userId }, { userId: null }] } : { userId: null };

    const alerts = await Alert.find(query).sort({ timestamp: -1 }).limit(30);
    const unreadCount = await Alert.countDocuments({ ...query, read: false });

    res.status(200).json({
      success: true,
      unreadCount,
      alerts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAlertAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;

    const alert = await Alert.findByIdAndUpdate(id, { read: true }, { new: true });
    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    res.status(200).json({
      success: true,
      alert,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAllAlertsAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const query = userId ? { $or: [{ userId }, { userId: null }] } : { userId: null };

    await Alert.updateMany(query, { read: true });

    res.status(200).json({
      success: true,
      message: 'All notifications marked as read.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
