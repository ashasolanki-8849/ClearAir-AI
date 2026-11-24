import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import {
  runSimulationCalculation,
  getSimulationBaseline,
} from '../services/simulationEngineService.js';
import { generateAIScenarioAnalysis } from '../services/simulationAdvisorService.js';
import {
  getSimulationPresets,
  getSimulationRecommendations,
  saveSimulationScenario,
  getSavedScenariosByUser,
  getSimulationById,
  updateSavedScenario,
  deleteSavedScenario,
  compareMultipleScenarios,
} from '../services/simulationScenarioService.js';

/**
 * 1. Calculate What-if Simulation
 */
export const calculateSimulation = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { parameters, baseline: customBaseline, userProfile, lat, lon, city } = req.body;

    if (!parameters) {
      res.status(400).json({ success: false, error: 'Simulation parameters are required' });
      return;
    }

    const baseline =
      customBaseline ||
      (await getSimulationBaseline(
        Number(lat) || 28.6139,
        Number(lon) || 77.2090,
        city || 'Delhi'
      ));

    const { results, assumptions } = runSimulationCalculation(
      baseline,
      parameters,
      userProfile
    );

    res.json({
      success: true,
      baseline,
      results,
      assumptions,
    });
  } catch (err: any) {
    console.error('Error calculating simulation:', err);
    res.status(500).json({ success: false, error: err.message || 'Simulation calculation failed' });
  }
};

/**
 * 2. Generate AI Explanation for Scenario
 */
export const analyzeScenarioWithAI = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { baseline, parameters, results, userProfile } = req.body;

    if (!baseline || !parameters || !results) {
      res.status(400).json({
        success: false,
        error: 'Baseline, parameters, and calculation results are required for AI analysis',
      });
      return;
    }

    const analysis = await generateAIScenarioAnalysis(
      baseline,
      parameters,
      results,
      userProfile
    );

    res.json({
      success: true,
      analysis,
    });
  } catch (err: any) {
    console.error('Error generating AI simulation analysis:', err);
    res.status(500).json({ success: false, error: err.message || 'AI analysis failed' });
  }
};

/**
 * 3. Get Pre-configured Simulation Presets
 */
export const getPresets = async (
  _req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const presets = getSimulationPresets();
    res.json({
      success: true,
      presets,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve simulation presets' });
  }
};

/**
 * 4. Get Structured Scenario Recommendations
 */
export const getRecommendations = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const aqi = Number(req.query.aqi) || 260;
    const city = (req.query.city as string) || 'Delhi';

    const recommendations = await getSimulationRecommendations(aqi, city);
    res.json({
      success: true,
      recommendations,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve recommendations' });
  }
};

/**
 * 5. Get Real-Time Simulation Baseline Telemetry
 */
export const getBaseline = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || 28.6139;
    const lon = Number(req.query.lon) || 77.2090;
    const city = (req.query.city as string) || 'Delhi';

    const baseline = await getSimulationBaseline(lat, lon, city);
    res.json({
      success: true,
      baseline,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve baseline telemetry' });
  }
};

/**
 * 6. Save Simulation Scenario
 */
export const saveScenario = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const scenario = await saveSimulationScenario(userId, req.body);
    res.status(201).json({
      success: true,
      scenario,
    });
  } catch (err: any) {
    console.error('Error saving simulation scenario:', err);
    res.status(500).json({ success: false, error: err.message || 'Failed to save scenario' });
  }
};

/**
 * 7. List Saved Scenarios for User
 */
export const getSavedScenarios = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const userId = req.user?.id || 'demo-user-id';
    const scenarios = await getSavedScenariosByUser(userId);
    res.json({
      success: true,
      scenarios,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve saved scenarios' });
  }
};

/**
 * 8. Get Scenario by ID
 */
export const getScenarioById = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const scenario = await getSimulationById(id);
    if (!scenario) {
      res.status(404).json({ success: false, error: 'Scenario not found' });
      return;
    }
    res.json({
      success: true,
      scenario,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to retrieve scenario' });
  }
};

/**
 * 9. Update / Rename Saved Scenario
 */
export const updateScenario = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user-id';
    const updated = await updateSavedScenario(id, userId, req.body);
    if (!updated) {
      res.status(404).json({ success: false, error: 'Scenario not found or unauthorized' });
      return;
    }
    res.json({
      success: true,
      scenario: updated,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to update scenario' });
  }
};

/**
 * 10. Delete Saved Scenario
 */
export const deleteScenario = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id || 'demo-user-id';
    const deleted = await deleteSavedScenario(id, userId);
    if (!deleted) {
      res.status(404).json({ success: false, error: 'Scenario not found or unauthorized' });
      return;
    }
    res.json({
      success: true,
      message: 'Scenario deleted successfully',
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to delete scenario' });
  }
};

/**
 * 11. Compare Multiple Scenarios Side-by-Side
 */
export const compareScenarios = async (
  req: AuthenticatedRequest,
  res: Response
): Promise<void> => {
  try {
    const { scenarioIds } = req.body;
    if (!Array.isArray(scenarioIds) || scenarioIds.length === 0) {
      res.status(400).json({ success: false, error: 'scenarioIds array is required' });
      return;
    }
    const comparisons = await compareMultipleScenarios(scenarioIds);
    res.json({
      success: true,
      comparisons,
    });
  } catch (err: any) {
    res.status(500).json({ success: false, error: 'Failed to compare scenarios' });
  }
};
