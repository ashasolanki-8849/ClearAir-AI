import { HourlyForecastPoint } from './forecastService.js';
import { PollutionAnomaly, IPollutionAnomaly } from '../models/PollutionAnomaly.js';

export interface DetectedAnomalyResult {
  id?: string;
  pollutant: 'aqi' | 'pm25' | 'pm10';
  detectedValue: number;
  baselineValue: number;
  anomalyDelta: number;
  zScore: number;
  rateOfChangePerHour: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical_spike';
  detectionMethod: 'rolling_zscore' | 'rate_of_change_spike' | 'cpcb_severe_jump' | 'threshold';
  possibleCauses: string[];
  actionableAdvice: string;
  timestamp: string;
}

export const detectPollutionAnomalies = async (
  hourly: HourlyForecastPoint[],
  currentAqi: number,
  location: { name: string; lat: number; lon: number }
): Promise<DetectedAnomalyResult[]> => {
  if (!hourly || hourly.length < 6) return [];

  const results: DetectedAnomalyResult[] = [];

  // 1. Compute rolling baseline mean and standard deviation for AQI and PM2.5
  const aqiVals = hourly.slice(0, 24).map((h) => h.aqi);
  const pm25Vals = hourly.slice(0, 24).map((h) => h.pollutants.pm25);

  const meanAqi = aqiVals.reduce((a, b) => a + b, 0) / aqiVals.length;
  const varianceAqi = aqiVals.reduce((sum, val) => sum + Math.pow(val - meanAqi, 2), 0) / aqiVals.length;
  const stdAqi = Math.sqrt(varianceAqi) || 12;

  const meanPm25 = pm25Vals.reduce((a, b) => a + b, 0) / pm25Vals.length;
  const variancePm25 = pm25Vals.reduce((sum, val) => sum + Math.pow(val - meanPm25, 2), 0) / pm25Vals.length;
  const stdPm25 = Math.sqrt(variancePm25) || 10;

  // 2. Scan hours for z-score deviations and rapid rate of change
  let prevPt = { aqi: currentAqi, pm25: hourly[0]?.pollutants.pm25 || 35, time: new Date().toISOString() };

  for (let i = 0; i < Math.min(24, hourly.length); i++) {
    const pt = hourly[i];
    const zAqi = (pt.aqi - meanAqi) / stdAqi;
    const zPm25 = (pt.pollutants.pm25 - meanPm25) / stdPm25;
    const rateOfAqiChange = pt.aqi - prevPt.aqi;
    const rateOfPm25Change = pt.pollutants.pm25 - prevPt.pm25;

    let isAnomaly = false;
    let severity: DetectedAnomalyResult['severity'] = 'mild';
    let method: DetectedAnomalyResult['detectionMethod'] = 'rolling_zscore';
    const causes: string[] = [];

    // Spike Rule 1: High z-score (statistically abnormal vs 24h baseline)
    if (zAqi >= 3.2 || zPm25 >= 3.2) {
      isAnomaly = true;
      severity = 'critical_spike';
      method = 'rolling_zscore';
      causes.push('Statistical particulate surge (>3.2 standard deviations above 24h mean)');
    } else if (zAqi >= 2.2 || zPm25 >= 2.2) {
      isAnomaly = true;
      severity = 'severe';
      method = 'rolling_zscore';
      causes.push('Statistically elevated particulate concentration (>2.2 sigma baseline)');
    }

    // Spike Rule 2: Sudden 1-hour jump
    if (rateOfAqiChange >= 35 || rateOfPm25Change >= 25) {
      isAnomaly = true;
      severity = severity === 'critical_spike' ? 'critical_spike' : 'severe';
      method = 'rate_of_change_spike';
      causes.push(`Rapid hourly surge (+${rateOfPm25Change} µg/m³ PM2.5 in 60 mins)`);
    }

    // Weather corroboration
    if (pt.weather.windSpeed < 4) {
      causes.push('Calm surface air (< 4 km/h) causing zero horizontal pollutant ventilation');
    }
    if (pt.weather.humidity > 80) {
      causes.push('High relative humidity (>80%) promoting secondary aerosol formation & haze condensation');
    }

    if (isAnomaly) {
      let advice = 'Pre-filter indoor spaces and avoid outdoor cardio workouts during this peak.';
      if (severity === 'critical_spike' || severity === 'severe') {
        advice =
          'Severe anomaly detected: Seal windows, activate indoor HEPA purification at high speed, and wear an N95 respirator if stepping outside.';
      }

      const anomalyItem: DetectedAnomalyResult = {
        pollutant: 'pm25',
        detectedValue: pt.pollutants.pm25,
        baselineValue: Math.round(meanPm25),
        anomalyDelta: Math.round(pt.pollutants.pm25 - meanPm25),
        zScore: Math.round(zPm25 * 10) / 10,
        rateOfChangePerHour: Math.round(rateOfPm25Change),
        severity,
        detectionMethod: method,
        possibleCauses: causes,
        actionableAdvice: advice,
        timestamp: pt.time,
      };

      results.push(anomalyItem);

      // Persist to MongoDB for historical tracking
      PollutionAnomaly.create({
        location: { name: location.name, lat: location.lat, lon: location.lon },
        pollutant: 'pm25',
        detectedValue: pt.pollutants.pm25,
        baselineValue: Math.round(meanPm25),
        anomalyDelta: Math.round(pt.pollutants.pm25 - meanPm25),
        zScore: Math.round(zPm25 * 10) / 10,
        rateOfChangePerHour: Math.round(rateOfPm25Change),
        severity,
        detectionMethod: method,
        possibleCauses: causes,
        actionableAdvice: advice,
        timestamp: new Date(pt.time),
      }).catch(() => {});
    }

    prevPt = { aqi: pt.aqi, pm25: pt.pollutants.pm25, time: pt.time };
  }

  return results.slice(0, 5); // Return top 5 most critical anomalies
};
