import { Router } from 'express';
import { getAlerts, markAlertAsRead, markAllAlertsAsRead } from '../controllers/alertController.js';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/', optionalAuthenticateToken, getAlerts);
router.patch('/:id/read', authenticateToken, markAlertAsRead);
router.post('/read-all', authenticateToken, markAllAlertsAsRead);

export default router;
