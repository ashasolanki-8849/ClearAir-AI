import { IDailyPlan, IPlannedActivity } from '../models/DailyPlan.js';
import { AQIResponseData } from './aqiService.js';

export interface PlanRecalculationResult {
  updated: boolean;
  reason: string;
  plan: IDailyPlan;
}

export const recalculatePlanWithLiveAQI = (
  plan: IDailyPlan,
  currentAqiData: AQIResponseData,
  force: boolean = false
): PlanRecalculationResult => {
  const oldAqi = plan.lastCalculatedAqi || plan.environmentalContext?.aqi || 0;
  const newAqi = currentAqiData.aqi;
  const aqiDiff = Math.abs(newAqi - oldAqi);
  const oldCategory = plan.environmentalContext?.aqiCategory || '';
  const newCategory = currentAqiData.aqiCategory;

  const categoryShift = oldCategory !== newCategory;
  const significantChange = aqiDiff >= 20 || categoryShift;

  if (!significantChange && !force) {
    return {
      updated: false,
      reason: 'Ambient AQI variation is within normal threshold (<20 pts); schedule remains optimal.',
      plan,
    };
  }

  const isWorsening = newAqi > oldAqi && newAqi > 200;
  const isImproving = newAqi < oldAqi && newAqi <= 150;

  // Update environmental context
  plan.environmentalContext = {
    locationName: currentAqiData.location.name,
    city: currentAqiData.location.city,
    lat: currentAqiData.location.lat,
    lon: currentAqiData.location.lon,
    aqi: newAqi,
    aqiCategory: newCategory,
    pm25: currentAqiData.pollutants.pm25,
    pm10: currentAqiData.pollutants.pm10,
    temperature: currentAqiData.weather.temperature,
    timestamp: new Date(),
  };
  plan.lastCalculatedAqi = newAqi;

  let adjustmentsMade = 0;

  // Re-evaluate pending activities
  plan.activities = plan.activities.map((act) => {
    // If activity is already completed or skipped, preserve user state
    if (act.status !== 'pending') return act;

    if (isWorsening && act.indoorOutdoor === 'outdoor') {
      // Auto-swap outdoor activity with safer indoor alternative
      adjustmentsMade++;
      return {
        ...act,
        indoorOutdoor: 'indoor',
        pollutionRisk: newAqi >= 400 ? 'severe' : 'high',
        activity: act.alternativeActivity || `Indoor alternative: ${act.activity}`,
        reason: `AQI escalated to ${newAqi} (${newCategory}). Outdoor exposure has been dynamically substituted with pre-calculated indoor alternative.`,
        isAlternativeApplied: true,
      };
    } else if (isImproving && act.indoorOutdoor === 'indoor' && act.period === 'afternoon') {
      // Identify opportunity
      adjustmentsMade++;
      return {
        ...act,
        pollutionRisk: 'moderate',
        reason: `Air quality improved to AQI ${newAqi} (${newCategory}). Midday ventilation and light outdoor transit are now favorable.`,
      };
    }

    return act;
  });

  // Calculate completion percentage
  const total = plan.activities.length;
  const completed = plan.activities.filter((a) => a.status === 'completed').length;
  plan.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

  // Update exposure score
  let outdoorMinutes = 0;
  let indoorMinutes = 0;
  let avoidedActions = 0;

  plan.activities.forEach((a) => {
    if (a.indoorOutdoor === 'outdoor') outdoorMinutes += 45;
    else if (a.indoorOutdoor === 'indoor') indoorMinutes += 90;
    if (a.isAlternativeApplied) avoidedActions++;
  });

  plan.exposureScore = {
    outdoorMinutes,
    indoorMinutes,
    exposureAvoidanceActions: avoidedActions,
  };

  const reason = isWorsening
    ? `Smog level increased to AQI ${newAqi} (${newCategory}). Outdoor tasks have been safeguarded with indoor alternatives.`
    : isImproving
    ? `Air quality improved to AQI ${newAqi} (${newCategory}). Moderate activity windows have opened.`
    : `Schedule refreshed with latest telemetry: AQI ${newAqi} (${newCategory}).`;

  return {
    updated: true,
    reason,
    plan,
  };
};
