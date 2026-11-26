/**
 * ClearAir - Normalized Percentage Pollution & Smog Scale
 * Maps real air quality telemetry into an intuitive 0% - 100% scale.
 * 
 * Rules:
 * - Low: 0% - 25% (Safe / Good)
 * - Moderate: 26% - 50% (Acceptable / Fair)
 * - High: 51% - 75% (Unhealthy for sensitive groups & general public)
 * - Very High: 76% - 100% (Severe smog / Dangerous)
 * 
 * Higher percentage ALWAYS indicates worse pollution.
 * Never displays grams or scientific units to users.
 */

export type PollutionStatus = 'Low' | 'Moderate' | 'High' | 'Very High' | 'Extremely High';

export interface PollutionMetrics {
  pollutionPercent: number; // 0 - 100%
  smogPercent: number;      // 0 - 100%
  status: PollutionStatus;
  statusColor: string;
  badgeBg: string;
  borderColor: string;
  dotColor: string;
  shortAdvice: string;
  isDataAvailable: boolean;
}

export const calculatePollutionMetrics = (
  aqi?: number | null,
  weather?: { humidity?: number; condition?: string } | null
): PollutionMetrics => {
  if (aqi == null || isNaN(aqi) || aqi < 0) {
    return {
      pollutionPercent: 0,
      smogPercent: 0,
      status: 'Low',
      statusColor: 'text-zinc-400',
      badgeBg: 'bg-zinc-500/10',
      borderColor: 'border-zinc-500/20',
      dotColor: 'bg-zinc-400',
      shortAdvice: 'Pollution data is not available for this location right now.',
      isDataAvailable: false,
    };
  }

  // Linear piecewise normalization from CPCB AQI (0 - 500) into 0 - 100%
  let percent: number;
  if (aqi <= 50) {
    percent = Math.round((aqi / 50) * 15); // 0 - 15%
  } else if (aqi <= 100) {
    percent = Math.round(15 + ((aqi - 50) / 50) * 10); // 16 - 25%
  } else if (aqi <= 200) {
    percent = Math.round(25 + ((aqi - 100) / 100) * 25); // 26 - 50%
  } else if (aqi <= 300) {
    percent = Math.round(50 + ((aqi - 200) / 100) * 25); // 51 - 75%
  } else {
    percent = Math.min(100, Math.round(75 + ((aqi - 300) / 200) * 25)); // 76 - 100%
  }

  // Ensure minimum visibility of at least 5% on active readings
  const pollutionPercent = Math.max(5, Math.min(100, percent));

  // Calculate Smog % (particulate haze boosted by atmospheric humidity/fog)
  const humidityBonus = weather?.humidity && weather.humidity > 65 ? Math.round((weather.humidity - 65) * 0.3) : 0;
  const smogPercent = Math.min(100, Math.max(4, Math.round(pollutionPercent * 0.88 + humidityBonus)));

  let status: PollutionStatus = 'Low';
  let statusColor = 'text-sky-500';
  let badgeBg = 'bg-sky-500/10';
  let borderColor = 'border-sky-500/20';
  let dotColor = 'bg-sky-400';
  let shortAdvice = 'Air is clean and fresh. Perfect for outdoor activities and exercise.';

  if (pollutionPercent > 90) {
    status = 'Extremely High';
    statusColor = 'text-red-700 dark:text-red-500';
    badgeBg = 'bg-red-900/20';
    borderColor = 'border-red-800/40';
    dotColor = 'bg-red-900';
    shortAdvice = 'Hazardous winter smog emergency. Stay completely indoors and avoid all outdoor exposure.';
  } else if (pollutionPercent > 75) {
    status = 'Very High';
    statusColor = 'text-red-500';
    badgeBg = 'bg-red-500/10';
    borderColor = 'border-red-500/30';
    dotColor = 'bg-red-500';
    shortAdvice = 'Pollution is very high in your area. Avoid outdoor exercise and keep windows closed.';
  } else if (pollutionPercent > 50) {
    status = 'High';
    statusColor = 'text-orange-500';
    badgeBg = 'bg-orange-500/10';
    borderColor = 'border-orange-500/30';
    dotColor = 'bg-orange-500';
    shortAdvice = 'Pollution is high today. Wear a mask outside and reduce prolonged outdoor physical exertion.';
  } else if (pollutionPercent > 25) {
    status = 'Moderate';
    statusColor = 'text-amber-500';
    badgeBg = 'bg-amber-500/10';
    borderColor = 'border-amber-500/30';
    dotColor = 'bg-amber-400';
    shortAdvice = 'Air quality is acceptable. People with asthma or breathing conditions should take precautions.';
  }

  return {
    pollutionPercent,
    smogPercent,
    status,
    statusColor,
    badgeBg,
    borderColor,
    dotColor,
    shortAdvice,
    isDataAvailable: true,
  };
};

/**
 * Returns simple color hex for map visualization
 */
export const getStatusHexColor = (status: PollutionStatus): string => {
  switch (status) {
    case 'Low':
      return '#0ea5e9'; // Blue (Low)
    case 'Moderate':
      return '#eab308'; // Yellow (Moderate)
    case 'High':
      return '#f97316'; // Orange (High)
    case 'Very High':
      return '#ef4444'; // Red (Very High)
    case 'Extremely High':
      return '#991b1b'; // Dark Red (Extremely High)
    default:
      return '#0ea5e9';
  }
};
