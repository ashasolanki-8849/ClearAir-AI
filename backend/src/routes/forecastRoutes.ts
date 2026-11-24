import { Router } from 'express';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/authMiddleware.js';
import {
  getCurrentForecast,
  getHourlyForecast,
  getDailyForecast,
  getPollutantForecast,
  getHistoricalAnalytics,
  getPollutionTrends,
  getPollutionAnomalies,
  compareLocationsForecast,
  getForecastAlerts,
  markAlertRead,
  getForecastEvaluation,
  askForecastExplainer,
} from '../controllers/forecastController.js';

const router = Router();

// 1. Forecast Endpoints (Hourly, Daily, Pollutants, History)
router.get('/current', optionalAuthenticateToken, getCurrentForecast);
router.get('/hourly', optionalAuthenticateToken, getHourlyForecast);
router.get('/daily', optionalAuthenticateToken, getDailyForecast);
router.get('/pollutants', optionalAuthenticateToken, getPollutantForecast);
router.get('/history', optionalAuthenticateToken, getHistoricalAnalytics);

// 2. Trend & Spike Analytics
router.get('/trends', optionalAuthenticateToken, getPollutionTrends);
router.get('/anomalies', optionalAuthenticateToken, getPollutionAnomalies);
router.get('/locations/compare', optionalAuthenticateToken, compareLocationsForecast);
router.post('/locations/compare', optionalAuthenticateToken, compareLocationsForecast);

// 3. Early Warning Alerts
router.get('/alerts', optionalAuthenticateToken, getForecastAlerts);
router.patch('/alerts/:id/read', optionalAuthenticateToken, markAlertRead);

// 4. Model Evaluation & Accuracy Metrics
router.get('/evaluation', optionalAuthenticateToken, getForecastEvaluation);
router.get('/evaluation/:location', optionalAuthenticateToken, getForecastEvaluation);

// 5. AI Explainability ("Why Is Pollution Changing?")
router.post('/explain', optionalAuthenticateToken, askForecastExplainer);

export default router;
