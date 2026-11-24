import { Router } from 'express';
import { authenticateToken, optionalAuthenticateToken } from '../middleware/authMiddleware.js';
import {
  searchRoutes,
  compareRoutes,
  getModeAlternatives,
  getSavedPlaces,
  createSavedPlace,
  updateSavedPlace,
  deleteSavedPlace,
  getSavedRoutes,
  createSavedRoute,
  deleteSavedRoute,
  calculateEmissions,
  getDepartureTimeAdvice,
  getTravelHistory,
  recordTrip,
  getTravelPreferences,
  updateTravelPreferences,
  askTravelAdvisor,
} from '../controllers/travelController.js';

const router = Router();

// 1. Route Planning & Recommendations (public/optional auth)
router.post('/search', optionalAuthenticateToken, searchRoutes);
router.post('/compare', optionalAuthenticateToken, compareRoutes);
router.get('/alternatives', optionalAuthenticateToken, getModeAlternatives);

// 2. Specialized Calculators & Advisors (public/optional auth)
router.post('/emissions/calculate', optionalAuthenticateToken, calculateEmissions);
router.post('/departure-times', optionalAuthenticateToken, getDepartureTimeAdvice);
router.post('/ask-advisor', optionalAuthenticateToken, askTravelAdvisor);

// 3. Saved Places (Authenticated)
router.get('/places', authenticateToken, getSavedPlaces);
router.post('/places', authenticateToken, createSavedPlace);
router.put('/places/:id', authenticateToken, updateSavedPlace);
router.delete('/places/:id', authenticateToken, deleteSavedPlace);

// 4. Saved Routes (Authenticated)
router.get('/routes', authenticateToken, getSavedRoutes);
router.post('/routes', authenticateToken, createSavedRoute);
router.delete('/routes/:id', authenticateToken, deleteSavedRoute);

// 5. Travel History & Trip Logging (Authenticated)
router.get('/history', authenticateToken, getTravelHistory);
router.post('/history', authenticateToken, recordTrip);

// 6. Travel Preferences (Authenticated)
router.get('/preferences', authenticateToken, getTravelPreferences);
router.put('/preferences', authenticateToken, updateTravelPreferences);

export default router;
