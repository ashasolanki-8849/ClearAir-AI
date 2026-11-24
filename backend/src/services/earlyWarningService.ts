import { HourlyForecastPoint } from './forecastService.js';
import { ForecastAlert, IForecastAlert } from '../models/ForecastAlert.js';
import mongoose from 'mongoose';

export interface EarlyWarningItem {
  id?: string;
  category: 'spike_warning' | 'aqi_deterioration' | 'rain_cleansing' | 'severe_hazard' | 'improving_window' | 'unusual_trend';
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  title: string;
  expectedTime: string;
  expectedAqi: number;
  expectedCategory: string;
  relevantPollutant?: string;
  explanation: string;
  recommendedAction: string;
  dataSource: string;
  forecastTimestamp: string;
  read: boolean;
}

export const generateEarlyWarnings = async (
  hourly: HourlyForecastPoint[],
  currentAqi: number,
  location: { name: string; lat: number; lon: number },
  userId?: string
): Promise<EarlyWarningItem[]> => {
  if (!hourly || hourly.length === 0) return [];

  const warnings: EarlyWarningItem[] = [];
  const next24 = hourly.slice(0, 24);

  // 1. Check for Severe Smog Hazard (AQI >= 300)
  const severePt = next24.find((h) => h.aqi >= 300);
  if (severePt) {
    const timeFormatted = new Date(severePt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    warnings.push({
      category: 'severe_hazard',
      severity: 'emergency',
      title: `Critical Smog Peak Projected (~${severePt.aqi} AQI)`,
      expectedTime: severePt.time,
      expectedAqi: severePt.aqi,
      expectedCategory: 'Severe',
      relevantPollutant: 'PM2.5',
      explanation: `Atmospheric inversion and stagnant surface air (<${severePt.weather.windSpeed} km/h) are forecast to trap heavy particulates around ${timeFormatted}.`,
      recommendedAction:
        'Keep all family members indoors, seal bedroom doors, activate True HEPA air purifiers at max speed, and avoid any outdoor physical exertion.',
      dataSource: 'Open-Meteo CAMS Ensemble',
      forecastTimestamp: new Date().toISOString(),
      read: false,
    });
  }

  // 2. Check for Rapid Deterioration (Jump >= 30 points within 3-6 hours)
  const worseningPt = next24.slice(0, 6).find((h) => h.aqi - currentAqi >= 30);
  if (worseningPt && (!severePt || worseningPt.time !== severePt.time)) {
    const timeFormatted = new Date(worseningPt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    warnings.push({
      category: 'aqi_deterioration',
      severity: 'alert',
      title: `Rapid AQI Deterioration Expected by ${timeFormatted}`,
      expectedTime: worseningPt.time,
      expectedAqi: worseningPt.aqi,
      expectedCategory: worseningPt.category,
      relevantPollutant: 'PM2.5 / PM10',
      explanation: `Air quality is projected to worsen sharply from current ${currentAqi} AQI to ~${worseningPt.aqi} AQI over the next few hours.`,
      recommendedAction:
        'Complete any essential outdoor errands immediately before the deterioration window. Ensure N95 masks are ready if traveling.',
      dataSource: 'Open-Meteo CAMS Ensemble',
      forecastTimestamp: new Date().toISOString(),
      read: false,
    });
  }

  // 3. Check for Active Rain Cleansing / Dispersion Opportunity
  const rainPt = next24.find((h) => h.weather.precipitation >= 2.0);
  if (rainPt) {
    const timeFormatted = new Date(rainPt.time).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' });
    warnings.push({
      category: 'rain_cleansing',
      severity: 'info',
      title: `Precipitation Air Cleansing Opportunity (~${timeFormatted})`,
      expectedTime: rainPt.time,
      expectedAqi: rainPt.aqi,
      expectedCategory: rainPt.category,
      relevantPollutant: 'Rain Scavenging',
      explanation: `Forecast models indicate ${rainPt.weather.precipitation} mm/h precipitation, which will actively wash down airborne coarse and fine particulates.`,
      recommendedAction:
        'Expect improved air quality post-rainfall. Plan 10-minute pulse home ventilation immediately after rain passes to refresh stale indoor air.',
      dataSource: 'Open-Meteo CAMS Atmospheric Engine',
      forecastTimestamp: new Date().toISOString(),
      read: false,
    });
  }

  // 4. Check for Midday Improving Window if morning was bad
  const middayPt = next24.find((h) => {
    const hr = new Date(h.time).getHours();
    return hr >= 12 && hr <= 15 && currentAqi - h.aqi >= 25;
  });
  if (middayPt && !rainPt) {
    warnings.push({
      category: 'improving_window',
      severity: 'info',
      title: 'Midday Solar Dispersion Window (12:00 – 15:30)',
      expectedTime: middayPt.time,
      expectedAqi: middayPt.aqi,
      expectedCategory: middayPt.category,
      relevantPollutant: 'Solar Convective Mixing',
      explanation:
        'Daytime solar radiation is projected to lift the planetary boundary layer, providing a 30% reduction in ground particulate density.',
      recommendedAction:
        'Schedule essential outdoor commutes, doctor visits, and brief window pulse-ventilation strictly during this midday window.',
      dataSource: 'Open-Meteo CAMS Ensemble',
      forecastTimestamp: new Date().toISOString(),
      read: false,
    });
  }

  // Deduplicate and persist warnings in MongoDB
  for (const w of warnings) {
    try {
      const existing = await ForecastAlert.findOne({
        'location.lat': location.lat,
        'location.lon': location.lon,
        alertCategory: w.category,
        expectedTime: new Date(w.expectedTime),
      });

      if (!existing) {
        const doc = await ForecastAlert.create({
          userId: userId ? new mongoose.Types.ObjectId(userId) : undefined,
          location,
          alertCategory: w.category,
          severity: w.severity,
          title: w.title,
          expectedTime: new Date(w.expectedTime),
          expectedAqi: w.expectedAqi,
          expectedCategory: w.expectedCategory,
          relevantPollutant: w.relevantPollutant,
          explanation: w.explanation,
          recommendedAction: w.recommendedAction,
          dataSource: w.dataSource,
          forecastTimestamp: new Date(w.forecastTimestamp),
          read: false,
        });
        w.id = doc._id.toString();
      } else {
        w.id = existing._id.toString();
        w.read = existing.read;
      }
    } catch (err: any) {
      // Non-fatal duplicate error
    }
  }

  return warnings;
};
