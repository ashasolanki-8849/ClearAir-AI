import { HourlyForecastPoint, DailyForecastPoint } from './forecastService.js';

export interface TrendAnalysisResult {
  currentTrend: 'rising_fast' | 'rising_slow' | 'stable' | 'clearing';
  trendScore: number; // -100 to +100
  headline: string;
  explanation: string;
  peakHour: {
    time: string;
    expectedAqi: number;
    category: string;
  };
  clearingHour: {
    time: string;
    expectedAqi: number;
    category: string;
  };
  diurnalPattern: {
    morningInversionRisk: boolean;
    middayDispersionWindow: boolean;
    eveningCommuteSpike: boolean;
    nightColdStagnation: boolean;
  };
  scientificCorrelationNote: string;
}

export const analyzePollutionTrends = (
  hourly: HourlyForecastPoint[],
  currentAqi: number
): TrendAnalysisResult => {
  if (!hourly || hourly.length === 0) {
    return {
      currentTrend: 'stable',
      trendScore: 0,
      headline: 'Stable Atmospheric Trend',
      explanation: 'Insufficient forecast data points to extrapolate reliable temporal trajectory.',
      peakHour: { time: new Date().toISOString(), expectedAqi: currentAqi, category: 'Moderate' },
      clearingHour: { time: new Date().toISOString(), expectedAqi: currentAqi, category: 'Moderate' },
      diurnalPattern: {
        morningInversionRisk: false,
        middayDispersionWindow: false,
        eveningCommuteSpike: false,
        nightColdStagnation: false,
      },
      scientificCorrelationNote: 'Observations reflect baseline ambient readings.',
    };
  }

  const next12 = hourly.slice(0, 12);
  const next24 = hourly.slice(0, 24);

  // Peak and Clearing Hours
  const peakPt = next24.reduce((max, pt) => (pt.aqi > max.aqi ? pt : max), next24[0]);
  const clearPt = next24.reduce((min, pt) => (pt.aqi < min.aqi ? pt : min), next24[0]);

  // Delta over next 6h and 12h
  const avgNext6 = next12.slice(0, 6).reduce((sum, pt) => sum + pt.aqi, 0) / 6;
  const netDelta6h = Math.round(avgNext6 - currentAqi);

  let currentTrend: TrendAnalysisResult['currentTrend'] = 'stable';
  let trendScore = Math.max(-100, Math.min(100, Math.round((netDelta6h / 50) * 100)));

  if (netDelta6h >= 25) {
    currentTrend = 'rising_fast';
  } else if (netDelta6h >= 10) {
    currentTrend = 'rising_slow';
  } else if (netDelta6h <= -15) {
    currentTrend = 'clearing';
  } else {
    currentTrend = 'stable';
  }

  // Diurnal Pattern Analysis
  const hasMorningSpike = next24.some((h) => {
    const hour = new Date(h.time).getHours();
    return (hour >= 7 && hour <= 10) && h.aqi > currentAqi + 15;
  });

  const hasMiddayDrop = next24.some((h) => {
    const hour = new Date(h.time).getHours();
    return (hour >= 12 && hour <= 15) && h.aqi < peakPt.aqi - 20;
  });

  const hasEveningRise = next24.some((h) => {
    const hour = new Date(h.time).getHours();
    return (hour >= 18 && hour <= 21) && h.aqi > currentAqi + 10;
  });

  const hasNightStagnation = next24.some((h) => {
    const hour = new Date(h.time).getHours();
    return (hour >= 23 || hour <= 5) && h.weather.windSpeed < 5;
  });

  let headline = '';
  let explanation = '';

  if (currentTrend === 'rising_fast') {
    headline = 'Pollution Spike Developing in the Next 3–6 Hours';
    explanation =
      'Forecast telemetry projects a significant upward slope in PM2.5 and PM10 concentrations, driven by falling boundary layer heights and light surface winds under 6 km/h.';
  } else if (currentTrend === 'rising_slow') {
    headline = 'Gradual Air Quality Deterioration Projected';
    explanation =
      'Steady accumulation of particulate matter is anticipated across the morning/evening commute cycle as vehicular emission rates outpace regional atmospheric dilution.';
  } else if (currentTrend === 'clearing') {
    headline = 'Favorable Dispersion & Air Cleansing Expected';
    explanation =
      'Increased surface wind speeds or convective daytime mixing are projected to lift and disperse suspended airborne particulates, creating a cleaner window.';
  } else {
    headline = 'Stable Pollution Continuum across Next 24 Hours';
    explanation =
      'Current particulate density is projected to remain steady without severe anomalous spikes or sudden environmental flushing.';
  }

  const scientificCorrelationNote =
    'Forecast models correlate temperature inversions, wind stagnation, and aerosol hygroscopic swelling to predict particulate density. Note: Atmospheric correlation does not prove direct causation.';

  return {
    currentTrend,
    trendScore,
    headline,
    explanation,
    peakHour: {
      time: peakPt.time,
      expectedAqi: peakPt.aqi,
      category: peakPt.category,
    },
    clearingHour: {
      time: clearPt.time,
      expectedAqi: clearPt.aqi,
      category: clearPt.category,
    },
    diurnalPattern: {
      morningInversionRisk: hasMorningSpike,
      middayDispersionWindow: hasMiddayDrop,
      eveningCommuteSpike: hasEveningRise,
      nightColdStagnation: hasNightStagnation,
    },
    scientificCorrelationNote,
  };
};
