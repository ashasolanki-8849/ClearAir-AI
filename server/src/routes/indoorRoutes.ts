import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getRooms,
  createRoom,
  updateRoom,
  deleteRoom,
  createAssessment,
  getRoomAssessment,
  getVentilationAdvice,
  getPurifierAdvice,
  askIndoorAdvisor,
  getIndoorAlerts,
  markAlertAsRead,
} from '../controllers/indoorController.js';

const router = Router();

// Rooms
router.get('/rooms', authenticateToken, getRooms);
router.post('/rooms', authenticateToken, createRoom);
router.put('/rooms/:id', authenticateToken, updateRoom);
router.delete('/rooms/:id', authenticateToken, deleteRoom);

// Assessments
router.post('/assessment', authenticateToken, createAssessment);
router.get('/assessment/:roomId', authenticateToken, getRoomAssessment);

// Specialized Advisors
router.post('/ventilation-advice', getVentilationAdvice); // optionally authenticated
router.post('/purifier-advice', getPurifierAdvice);
router.post('/ask-advisor', askIndoorAdvisor);

// Alerts
router.get('/alerts', authenticateToken, getIndoorAlerts);
router.patch('/alerts/:id/read', authenticateToken, markAlertAsRead);

export default router;
