import { apiClient } from './api';
import {
  SimulationParametersData,
  SimulationBaselineData,
  SimulationResultsData,
  SimulationAIAnalysisData,
  ScenarioPresetData,
  ScenarioRecommendationsData,
  SavedScenarioData,
  ScenarioComparisonItem,
} from '../types';

export const simulationService = {
  // 1. Calculate What-if Simulation
  calculateSimulation: async (data: {
    parameters: SimulationParametersData;
    baseline?: SimulationBaselineData;
    userProfile?: any;
    lat?: number;
    lon?: number;
    city?: string;
  }): Promise<{
    success: boolean;
    baseline: SimulationBaselineData;
    results: SimulationResultsData;
    assumptions: string[];
    error?: string;
  }> => {
    return apiClient('/simulator/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 2. Generate AI Explanation for Scenario
  analyzeScenarioWithAI: async (data: {
    baseline: SimulationBaselineData;
    parameters: SimulationParametersData;
    results: SimulationResultsData;
    userProfile?: any;
  }): Promise<{
    success: boolean;
    analysis: SimulationAIAnalysisData;
    error?: string;
  }> => {
    return apiClient('/simulator/ai-analysis', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. Get Pre-configured Presets
  getPresets: async (): Promise<{
    success: boolean;
    presets: ScenarioPresetData[];
    error?: string;
  }> => {
    return apiClient('/simulator/presets');
  },

  // 4. Get Recommendations
  getRecommendations: async (
    aqi: number = 260,
    city: string = 'Delhi'
  ): Promise<{
    success: boolean;
    recommendations: ScenarioRecommendationsData;
    error?: string;
  }> => {
    return apiClient(`/simulator/recommendations?aqi=${aqi}&city=${encodeURIComponent(city)}`);
  },

  // 5. Get Real-Time Baseline
  getBaseline: async (
    lat: number = 28.6139,
    lon: number = 77.2090,
    city: string = 'Delhi'
  ): Promise<{
    success: boolean;
    baseline: SimulationBaselineData;
    error?: string;
  }> => {
    return apiClient(`/simulator/baseline?lat=${lat}&lon=${lon}&city=${encodeURIComponent(city)}`);
  },

  // 6. Save Scenario
  saveScenario: async (data: {
    name: string;
    scenarioType?: string;
    description?: string;
    parameters: SimulationParametersData;
    tags?: string[];
  }): Promise<{
    success: boolean;
    scenario: SavedScenarioData;
    error?: string;
  }> => {
    return apiClient('/simulator/save', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 7. Get Saved Scenarios
  getSavedScenarios: async (): Promise<{
    success: boolean;
    scenarios: SavedScenarioData[];
    error?: string;
  }> => {
    return apiClient('/simulator/saved');
  },

  // 8. Get Scenario by ID
  getScenarioById: async (id: string): Promise<{
    success: boolean;
    scenario: SavedScenarioData;
    error?: string;
  }> => {
    return apiClient(`/simulator/saved/${id}`);
  },

  // 9. Update Saved Scenario
  updateScenario: async (
    id: string,
    data: { name?: string; description?: string; tags?: string[] }
  ): Promise<{
    success: boolean;
    scenario: SavedScenarioData;
    error?: string;
  }> => {
    return apiClient(`/simulator/saved/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  // 10. Delete Saved Scenario
  deleteScenario: async (id: string): Promise<{
    success: boolean;
    message?: string;
    error?: string;
  }> => {
    return apiClient(`/simulator/saved/${id}`, {
      method: 'DELETE',
    });
  },

  // 11. Compare Scenarios
  compareScenarios: async (scenarioIds: string[]): Promise<{
    success: boolean;
    comparisons: ScenarioComparisonItem[];
    error?: string;
  }> => {
    return apiClient('/simulator/compare', {
      method: 'POST',
      body: JSON.stringify({ scenarioIds }),
    });
  },
};
export default simulationService;
