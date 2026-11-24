import { Router } from 'express';
import {
  authenticateToken as requireAuth,
  optionalAuthenticateToken as optionalAuth,
} from '../middleware/authMiddleware.js';
import * as controller from '../controllers/impactController.js';

export const impactRouter = Router();

// Dashboard & Summary
impactRouter.get('/dashboard', optionalAuth, controller.getDashboard);
impactRouter.get('/summary', optionalAuth, controller.getSummary);
impactRouter.get('/trends', optionalAuth, controller.getTrends);
impactRouter.get('/insights', optionalAuth, controller.getSmartInsights);

// Carbon Footprint Calculations & History
impactRouter.post('/carbon/calculate', optionalAuth, controller.calculateCarbonGeneral);
impactRouter.get('/carbon/history', optionalAuth, controller.getCarbonHistory);
impactRouter.get('/carbon/summary', optionalAuth, controller.getSummary);

impactRouter.post('/transport/calculate', optionalAuth, controller.calculateTransport);
impactRouter.get('/transport/history', optionalAuth, controller.getCarbonHistory);

impactRouter.post('/energy/calculate', optionalAuth, controller.calculateEnergy);
impactRouter.get('/energy/history', optionalAuth, controller.getCarbonHistory);

impactRouter.post('/waste/record', optionalAuth, controller.calculateWaste);
impactRouter.get('/waste/history', optionalAuth, controller.getCarbonHistory);

impactRouter.post('/water/record', optionalAuth, controller.calculateWater);
impactRouter.get('/water/history', optionalAuth, controller.getCarbonHistory);

// Activity Logger
impactRouter.get('/activities', optionalAuth, controller.getActivities);
impactRouter.post('/activities', requireAuth, controller.logActivity);
impactRouter.get('/activities/:id', optionalAuth, controller.getActivityById);
impactRouter.put('/activities/:id', requireAuth, controller.updateActivity);
impactRouter.delete('/activities/:id', requireAuth, controller.deleteActivity);

// Comparison & Local Pollution Awareness
impactRouter.get('/compare', optionalAuth, controller.comparePeriods);
impactRouter.post('/compare', optionalAuth, controller.comparePeriods);
impactRouter.get('/local-pollution', optionalAuth, controller.getLocalPollutionAwareness);

// Environmental Goals
impactRouter.get('/goals', optionalAuth, controller.getGoals);
impactRouter.post('/goals', requireAuth, controller.createGoal);
impactRouter.patch('/goals/:id/progress', requireAuth, controller.updateGoalProgress);
impactRouter.patch('/goals/:id/status', requireAuth, controller.updateGoalStatus);
impactRouter.delete('/goals/:id', requireAuth, controller.deleteGoal);

// Family & Community Integrations
impactRouter.get('/family', optionalAuth, controller.getFamilySummary);
impactRouter.get('/family/summary', optionalAuth, controller.getFamilySummary);
impactRouter.get('/community/:communityId', optionalAuth, controller.getCommunityImpactSummary);
impactRouter.get('/community/:communityId/summary', optionalAuth, controller.getCommunityImpactSummary);

// AI Impact Advisor
impactRouter.post('/assistant/chat', optionalAuth, controller.askImpactAdvisor);

// Reports Generation & Exports
impactRouter.post('/reports/generate', requireAuth, controller.generateReport);
impactRouter.get('/reports', optionalAuth, controller.getReports);
impactRouter.get('/reports/:id', optionalAuth, controller.getReportById);
impactRouter.get('/reports/:id/download', optionalAuth, controller.downloadReportCsv);

// Data Quality & Emission Factors
impactRouter.get('/emission-factors', optionalAuth, controller.getEmissionFactors);
impactRouter.get('/data-quality', optionalAuth, controller.getDataQuality);

export default impactRouter;
