import { Router } from 'express';
import {
  getLifestyle,
  updateLifestyle,
  getTodayPlan,
  generatePlan,
  updateActivityStatus,
  swapActivityWithAlternative,
  addCustomActivity,
  getPlanHistory,
  getFamilyProfiles,
  createFamilyProfile,
  deleteFamilyProfile,
  getFamilyRecommendations,
  getReminders,
  toggleReminder,
} from '../controllers/dailyPlannerController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

// Lifestyle Profile
router.get('/lifestyle', authenticateToken, getLifestyle);
router.post('/lifestyle', authenticateToken, updateLifestyle);
router.put('/lifestyle', authenticateToken, updateLifestyle);

// Daily Plans
router.get('/today', authenticateToken, getTodayPlan);
router.post('/generate', authenticateToken, generatePlan);
router.get('/history', authenticateToken, getPlanHistory);
router.patch('/activity/:activityId/status', authenticateToken, updateActivityStatus);
router.post('/activity/:activityId/swap', authenticateToken, swapActivityWithAlternative);
router.post('/activity/custom', authenticateToken, addCustomActivity);

// Family Profiles
router.get('/family', authenticateToken, getFamilyProfiles);
router.post('/family', authenticateToken, createFamilyProfile);
router.delete('/family/:id', authenticateToken, deleteFamilyProfile);
router.get('/family/recommendations', authenticateToken, getFamilyRecommendations);

// Reminders
router.get('/reminders', authenticateToken, getReminders);
router.put('/reminders/:id', authenticateToken, toggleReminder);

export default router;
