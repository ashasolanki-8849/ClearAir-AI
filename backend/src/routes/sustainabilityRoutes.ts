import { Router } from 'express';
import { optionalAuthenticateToken as optionalAuth } from '../middleware/authMiddleware.js';
import {
  getSustainabilityDashboard,
  getRecommendations,
  generateRecommendations,
  getRecommendationById,
  updateRecommendationStatus,
  getProfile,
  updateProfileHandler,
  getAlternatives,
  getLocalSolutions,
  chatWithAdvisor,
  calculateImpactHandler,
  getImpactHistory,
  getImpactSummaryHandler,
  getChallenges,
  startChallenge,
  updateChallengeProgress,
  getChallengeProgress,
  getHousehold,
  addHouseholdGoalHandler,
  updateHouseholdGoalHandler,
  getHistory,
  getComparisonsHandler,
} from '../controllers/sustainabilityController.js';

const router = Router();

// Dashboard
router.get('/dashboard', optionalAuth, getSustainabilityDashboard);

// Recommendations
router.get('/recommendations', optionalAuth, getRecommendations);
router.post('/recommendations/generate', optionalAuth, generateRecommendations);
router.get('/recommendations/:id', optionalAuth, getRecommendationById);
router.patch('/recommendations/:id/status', optionalAuth, updateRecommendationStatus);

// Profile
router.get('/profile', optionalAuth, getProfile);
router.post('/profile', optionalAuth, updateProfileHandler);
router.put('/profile', optionalAuth, updateProfileHandler);

// Budget Alternatives
router.get('/alternatives', getAlternatives);
router.post('/alternatives', getAlternatives);

// Local Solutions ("Solutions Available Around Me")
router.get('/local-solutions', getLocalSolutions);

// AI Sustainable Lifestyle Advisor
router.post('/assistant/chat', optionalAuth, chatWithAdvisor);
router.get('/assistant/history', optionalAuth, (req: any, res: any) => {
  res.status(200).json({ success: true, history: [] });
});

// Environmental Impact Calculator
router.post('/impact/calculate', optionalAuth, calculateImpactHandler);
router.get('/impact/history', optionalAuth, getImpactHistory);
router.get('/impact/summary', optionalAuth, getImpactSummaryHandler);

// 7-Day Sustainable Living Challenges
router.get('/challenges', getChallenges);
router.post('/challenges/start', optionalAuth, startChallenge);
router.patch('/challenges/:id/progress', optionalAuth, updateChallengeProgress);
router.get('/challenges/progress', optionalAuth, getChallengeProgress);

// Household Sustainability
router.get('/household', optionalAuth, getHousehold);
router.post('/household/goals', optionalAuth, addHouseholdGoalHandler);
router.patch('/household/goals/:id', optionalAuth, updateHouseholdGoalHandler);

// Sustainability History & Lifestyle Comparisons
router.get('/history', optionalAuth, getHistory);
router.get('/comparison', optionalAuth, getComparisonsHandler);

export default router;
