import { Router } from 'express';
import {
  authenticateToken as requireAuth,
  optionalAuthenticateToken as optionalAuth,
} from '../middleware/authMiddleware.js';
import * as controller from '../controllers/simulationController.js';

export const simulationRouter = Router();

// Simulation Computation & Telemetry Baseline
simulationRouter.post('/calculate', optionalAuth, controller.calculateSimulation);
simulationRouter.get('/baseline', optionalAuth, controller.getBaseline);
simulationRouter.post('/ai-analysis', optionalAuth, controller.analyzeScenarioWithAI);

// Presets & Recommendations
simulationRouter.get('/presets', optionalAuth, controller.getPresets);
simulationRouter.get('/recommendations', optionalAuth, controller.getRecommendations);

// Saved Scenarios Management
simulationRouter.post('/save', optionalAuth, controller.saveScenario);
simulationRouter.get('/saved', optionalAuth, controller.getSavedScenarios);
simulationRouter.get('/saved/:id', optionalAuth, controller.getScenarioById);
simulationRouter.put('/saved/:id', optionalAuth, controller.updateScenario);
simulationRouter.delete('/saved/:id', optionalAuth, controller.deleteScenario);

// Scenario Comparison
simulationRouter.post('/compare', optionalAuth, controller.compareScenarios);

export default simulationRouter;
