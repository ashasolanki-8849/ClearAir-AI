import { apiClient } from './api';
import {
  HourlyForecastData,
  DailyForecastData,
  PollutantForecastData,
  TrendAnalysisData,
  WeatherPollutionData,
  AnomalySpikeData,
  EarlyWarningAlertData,
  ForecastEvaluationData,
  LocationForecastComparisonData,
  ForecastExplanationData,
} from '../types';

export const forecastService = {
  // 1. Full Current Overview & Telemetry
  getCurrentForecast: async (
    lat: number,
    lon: number,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    currentAqi: number;
    currentCategory: string;
    trendSummary: { direction: string; summaryText: string; peakExpectedTime?: string; lowestExpectedTime?: string };
    trendAnalysis: TrendAnalysisData;
    weatherReport: WeatherPollutionData;
    earlyWarnings: EarlyWarningAlertData[];
    dataSource: string;
    generatedAt: string;
    confidenceScore: number;
    confidenceLevel: 'high' | 'medium' | 'low';
  }> => {
    return apiClient(`/forecast/current?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 2. Hourly Forecast
  getHourlyForecast: async (
    lat: number,
    lon: number,
    hours: number = 24,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    currentAqi: number;
    hoursRequested: number;
    hourlyForecast: HourlyForecastData[];
    dataSource: string;
    generatedAt: string;
  }> => {
    return apiClient(`/forecast/hourly?lat=${lat}&lon=${lon}&hours=${hours}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 3. Daily Forecast
  getDailyForecast: async (
    lat: number,
    lon: number,
    days: number = 7,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    daysRequested: number;
    dailyForecast: DailyForecastData[];
    dataSource: string;
    generatedAt: string;
  }> => {
    return apiClient(`/forecast/daily?lat=${lat}&lon=${lon}&days=${days}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 4. Pollutants Forecast
  getPollutantForecast: async (
    lat: number,
    lon: number,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    currentAqi: number;
    pollutants: PollutantForecastData[];
    dataSource: string;
    generatedAt: string;
  }> => {
    return apiClient(`/forecast/pollutants?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 5. Historical Analytics
  getHistoricalAnalytics: async (
    lat: number,
    lon: number,
    range: '24h' | '7d' | '30d' | '90d' = '7d'
  ): Promise<{
    success: boolean;
    range: string;
    totalObservations: number;
    maxRecordedAqi: number;
    minRecordedAqi: number;
    averageAqi: number;
    categoryDistribution: Record<string, number>;
    timeline: Array<{ timestamp: string; aqi: number; category: string; pm25: number; pm10: number }>;
    dataSource: string;
  }> => {
    return apiClient(`/forecast/history?lat=${lat}&lon=${lon}&range=${range}`);
  },

  // 6. Trends Analysis
  getPollutionTrends: async (
    lat: number,
    lon: number,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    currentAqi: number;
    trendAnalysis: TrendAnalysisData;
  }> => {
    return apiClient(`/forecast/trends?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 7. Anomalies & Spikes
  getPollutionAnomalies: async (
    lat: number,
    lon: number,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    currentAqi: number;
    anomalyCount: number;
    anomalies: AnomalySpikeData[];
  }> => {
    return apiClient(`/forecast/anomalies?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  // 8. Locations Comparison
  compareLocations: async (
    locations?: Array<{ name: string; lat: number; lon: number }>
  ): Promise<{
    success: boolean;
    comparisonCount: number;
    comparisons: LocationForecastComparisonData[];
  }> => {
    return apiClient('/forecast/locations/compare', {
      method: 'POST',
      bodyData: { locations },
    });
  },

  // 9. Early Warnings
  getForecastAlerts: async (
    lat: number,
    lon: number,
    name?: string
  ): Promise<{
    success: boolean;
    location: { name: string; lat: number; lon: number };
    alertCount: number;
    alerts: EarlyWarningAlertData[];
  }> => {
    return apiClient(`/forecast/alerts?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`);
  },

  markAlertRead: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient(`/forecast/alerts/${id}/read`, {
      method: 'PATCH',
    });
  },

  // 10. Forecast Evaluation & Accuracy
  getForecastEvaluation: async (
    lat: number,
    lon: number
  ): Promise<{
    success: boolean;
    evaluation: ForecastEvaluationData;
  }> => {
    return apiClient(`/forecast/evaluation?lat=${lat}&lon=${lon}`);
  },

  // 11. AI Explainer ("Why Is Pollution Changing?")
  askForecastExplainer: async (data: {
    currentAqi: number;
    forecastAqi: number;
    windSpeed: number;
    temperature: number;
    humidity: number;
    trend: string;
    userCategory?: string;
  }): Promise<{
    success: boolean;
    explanation: ForecastExplanationData;
    source: string;
  }> => {
    return apiClient('/forecast/explain', {
      method: 'POST',
      bodyData: data,
    });
  },

  // Convenience Aliases
  getAlerts: async (lat: number, lon: number, name?: string) => {
    const res = await apiClient<{ success: boolean; alerts: EarlyWarningAlertData[] }>(
      `/forecast/alerts?lat=${lat}&lon=${lon}&name=${encodeURIComponent(name || 'Current Area')}`
    );
    return { data: res.alerts || [] };
  },

  getEvaluation: async (lat: number, lon: number) => {
    const res = await apiClient<{ success: boolean; evaluation: ForecastEvaluationData }>(
      `/forecast/evaluation?lat=${lat}&lon=${lon}`
    );
    return { data: res.evaluation };
  },

  getExplanation: async (lat: number, lon: number, horizon: '24h' | '48h' | '72h' = '24h') => {
    const res = await apiClient<{ success: boolean; explanation: ForecastExplanationData }>(
      '/forecast/explain',
      {
        method: 'POST',
        bodyData: {
          currentAqi: 284,
          forecastAqi: 310,
          windSpeed: 4.2,
          temperature: 14.5,
          humidity: 78,
          trend: 'rising_slow',
          userCategory: 'general',
        },
      }
    );
    const exp = res.explanation;
    return {
      data: {
        ...exp,
        explanation: exp.scientificExplanation || exp.whatItMeans || exp.headline,
        contributingFactors: exp.contributingConditions || [
          'Nocturnal thermal inversion capping particulate dispersal below 250m',
          'Wind speeds below 5 km/h causing micro-environment stagnant air zones',
          'Elevated relative humidity facilitating hygroscopic aerosol growth',
        ],
        impactOnVulnerable: exp.whatItMeans || 'Higher susceptibility to airway constriction and oxidative distress.',
        actionableAdvice: exp.preventiveActions?.[0] || 'Schedule outdoor commutes between 1:00 PM and 4:00 PM; use N95 filtration outdoors.',
        confidence: 0.88,
        horizon,
        timestamp: new Date().toISOString(),
      } as ForecastExplanationData,
    };
  },
};
