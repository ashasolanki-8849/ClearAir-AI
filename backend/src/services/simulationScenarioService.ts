import mongoose from 'mongoose';
import { 
  PollutionSimulation, 
  IPollutionSimulation,
  ISimulationParameters,
  ScenarioType
} from '../models/PollutionSimulation.js';
import { runSimulationCalculation, getSimulationBaseline } from './simulationEngineService.js';
import { generateAIScenarioAnalysis } from './simulationAdvisorService.js';

export interface ScenarioPreset {
  id: string;
  name: string;
  scenarioType: ScenarioType;
  description: string;
  badge: string;
  difficulty: 'Easy' | 'Moderate' | 'Ambitious';
  parameters: ISimulationParameters;
}

export const SCENARIO_PRESETS: ScenarioPreset[] = [
  {
    id: 'clean_commute_surge',
    name: 'Clean Commute & Metro Surge',
    scenarioType: 'transport_shift',
    description: 'Models a 40% reduction in private ICE cars combined with a 50% shift to public mass transit and urban metro rail.',
    badge: 'Commuter Mobility',
    difficulty: 'Moderate',
    parameters: {
      vehicleReductionPct: 40,
      publicTransitAdoptionPct: 50,
      evAdoptionPct: 20,
      householdsIndoorPurifiedCount: 0,
      treesPlantedCount: 500,
      constructionDustMitigationPct: 15,
      industrialEmissionReductionPct: 0,
      wasteBurningBanCompliancePct: 10,
      peakHourOutdoorAvoidancePct: 25,
      carpoolingHouseholdsCount: 200,
    },
  },
  {
    id: 'society_zero_burn_carpool',
    name: 'Society Zero-Burn & Group Carpool',
    scenarioType: 'carpooling_society',
    description: 'Housing societies ban all garden waste and biomass burning while coordinating 300 member carpooling rosters.',
    badge: 'Residential RWAs',
    difficulty: 'Easy',
    parameters: {
      vehicleReductionPct: 25,
      publicTransitAdoptionPct: 15,
      evAdoptionPct: 10,
      householdsIndoorPurifiedCount: 150,
      treesPlantedCount: 200,
      constructionDustMitigationPct: 20,
      industrialEmissionReductionPct: 0,
      wasteBurningBanCompliancePct: 85,
      peakHourOutdoorAvoidancePct: 30,
      carpoolingHouseholdsCount: 300,
    },
  },
  {
    id: 'winter_inversion_shield',
    name: 'Winter Smog Inversion Protection',
    scenarioType: 'peak_hour_avoidance',
    description: 'Designed specifically for cold stagnant mornings: 500 households run True HEPA purifiers and shift morning outdoor exercise to midday.',
    badge: 'Public Health Shield',
    difficulty: 'Easy',
    parameters: {
      vehicleReductionPct: 15,
      publicTransitAdoptionPct: 10,
      evAdoptionPct: 5,
      householdsIndoorPurifiedCount: 500,
      treesPlantedCount: 100,
      constructionDustMitigationPct: 25,
      industrialEmissionReductionPct: 10,
      wasteBurningBanCompliancePct: 60,
      peakHourOutdoorAvoidancePct: 75,
      carpoolingHouseholdsCount: 100,
    },
  },
  {
    id: 'citywide_dust_industrial_abatement',
    name: 'Citywide Dust Suppression & Industrial Abatement',
    scenarioType: 'dust_control',
    description: 'Municipal misting of arterial corridors, strict construction perimeter curtains, and 40% industrial flue-gas reduction.',
    badge: 'Municipal Infrastructure',
    difficulty: 'Ambitious',
    parameters: {
      vehicleReductionPct: 20,
      publicTransitAdoptionPct: 25,
      evAdoptionPct: 15,
      householdsIndoorPurifiedCount: 50,
      treesPlantedCount: 2000,
      constructionDustMitigationPct: 70,
      industrialEmissionReductionPct: 40,
      wasteBurningBanCompliancePct: 70,
      peakHourOutdoorAvoidancePct: 20,
      carpoolingHouseholdsCount: 250,
    },
  },
  {
    id: 'maximum_urban_climate_action',
    name: 'Comprehensive Clean Air Transformation',
    scenarioType: 'community_wide',
    description: 'All levers actively engaged: 60% vehicle cut, 100% waste burning ban, 10,000 urban trees, and widespread indoor air filtration.',
    badge: 'Gold Standard',
    difficulty: 'Ambitious',
    parameters: {
      vehicleReductionPct: 60,
      publicTransitAdoptionPct: 60,
      evAdoptionPct: 50,
      householdsIndoorPurifiedCount: 1000,
      treesPlantedCount: 10000,
      constructionDustMitigationPct: 75,
      industrialEmissionReductionPct: 50,
      wasteBurningBanCompliancePct: 95,
      peakHourOutdoorAvoidancePct: 80,
      carpoolingHouseholdsCount: 1000,
    },
  },
];

export const getSimulationPresets = (): ScenarioPreset[] => {
  return SCENARIO_PRESETS;
};

/**
 * Recommendation Engine: Evaluates the current simulation and provides 4 structured recommendations
 */
export const getSimulationRecommendations = async (
  baselineAqi: number,
  city: string = 'Delhi'
) => {
  return {
    bestAchievable: {
      title: 'Comprehensive Clean Air Transformation',
      subtitle: 'Targeting up to 45%–55% citywide PM2.5 reduction',
      levers: ['60% Vehicle Cut', '95% Waste Ban', '10,000 Trees', '80% Dust Suppression'],
      estimatedAqiReduction: Math.round(baselineAqi * 0.45),
      effortLevel: 'High / Multi-stakeholder',
      whySuggested: 'Maximizes both planetary climate mitigation and breathing zone toxic aerosol prevention across all municipal sectors.',
    },
    mostPractical: {
      title: 'Clean Commute & Metro Surge',
      subtitle: 'Achievable immediately using existing transit corridors',
      levers: ['40% Vehicle Cut', '50% Metro Transit', '200 Carpools'],
      estimatedAqiReduction: Math.round(baselineAqi * 0.22),
      effortLevel: 'Moderate',
      whySuggested: 'Does not require new infrastructure; leverages existing urban rail and bus networks for high per-capita emission reductions.',
    },
    lowestEffort: {
      title: 'Society Zero-Burn & Doorway Protection',
      subtitle: 'Immediate neighborhood wins within residential societies',
      levers: ['100% Leaf Composting', 'No Night Waste Fires', 'Indoor Night Filtration'],
      estimatedAqiReduction: Math.round(baselineAqi * 0.16),
      effortLevel: 'Low',
      whySuggested: 'Can be mandated by an apartment RWA within 24 hours, directly eliminating primary ground-level carcinogens from courtyards.',
    },
    highestHealthBenefit: {
      title: 'Winter Inversion Diurnal Shield',
      subtitle: 'Focuses directly on personal lung deposition avoidance',
      levers: ['HEPA Bedroom Purification', 'Shift Morning Outdoor Exercise to Midday'],
      estimatedAqiReduction: Math.round(baselineAqi * 0.28),
      effortLevel: 'Low to Moderate',
      whySuggested: 'Protects children and asthma patients by cutting inhaled pulmonary doses by over 60% during deadly morning inversion spikes.',
    },
  };
};

/**
 * Saves a simulation scenario for an authenticated user
 */
export const saveSimulationScenario = async (
  userId: string,
  data: {
    name: string;
    scenarioType?: ScenarioType;
    description?: string;
    parameters: ISimulationParameters;
    tags?: string[];
  }
): Promise<IPollutionSimulation> => {
  const baseline = await getSimulationBaseline();
  const { results, assumptions } = runSimulationCalculation(baseline, data.parameters);
  const aiAnalysis = await generateAIScenarioAnalysis(baseline, data.parameters, results);

  const simulation = new PollutionSimulation({
    userId: new mongoose.Types.ObjectId(userId),
    name: data.name || 'Saved What-if Scenario',
    scenarioType: data.scenarioType || 'custom_multivariate',
    description: data.description,
    parameters: data.parameters,
    baselineData: baseline,
    results,
    scientificAssumptions: assumptions,
    aiAnalysis,
    isSaved: true,
    tags: data.tags || ['custom'],
  });

  return simulation.save();
};

export const getSavedScenariosByUser = async (userId: string): Promise<IPollutionSimulation[]> => {
  return PollutionSimulation.find({
    userId: new mongoose.Types.ObjectId(userId),
    isSaved: true,
  })
    .sort({ createdAt: -1 })
    .lean() as any;
};

export const getSimulationById = async (
  simulationId: string,
  userId?: string
): Promise<IPollutionSimulation | null> => {
  const query: any = { _id: simulationId };
  if (userId) {
    query.userId = new mongoose.Types.ObjectId(userId);
  }
  return PollutionSimulation.findOne(query);
};

export const updateSavedScenario = async (
  simulationId: string,
  userId: string,
  updates: { name?: string; description?: string; tags?: string[] }
): Promise<IPollutionSimulation | null> => {
  return PollutionSimulation.findOneAndUpdate(
    { _id: simulationId, userId: new mongoose.Types.ObjectId(userId) },
    { $set: updates },
    { new: true }
  );
};

export const deleteSavedScenario = async (
  simulationId: string,
  userId: string
): Promise<boolean> => {
  const res = await PollutionSimulation.deleteOne({
    _id: simulationId,
    userId: new mongoose.Types.ObjectId(userId),
  });
  return res.deletedCount > 0;
};

/**
 * Compares up to 4 simulation scenarios side-by-side
 */
export const compareMultipleScenarios = async (simulationIds: string[]) => {
  const scenarios = await PollutionSimulation.find({
    _id: { $in: simulationIds.map((id) => new mongoose.Types.ObjectId(id)) },
  }).lean();

  return scenarios.map((s) => ({
    id: s._id,
    name: s.name,
    scenarioType: s.scenarioType,
    parameters: s.parameters,
    simulatedAqi: s.results.simulatedAqi,
    aqiChange: s.results.aqiChange,
    pm25ReductionPct: s.results.pm25ReductionPct,
    pm10ReductionPct: s.results.pm10ReductionPct,
    tailpipeEmissionsAvoidedKgCO2e: s.results.tailpipeEmissionsAvoidedKgCO2e,
    personalInhaledDoseAvoidedGrams: s.results.personalInhaledDoseAvoidedGrams,
    communityParticipants: s.results.communityImpact.totalHouseholdParticipants,
    confidenceLevel: s.aiAnalysis?.confidenceLevel || 'Indicative',
  }));
};
