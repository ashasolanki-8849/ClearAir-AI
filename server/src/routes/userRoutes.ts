import { Router } from 'express';
import { getProfile, updateProfile, updatePreferences } from '../controllers/userController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/profile', authenticateToken, getProfile);
router.put('/profile', authenticateToken, updateProfile);
router.put('/preferences', authenticateToken, updatePreferences);

export default router;
