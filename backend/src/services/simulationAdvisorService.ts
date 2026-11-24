import axios from 'axios';
import { 
  ISimulationParameters, 
  IBaselineData, 
  ISimulationResults, 
  ISimulationAIAnalysis 
} from '../models/PollutionSimulation.js';

export const generateAIScenarioAnalysis = async (
  baseline: IBaselineData,
  params: ISimulationParameters,
  results: ISimulationResults,
  userProfile?: any
): Promise<ISimulationAIAnalysis> => {
  const geminiApiKey = process.env.GEMINI_API_KEY;

  if (geminiApiKey) {
    try {
      const prompt = `
You are an expert Environmental Data Scientist and Public Health Engineer for ClearAir AI.
Analyze the following hypothetical atmospheric simulation scenario:

Baseline Air Quality:
- Location: ${baseline.city} (${baseline.stationName || 'Urban Airshed'})
- Ambient AQI: ${baseline.currentAqi}
- PM2.5: ${baseline.currentPm25} ug/m3, PM10: ${baseline.currentPm10} ug/m3
- Temperature: ${baseline.temperature}°C, Wind Speed: ${baseline.windSpeed} km/h

Simulation Levers Applied:
- Vehicle Usage Reduction: ${params.vehicleReductionPct}%
- Public Transit Adoption: ${params.publicTransitAdoptionPct}%
- Electric Vehicle (EV) Shift: ${params.evAdoptionPct}%
- Households with True HEPA Indoor Filtration: ${params.householdsIndoorPurifiedCount}
- Urban Trees Planted: ${params.treesPlantedCount}
- Construction & Road Dust Mitigation: ${params.constructionDustMitigationPct}%
- Industrial Emissions Reduction: ${params.industrialEmissionReductionPct}%
- Waste Burning Ban Compliance: ${params.wasteBurningBanCompliancePct}%
- Peak Hour Outdoor Activity Avoidance: ${params.peakHourOutdoorAvoidancePct}%
- Society Carpooling Households: ${params.carpoolingHouseholdsCount}

Calculated Simulation Outcomes:
- Simulated AQI: ${results.simulatedAqi} (Change: ${results.aqiChange})
- PM2.5 Reduction: ${results.pm25ReductionPct}%, PM10 Reduction: ${results.pm10ReductionPct}%
- Tailpipe Emissions Avoided: ${results.tailpipeEmissionsAvoidedKgCO2e} kg CO2e / day
- Avoided Tailpipe PM2.5: ${results.tailpipePm25AvoidedGrams} grams / day
- Personal Inhaled Dose Avoided: ${results.personalInhaledDoseAvoidedGrams} grams PM2.5

Provide an evidence-aware, understandable, and transparent scientific explanation in pure JSON format with the following keys:
{
  "whatChanges": "Short summary of the physical and lifestyle transitions in this scenario",
  "whyPollutionChanges": "Scientific explanation of source emission reduction vs. atmospheric dispersion mechanisms",
  "pollutantsAffected": ["list of specific pollutants affected like PM2.5, PM10, NOx, CO, Black Carbon"],
  "whoBenefits": "Specific vulnerable demographics and community groups benefiting most",
  "limitations": ["Array of 2-3 physical limitations like winter temperature inversions, transboundary pollution, or regional background mass"],
  "practicalActions": ["Array of 3 practical, immediate steps individuals can adopt to realize this scenario"],
  "communityParticipation": "How housing societies (RWAs), schools, or workplaces can coordinate to scale this impact",
  "confidenceLevel": "High" or "Medium" or "Indicative"
}
Output only valid JSON without markdown wrapping.`;

      const response = await axios.post(
        `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${geminiApiKey}`,
        {
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.2,
            responseMimeType: 'application/json',
          },
        },
        { timeout: 8000 }
      );

      const responseText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
      if (responseText) {
        const parsed = JSON.parse(responseText.trim());
        return {
          whatChanges: parsed.whatChanges || 'Simulated reductions across transportation, dust, and domestic burning.',
          whyPollutionChanges: parsed.whyPollutionChanges || 'Combustion sources decrease primary fine particulates while dust suppression prevents coarse aerosol re-suspension.',
          pollutantsAffected: Array.isArray(parsed.pollutantsAffected) ? parsed.pollutantsAffected : ['PM2.5', 'PM10', 'NOx', 'CO'],
          whoBenefits: parsed.whoBenefits || 'Children, elderly citizens, and asthma patients experience the highest pulmonary protection.',
          limitations: Array.isArray(parsed.limitations) ? parsed.limitations : ['Regional background pollution and winter boundary layer thermal inversions restrict maximum achievable air-mass clearing.'],
          practicalActions: Array.isArray(parsed.practicalActions) ? parsed.practicalActions : ['Car-pool for daily commutes', 'Stop open biomass burning', 'Use HEPA filtration indoors'],
          communityParticipation: parsed.communityParticipation || 'Neighborhood societies can mandate zero open burning and establish bulk transit carpools.',
          confidenceLevel: parsed.confidenceLevel === 'High' ? 'High' : parsed.confidenceLevel === 'Medium' ? 'Medium' : 'Indicative',
        };
      }
    } catch (err) {
      console.warn('Gemini API call failed for simulation analysis, utilizing deterministic rule-based analysis engine:', err);
    }
  }

  // Deterministic Scientific Rule-Based Analysis Engine (Zero-Downtime Fallback)
  return generateDeterministicAnalysis(baseline, params, results);
};

const generateDeterministicAnalysis = (
  baseline: IBaselineData,
  params: ISimulationParameters,
  results: ISimulationResults
): ISimulationAIAnalysis => {
  const isTransportDominant = (params.vehicleReductionPct + params.publicTransitAdoptionPct + params.evAdoptionPct) > 40;
  const isWasteDominant = params.wasteBurningBanCompliancePct > 40;
  const isDustDominant = params.constructionDustMitigationPct > 40;
  const isIndoorDominant = params.householdsIndoorPurifiedCount > 50 || params.peakHourOutdoorAvoidancePct > 40;

  let whatChanges = 'This scenario models a balanced municipal reduction in vehicle commuting and local fugitive dust.';
  if (isTransportDominant && isWasteDominant) {
    whatChanges = `This scenario combines a ${params.vehicleReductionPct}% cut in private vehicle usage with ${params.wasteBurningBanCompliancePct}% enforcement of open waste burning bans.`;
  } else if (isTransportDominant) {
    whatChanges = `This scenario focuses on mobility transition, reducing private vehicle trips by ${params.vehicleReductionPct}% and expanding electric/public transit adoption.`;
  } else if (isWasteDominant) {
    whatChanges = `This scenario targets localized combustion, eliminating ${params.wasteBurningBanCompliancePct}% of open biomass and municipal waste fires.`;
  } else if (isIndoorDominant) {
    whatChanges = `This scenario emphasizes personal exposure mitigation through indoor HEPA filtration across ${params.householdsIndoorPurifiedCount} households and shifting activity away from morning smog peaks.`;
  }

  const whyPollutionChanges = `Primary fine particulates (PM2.5) drop by ${results.pm25ReductionPct}% primarily because tailpipe internal combustion and solid waste smoldering directly emit ultrafine elemental carbon into the breathing zone. Eliminating these sources prevents near-ground aerosol accumulation, while meteorological dispersion clears the residual atmospheric box.`;

  const pollutants: string[] = ['PM2.5', 'PM10'];
  if (params.vehicleReductionPct > 15 || params.evAdoptionPct > 15) pollutants.push('NOx (Nitrogen Oxides)', 'CO (Carbon Monoxide)');
  if (params.wasteBurningBanCompliancePct > 20) pollutants.push('Black Carbon (Soot)', 'VOCs (Volatile Organics)');
  if (params.constructionDustMitigationPct > 20) pollutants.push('Coarse Silica & Mineral Dust');

  const whoBenefits = `Schoolchildren, elderly residents, and individuals with chronic respiratory ailments (asthma, COPD) receive the greatest immediate health benefit. Peak inhaled PM2.5 dose is reduced by approximately ${(results.personalInhaledDoseAvoidedGrams * 1000).toFixed(1)} milligrams per commuter.`;

  const limitations = [
    'Winter meteorological thermal inversions trap residual ground emissions in low planetary boundary layers (100–300m).',
    'Transboundary regional air mass (such as regional agricultural fires and cross-border industrial plumes) continues to sustain background baseline pollution.',
    'Hypothetical simulations assume uniform airshed mixing and do not account for localized micro-corridor wind eddies.',
  ];

  const practicalActions = [
    params.vehicleReductionPct > 0 ? 'Switch 2–3 commute days to Metro or registered society carpools' : 'Adopt low-emission mass transit for daily journeys',
    params.wasteBurningBanCompliancePct > 0 ? 'Ensure all garden leaf litter is diverted to decentralized composting rather than open burning' : 'Compost organic wet waste locally',
    params.householdsIndoorPurifiedCount > 0 ? 'Run True HEPA H13 purifiers in sealed sleeping areas during peak nocturnal smog hours' : 'Seal door draft gaps during high AQI alerts',
  ];

  const communityParticipation = `Apartment associations (RWAs) and workplaces can institute group carpooling rosters, provide guard cabins with electric blowers instead of night scrap-fires, and mist perimeter roadways to suppress resuspended dust.`;

  return {
    whatChanges,
    whyPollutionChanges,
    pollutantsAffected: pollutants,
    whoBenefits,
    limitations,
    practicalActions,
    communityParticipation,
    confidenceLevel: results.pm25ReductionPct > 30 ? 'High' : 'Medium',
  };
};
