import { Router } from 'express';
import { getCurrentAQI, getAQIHistory, getPollutants } from '../controllers/airQualityController.js';
import { optionalAuthenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/current', optionalAuthenticateToken, getCurrentAQI);
router.get('/history', optionalAuthenticateToken, getAQIHistory);
router.get('/pollutants', optionalAuthenticateToken, getPollutants);

export default router;
