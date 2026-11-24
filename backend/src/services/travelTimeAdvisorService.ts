export interface DepartureWindowOption {
  windowId: string;
  id?: string;
  name?: string;
  timeRange: string;
  label: string;
  expectedAqiCondition: 'favorable' | 'moderate' | 'unfavorable' | 'hazardous';
  trafficExpectation: 'low' | 'moderate' | 'heavy' | 'severe';
  trafficMultiplier?: number;
  ambientAqiExpected?: number;
  atmosphericCondition?: string;
  inversionRisk?: boolean;
  solarMixingDispersion?: boolean;
  recommendationLevel?: 'optimal' | 'acceptable' | 'avoid_if_possible' | 'critical_smog_peak';
  explanation?: string;
  estimatedDurationMins: number;
  exposureRating: 'low' | 'moderate' | 'high' | 'severe';
  recommendationNote: string;
  isRecommended: boolean;
}

export interface TravelTimeAdviceResult {
  recommendedWindowId: string;
  bestWindow?: string;
  currentWindow?: string;
  headline: string;
  recommendationExplanation: string;
  meteorologicalExplanation?: string;
  inversionLayerNotice?: string;
  windows: DepartureWindowOption[];
  dataTimestamp: string;
  scientificContext: string;
}

export const evaluateDepartureTimeWindows = (
  currentAqi: number = 150,
  baseDurationMins: number = 35
): TravelTimeAdviceResult => {
  const isSevereDay = currentAqi >= 300;
  const isModerateDay = currentAqi <= 150;

  const rawWindows: DepartureWindowOption[] = [
    {
      windowId: 'morning_rush',
      id: 'morning_rush',
      name: 'Morning Peak Commute',
      timeRange: '08:00 – 10:00',
      label: 'Morning Peak Commute',
      expectedAqiCondition: isSevereDay ? 'hazardous' : 'unfavorable',
      trafficExpectation: 'severe',
      trafficMultiplier: 1.5,
      ambientAqiExpected: Math.round(currentAqi * 1.25),
      atmosphericCondition: 'Cold nocturnal thermal inversion holds heavy PM2.5 at breathing height',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'critical_smog_peak',
      explanation: 'Cold nocturnal thermal inversion holds heavy PM2.5 at breathing height; peak school/office traffic causes bumper-to-bumper tailpipe idling.',
      estimatedDurationMins: Math.round(baseDurationMins * 1.4),
      exposureRating: 'severe',
      recommendationNote:
        'Cold nocturnal thermal inversion holds heavy PM2.5 at breathing height; peak school/office traffic causes bumper-to-bumper tailpipe idling.',
      isRecommended: false,
    },
    {
      windowId: 'midday_optimal',
      id: 'midday_solar_mixing',
      name: 'Midday Solar Mixing Window',
      timeRange: '12:00 – 15:30',
      label: 'Midday Solar Mixing Window',
      expectedAqiCondition: isModerateDay ? 'favorable' : 'moderate',
      trafficExpectation: 'low',
      trafficMultiplier: 0.95,
      ambientAqiExpected: Math.round(currentAqi * 0.75),
      atmosphericCondition: 'Maximum vertical atmospheric mixing disperses ground-level smog plumes',
      inversionRisk: false,
      solarMixingDispersion: true,
      recommendationLevel: 'optimal',
      explanation: 'Maximum vertical atmospheric mixing disperses ground-level smog plumes; off-peak road conditions cut stop-and-go idling.',
      estimatedDurationMins: Math.round(baseDurationMins * 0.95),
      exposureRating: isModerateDay ? 'low' : 'moderate',
      recommendationNote:
        'Maximum vertical atmospheric mixing disperses ground-level smog plumes; off-peak road conditions cut stop-and-go idling.',
      isRecommended: true,
    },
    {
      windowId: 'evening_rush',
      id: 'evening_rush',
      name: 'Evening Commute Peak',
      timeRange: '17:30 – 20:30',
      label: 'Evening Commute Peak',
      expectedAqiCondition: 'unfavorable',
      trafficExpectation: 'heavy',
      trafficMultiplier: 1.35,
      ambientAqiExpected: Math.round(currentAqi * 1.15),
      atmosphericCondition: 'Commuter traffic merges with cooling twilight boundary layer',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'avoid_if_possible',
      explanation: 'Commuter traffic merges with cooling twilight boundary layer, leading to secondary roadside particulate spikes.',
      estimatedDurationMins: Math.round(baseDurationMins * 1.35),
      exposureRating: 'high',
      recommendationNote:
        'Commuter traffic merges with cooling twilight boundary layer, leading to secondary roadside particulate spikes.',
      isRecommended: false,
    },
    {
      windowId: 'night_recovery',
      id: 'night_inversion',
      name: 'Late Night Transit Window',
      timeRange: '21:30 – 23:30',
      label: 'Late Night Transit Window',
      expectedAqiCondition: 'moderate',
      trafficExpectation: 'low',
      trafficMultiplier: 0.85,
      ambientAqiExpected: Math.round(currentAqi * 1.05),
      atmosphericCondition: 'Zero passenger road traffic, though late-night thermal inversion remains active',
      inversionRisk: true,
      solarMixingDispersion: false,
      recommendationLevel: 'acceptable',
      explanation: 'Zero road traffic congestion cuts commute duration, though late-night thermal inversion remains active outdoors.',
      estimatedDurationMins: Math.round(baseDurationMins * 0.85),
      exposureRating: 'moderate',
      recommendationNote:
        'Zero road traffic congestion cuts commute duration, though late-night thermal inversion remains active outdoors.',
      isRecommended: false,
    },
  ];

  const headline = 'Recommended Departure: Midday Window (12:00 – 15:30)';
  const explanation =
    'Atmospheric physics demonstrates that peak daytime solar radiation expands the urban boundary layer, significantly reducing ambient roadside particulate concentrations compared to the morning rush hour inversion.';
  const scientific =
    'Travel exposure depends on concentration multiplied by time. By departing during the midday off-peak window, you benefit from both lower ambient PM2.5 and shorter travel duration in traffic.';

  return {
    recommendedWindowId: 'midday_optimal',
    bestWindow: headline,
    currentWindow: 'Morning Rush & Inversion',
    headline,
    recommendationExplanation: explanation,
    meteorologicalExplanation: explanation,
    inversionLayerNotice: scientific,
    windows: rawWindows,
    dataTimestamp: new Date().toISOString(),
    scientificContext: scientific,
  };
};
