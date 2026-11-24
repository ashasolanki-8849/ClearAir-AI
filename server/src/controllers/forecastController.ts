import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { fetchPollutionForecast } from '../services/forecastService.js';
import { analyzePollutionTrends } from '../services/pollutionPredictionService.js';
import { detectPollutionAnomalies } from '../services/anomalyDetectionService.js';
import { analyzeWeatherPollutionRelationship } from '../services/weatherAnalysisService.js';
import { evaluateForecastPerformance } from '../services/forecastEvaluationService.js';
import { generateEarlyWarnings } from '../services/earlyWarningService.js';
import { ForecastAlert } from '../models/ForecastAlert.js';
import { AirQuality } from '../models/AirQuality.js';
import axios from 'axios';

// Default coordinates (Delhi NCR baseline)
const DEFAULT_LAT = 28.6139;
const DEFAULT_LON = 77.209;

// ==========================================
// 1. FORECAST OVERVIEW & CURRENT PREDICTION
// ==========================================

export const getCurrentForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Monitored Area';

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const trendAnalysis = analyzePollutionTrends(fullForecast.hourly, fullForecast.currentAqi);
    const weatherReport = analyzeWeatherPollutionRelationship({
      temperature: fullForecast.hourly[0]?.weather.temperature || 24,
      humidity: fullForecast.hourly[0]?.weather.humidity || 55,
      windSpeed: fullForecast.hourly[0]?.weather.windSpeed || 8,
      windDirection: fullForecast.hourly[0]?.weather.windDirection || 180,
      precipitation: fullForecast.hourly[0]?.weather.precipitation || 0,
    });
    const earlyWarnings = await generateEarlyWarnings(
      fullForecast.hourly,
      fullForecast.currentAqi,
      { name: locationName, lat, lon },
      req.user?.id
    );

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      currentAqi: fullForecast.currentAqi,
      currentCategory: fullForecast.currentCategory,
      trendSummary: fullForecast.trendSummary,
      trendAnalysis,
      weatherReport,
      earlyWarnings,
      dataSource: fullForecast.dataSource,
      generatedAt: fullForecast.generatedAt,
      confidenceScore: fullForecast.hourly[0]?.confidenceScore || 85,
      confidenceLevel: fullForecast.hourly[0]?.confidenceLevel || 'high',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message || 'Failed to fetch pollution forecast' });
  }
};

// ==========================================
// 2. HOURLY FORECAST
// ==========================================

export const getHourlyForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Monitored Area';
    const hours = Math.min(72, Number(req.query.hours) || 24);

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const sliced = fullForecast.hourly.slice(0, hours);

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      currentAqi: fullForecast.currentAqi,
      hoursRequested: hours,
      hourlyForecast: sliced,
      dataSource: fullForecast.dataSource,
      generatedAt: fullForecast.generatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. DAILY FORECAST (3 to 7 Days)
// ==========================================

export const getDailyForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Monitored Area';
    const days = Math.min(7, Math.max(3, Number(req.query.days) || 7));

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const sliced = fullForecast.daily.slice(0, days);

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      daysRequested: days,
      dailyForecast: sliced,
      dataSource: fullForecast.dataSource,
      generatedAt: fullForecast.generatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. POLLUTANT-SPECIFIC FORECAST
// ==========================================

export const getPollutantForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Monitored Area';

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      currentAqi: fullForecast.currentAqi,
      pollutants: fullForecast.pollutants,
      dataSource: fullForecast.dataSource,
      generatedAt: fullForecast.generatedAt,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. HISTORICAL ANALYTICS (24h, 7d, 30d, 90d)
// ==========================================

export const getHistoricalAnalytics = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const range = (req.query.range as string) || '7d';

    let hoursToLookBack = 168; // 7 days default
    if (range === '24h') hoursToLookBack = 24;
    else if (range === '30d') hoursToLookBack = 720;
    else if (range === '90d') hoursToLookBack = 2160;

    const startDate = new Date(Date.now() - hoursToLookBack * 60 * 60 * 1000);

    // Fetch stored actual historical readings
    const records = await AirQuality.find({
      'location.lat': { $gte: lat - 0.25, $lte: lat + 0.25 },
      'location.lon': { $gte: lon - 0.25, $lte: lon + 0.25 },
      timestamp: { $gte: startDate },
    })
      .sort({ timestamp: 1 })
      .limit(range === '90d' ? 500 : 200);

    // If database has sparse data, query Open-Meteo past readings
    let historicalPoints = records.map((r) => ({
      timestamp: r.timestamp.toISOString(),
      aqi: r.aqi,
      category: r.aqiCategory,
      pm25: r.pollutants.pm25,
      pm10: r.pollutants.pm10,
    }));

    if (historicalPoints.length < 5) {
      // Fetch empirical past days from Open-Meteo historical/archive endpoint
      try {
        const pastDays = range === '24h' ? 2 : range === '7d' ? 7 : 14;
        const pastUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&hourly=pm10,pm2_5,us_aqi&past_days=${pastDays}&forecast_days=0`;
        const pastRes = await axios.get(pastUrl, { timeout: 7000 });
        if (pastRes.data?.hourly?.time) {
          const t = pastRes.data.hourly.time;
          const pm25 = pastRes.data.hourly.pm2_5;
          const pm10 = pastRes.data.hourly.pm10;
          const aqi = pastRes.data.hourly.us_aqi;
          historicalPoints = t.map((timeStr: string, idx: number) => ({
            timestamp: timeStr,
            aqi: aqi?.[idx] || 150,
            category: aqi?.[idx] >= 300 ? 'Severe' : aqi?.[idx] >= 200 ? 'Poor' : 'Moderate',
            pm25: pm25?.[idx] || 45,
            pm10: pm10?.[idx] || 75,
          }));
        }
      } catch (pastErr) {
        // Keep whatever records exist
      }
    }

    const aqiVals = historicalPoints.map((p) => p.aqi);
    const maxAqi = aqiVals.length > 0 ? Math.max(...aqiVals) : 220;
    const minAqi = aqiVals.length > 0 ? Math.min(...aqiVals) : 65;
    const avgAqi = aqiVals.length > 0 ? Math.round(aqiVals.reduce((a, b) => a + b, 0) / aqiVals.length) : 140;

    // Category distribution
    const categoryCounts: Record<string, number> = {
      Good: 0,
      Satisfactory: 0,
      Moderate: 0,
      Poor: 0,
      'Very Poor': 0,
      Severe: 0,
    };
    historicalPoints.forEach((p) => {
      const cat = p.category || 'Moderate';
      if (categoryCounts[cat] != null) categoryCounts[cat]++;
      else categoryCounts['Moderate']++;
    });

    res.status(200).json({
      success: true,
      range,
      totalObservations: historicalPoints.length,
      maxRecordedAqi: maxAqi,
      minRecordedAqi: minAqi,
      averageAqi: avgAqi,
      categoryDistribution: categoryCounts,
      timeline: historicalPoints,
      dataSource: 'ClearAir AI Stored Telemetry & Open-Meteo Atmospheric Archive',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. POLLUTION TRENDS & DIURNAL PATTERNS
// ==========================================

export const getPollutionTrends = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Area';

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const trendAnalysis = analyzePollutionTrends(fullForecast.hourly, fullForecast.currentAqi);

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      currentAqi: fullForecast.currentAqi,
      trendAnalysis,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 7. ANOMALY & SPIKE DETECTION
// ==========================================

export const getPollutionAnomalies = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Area';

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const anomalies = await detectPollutionAnomalies(
      fullForecast.hourly,
      fullForecast.currentAqi,
      { name: locationName, lat, lon }
    );

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      currentAqi: fullForecast.currentAqi,
      anomalyCount: anomalies.length,
      anomalies,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 8. MULTI-LOCATION FORECAST COMPARISON
// ==========================================

export const compareLocationsForecast = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    // Array of locations can be passed via body or default preset locations
    const locationsToCompare = req.body?.locations || [
      { name: 'Central Delhi (Connaught Place)', lat: 28.6315, lon: 77.2167 },
      { name: 'Noida (Sector 62)', lat: 28.6258, lon: 77.3789 },
      { name: 'Gurugram (Cyber City)', lat: 28.4986, lon: 77.0878 },
      { name: 'North Campus (Delhi University)', lat: 28.6924, lon: 77.2104 },
    ];

    const comparisons = await Promise.all(
      locationsToCompare.map(async (loc: any) => {
        try {
          const fc = await fetchPollutionForecast(loc.lat, loc.lon, loc.name);
          const next24 = fc.hourly.slice(0, 24);
          const max24h = Math.max(...next24.map((h) => h.aqi));
          const avg24h = Math.round(next24.reduce((sum, h) => sum + h.aqi, 0) / (next24.length || 1));

          return {
            name: loc.name,
            coordinates: { lat: loc.lat, lon: loc.lon },
            currentAqi: fc.currentAqi,
            currentCategory: fc.currentCategory,
            forecast24hAvg: avg24h,
            forecast24hPeak: max24h,
            dominantPollutant: 'PM2.5',
            pm25Current: fc.pollutants[0]?.currentValue || 45,
            trendDirection: fc.trendSummary.direction,
            updatedAt: fc.generatedAt,
            isDataAvailable: true,
          };
        } catch (err: any) {
          return {
            name: loc.name,
            coordinates: { lat: loc.lat, lon: loc.lon },
            currentAqi: null,
            currentCategory: 'Unavailable',
            forecast24hAvg: null,
            forecast24hPeak: null,
            dominantPollutant: 'N/A',
            pm25Current: null,
            trendDirection: 'stable',
            updatedAt: new Date().toISOString(),
            isDataAvailable: false,
          };
        }
      })
    );

    res.status(200).json({
      success: true,
      comparisonCount: comparisons.length,
      comparisons,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 9. EARLY WARNINGS & ALERTS
// ==========================================

export const getForecastAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;
    const locationName = (req.query.name as string) || 'Current Area';

    const fullForecast = await fetchPollutionForecast(lat, lon, locationName);
    const alerts = await generateEarlyWarnings(
      fullForecast.hourly,
      fullForecast.currentAqi,
      { name: locationName, lat, lon },
      req.user?.id
    );

    res.status(200).json({
      success: true,
      location: fullForecast.location,
      alertCount: alerts.length,
      alerts,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAlertRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const alert = await ForecastAlert.findByIdAndUpdate(id, { $set: { read: true } }, { new: true });
    if (!alert) {
      res.status(404).json({ success: false, message: 'Forecast alert not found' });
      return;
    }
    res.status(200).json({ success: true, alert, message: 'Alert marked as read.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 10. MODEL EVALUATION & ACCURACY (MAE, RMSE)
// ==========================================

export const getForecastEvaluation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = Number(req.query.lat) || DEFAULT_LAT;
    const lon = Number(req.query.lon) || DEFAULT_LON;

    const evaluation = await evaluateForecastPerformance(lat, lon);

    res.status(200).json({
      success: true,
      evaluation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 11. "WHY IS POLLUTION CHANGING?" EXPLAINER
// ==========================================

export const askForecastExplainer = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const {
      currentAqi,
      forecastAqi,
      windSpeed,
      temperature,
      humidity,
      trend,
      userCategory = 'professional',
    } = req.body;

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `
You are the CleanAir AI Forecast Explainability Engine.
Answer why air quality is changing based on atmospheric science.

DATA:
- Current AQI: ${currentAqi}
- Forecast AQI: ${forecastAqi}
- Trend: ${trend}
- Wind Speed: ${windSpeed} km/h
- Temperature: ${temperature}°C
- Relative Humidity: ${humidity}%
- User Persona: ${userCategory}

RULES:
1. Explain the primary contributing conditions (calm winds, thermal inversion, solar dispersion, humidity).
2. Clearly distinguish meteorological dispersion mechanisms from confirmed emission causes. Do NOT claim correlation proves causation.
3. Suggest practical preventive actions matching the user's persona (student, professional, family).

Return strict JSON:
{
  "headline": "Short title describing the change",
  "contributingConditions": ["condition 1", "condition 2", "condition 3"],
  "scientificExplanation": "2-3 sentences explaining the atmospheric physics",
  "whatItMeans": "What this means for everyday exposure",
  "preventiveActions": ["action 1", "action 2", "action 3"],
  "scientificDisclaimer": "Correlation note"
}
`;
        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const genRes = await axios.post(
          url,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.25 },
          },
          { timeout: 8000 }
        );

        const rawText = genRes.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          res.status(200).json({
            success: true,
            explanation: JSON.parse(cleanJson),
            source: 'Gemini Generative Engine',
          });
          return;
        }
      } catch (genErr) {
        // Fall back to rule engine
      }
    }

    // Deterministic Rule-Based Explainer
    const delta = (Number(forecastAqi) || currentAqi) - Number(currentAqi);
    const isWorsening = delta > 15;
    const isClearing = delta < -15;

    const contributing: string[] = [];
    if (Number(windSpeed) < 5) contributing.push('Surface wind speeds under 5 km/h suppressing horizontal dispersion');
    if (Number(humidity) > 75) contributing.push('High relative humidity (>75%) promoting secondary aerosol swelling');
    if (Number(temperature) < 18) contributing.push('Cold nocturnal ground layer establishing shallow thermal inversion ceiling');
    if (contributing.length === 0) contributing.push('Standard diurnal traffic and commuter emission cycles');

    const explanation = {
      headline: isWorsening
        ? 'Projected Particulate Accumulation Ahead'
        : isClearing
        ? 'Atmospheric Dilution & Cleansing Anticipated'
        : 'Stable Equilibrium Across Next 24 Hours',
      contributingConditions: contributing,
      scientificExplanation: isWorsening
        ? 'Lower boundary layer heights and weak surface ventilation prevent airborne pollutants from dispersing vertically or horizontally, leading to localized concentration spikes.'
        : 'Active convection or increasing advective wind velocity is diluting ground-level particulate mass and sweeping smog away from breathing level.',
      whatItMeans: isWorsening
        ? 'Outdoor physical activities will carry a significantly higher particulate inhalation dose.'
        : 'Air quality will offer a favorable window with lower respiratory irritation risk.',
      preventiveActions: isWorsening
        ? [
            'Shift tomorrow morning cardio workouts indoors',
            'Pre-filter indoor bedrooms with True HEPA air cleaners',
            'Equip N95 respirators for any essential road transit during peak hours',
          ]
        : [
            'Utilize the improving window for brief 10-minute pulse ventilation of living areas',
            'Plan outdoor errands and commutes during this favorable period',
          ],
      scientificDisclaimer:
        'Atmospheric models correlate weather parameters with dispersion potential. Weather patterns modulate dispersion but do not generate primary emissions.',
    };

    res.status(200).json({
      success: true,
      explanation,
      source: 'Environmental Rule Engine',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
