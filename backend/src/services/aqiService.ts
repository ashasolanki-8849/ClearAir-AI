import axios from 'axios';
import { calculateCPCB_AQI, getHealthGuidance } from '../utils/aqiStandards.js';
import { AirQuality, IAirQuality } from '../models/AirQuality.js';

// Simple in-memory cache to prevent spamming external APIs
const cache = new Map<string, { data: any; expiry: number }>();
const CACHE_TTL_MS = 1000 * 60 * 5; // 5 minutes

export interface AQIResponseData {
  location: {
    name: string;
    city: string;
    lat: number;
    lon: number;
  };
  aqi: number;
  aqiCategory: string;
  standard: string;
  healthGuidance: any;
  pollutants: {
    pm25: number;
    pm10: number;
    no2: number;
    so2: number;
    co: number;
    o3: number;
    nh3: number | null;
  };
  weather: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    condition: string;
    code: number;
  };
  hourlyTrend: Array<{
    time: string;
    aqi: number;
    pm25: number;
    pm10: number;
    temperature: number;
  }>;
  dataSource: string;
  isDemo: boolean;
  lastUpdated: string;
}

export const fetchRealtimeAQI = async (
  lat: number,
  lon: number,
  locationName: string = 'Selected Location',
  city: string = 'Current Area'
): Promise<AQIResponseData> => {
  const cacheKey = `${lat.toFixed(2)}_${lon.toFixed(2)}`;
  const cached = cache.get(cacheKey);
  if (cached && cached.expiry > Date.now()) {
    return cached.data;
  }

  try {
    // 1. Fetch Air Quality data from Open-Meteo Air Quality API
    const aqiUrl = `https://air-quality-api.open-meteo.com/v1/air-quality?latitude=${lat}&longitude=${lon}&current=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,ammonia,european_aqi,us_aqi&hourly=pm10,pm2_5,carbon_monoxide,nitrogen_dioxide,sulphur_dioxide,ozone,us_aqi,european_aqi&forecast_days=2&past_days=1`;
    
    // 2. Fetch Weather data from Open-Meteo Weather API
    const weatherUrl = `https://api.open-meteo.com/v1/forecast?latitude=${lat}&longitude=${lon}&current=temperature_2m,relative_humidity_2m,weather_code,wind_speed_10m,wind_direction_10m&hourly=temperature_2m&forecast_days=2&past_days=1`;

    const [aqiRes, weatherRes] = await Promise.all([
      axios.get(aqiUrl, { timeout: 8000 }),
      axios.get(weatherUrl, { timeout: 8000 }),
    ]);

    const curAQI = aqiRes.data.current;
    const curWeather = weatherRes.data.current;
    const hourlyAQI = aqiRes.data.hourly;
    const hourlyWeather = weatherRes.data.hourly;

    const pm25 = curAQI.pm2_5 != null ? Math.round(curAQI.pm2_5 * 10) / 10 : 35;
    const pm10 = curAQI.pm10 != null ? Math.round(curAQI.pm10 * 10) / 10 : 65;
    const no2 = curAQI.nitrogen_dioxide != null ? Math.round(curAQI.nitrogen_dioxide * 10) / 10 : 25;
    const so2 = curAQI.sulphur_dioxide != null ? Math.round(curAQI.sulphur_dioxide * 10) / 10 : 12;
    // Open-Meteo CO is in ug/m3, convert to mg/m3
    const co = curAQI.carbon_monoxide != null ? Math.round((curAQI.carbon_monoxide / 1000) * 100) / 100 : 0.8;
    const o3 = curAQI.ozone != null ? Math.round(curAQI.ozone * 10) / 10 : 40;
    const nh3 = curAQI.ammonia != null ? Math.round(curAQI.ammonia * 10) / 10 : null;

    // Calculate Indian CPCB AQI based on actual PM2.5 and PM10
    const calculated = calculateCPCB_AQI(pm25, pm10);
    // Alternatively fallback to US AQI if available
    const aqiValue = curAQI.us_aqi != null ? Math.max(calculated.aqi, curAQI.us_aqi) : calculated.aqi;
    const { category } = calculateCPCB_AQI(pm25, pm10);
    const healthGuidance = getHealthGuidance(category);

    const weatherCondition = getWeatherConditionText(curWeather.weather_code);

    // Build genuine hourly trend
    const hourlyTrend: AQIResponseData['hourlyTrend'] = [];
    if (hourlyAQI && hourlyAQI.time && hourlyAQI.time.length > 0) {
      const nowIso = new Date().toISOString().slice(0, 13);
      const curIndex = hourlyAQI.time.findIndex((t: string) => t.startsWith(nowIso));
      const startIndex = curIndex > 12 ? curIndex - 12 : 0;
      const endIndex = Math.min(startIndex + 24, hourlyAQI.time.length);

      for (let i = startIndex; i < endIndex; i++) {
        const hPm25 = hourlyAQI.pm2_5?.[i] ?? pm25;
        const hPm10 = hourlyAQI.pm10?.[i] ?? pm10;
        const hCalc = calculateCPCB_AQI(hPm25, hPm10);
        const hTemp = hourlyWeather?.temperature_2m?.[i] ?? curWeather.temperature_2m;
        hourlyTrend.push({
          time: hourlyAQI.time[i],
          aqi: hourlyAQI.us_aqi?.[i] != null ? Math.max(hCalc.aqi, hourlyAQI.us_aqi[i]) : hCalc.aqi,
          pm25: Math.round(hPm25 * 10) / 10,
          pm10: Math.round(hPm10 * 10) / 10,
          temperature: Math.round(hTemp),
        });
      }
    }

    const result: AQIResponseData = {
      location: {
        name: locationName,
        city: city || locationName,
        lat,
        lon,
      },
      aqi: aqiValue,
      aqiCategory: category,
      standard: 'CPCB / US EPA Hybrid',
      healthGuidance,
      pollutants: {
        pm25,
        pm10,
        no2,
        so2,
        co,
        o3,
        nh3,
      },
      weather: {
        temperature: Math.round(curWeather.temperature_2m),
        humidity: Math.round(curWeather.relative_humidity_2m),
        windSpeed: Math.round(curWeather.wind_speed_10m * 10) / 10,
        windDirection: Math.round(curWeather.wind_direction_10m),
        condition: weatherCondition,
        code: curWeather.weather_code,
      },
      hourlyTrend,
      dataSource: 'Open-Meteo Air Quality (Copernicus CAMS & GFS)',
      isDemo: false,
      lastUpdated: new Date().toISOString(),
    };

    // Cache the result
    cache.set(cacheKey, { data: result, expiry: Date.now() + CACHE_TTL_MS });

    // Asynchronously log to AirQuality collection (do not block)
    AirQuality.create({
      location: result.location,
      aqi: result.aqi,
      aqiCategory: result.aqiCategory,
      standard: result.standard,
      pollutants: result.pollutants,
      weather: result.weather,
      dataSource: result.dataSource,
      isDemo: false,
      timestamp: new Date(),
    }).catch((err) => console.error('Failed to log AQI to MongoDB:', err.message));

    return result;
  } catch (error: any) {
    console.warn(`Live AQI API failed for (${lat}, ${lon}): ${error.message}. Activating clearly marked DEMO Mode.`);
    return getFallbackDemoData(lat, lon, locationName, city);
  }
};

const getWeatherConditionText = (code: number): string => {
  if (code === 0) return 'Clear Sky';
  if (code === 1 || code === 2) return 'Partly Cloudy';
  if (code === 3) return 'Overcast';
  if (code === 45 || code === 48) return 'Dense Fog / Smog';
  if (code >= 51 && code <= 55) return 'Drizzle';
  if (code >= 61 && code <= 65) return 'Rain';
  if (code >= 71 && code <= 77) return 'Snow';
  if (code >= 80 && code <= 82) return 'Rain Showers';
  if (code >= 95) return 'Thunderstorm';
  return 'Hazy / Low Visibility';
};

export const getFallbackDemoData = (
  lat: number,
  lon: number,
  locationName: string,
  city: string
): AQIResponseData => {
  const pm25 = 145.4;
  const pm10 = 230.8;
  const { aqi, category } = calculateCPCB_AQI(pm25, pm10);
  const healthGuidance = getHealthGuidance(category);

  const hourlyTrend = [];
  const now = new Date();
  for (let i = 12; i >= 0; i--) {
    const t = new Date(now.getTime() - i * 3600 * 1000);
    const variation = Math.sin(i / 2) * 25;
    hourlyTrend.push({
      time: t.toISOString(),
      aqi: Math.round(aqi + variation),
      pm25: Math.round((pm25 + variation * 0.6) * 10) / 10,
      pm10: Math.round((pm10 + variation) * 10) / 10,
      temperature: 18 - Math.round(i / 3),
    });
  }

  return {
    location: {
      name: locationName,
      city: city || locationName,
      lat,
      lon,
    },
    aqi,
    aqiCategory: category,
    standard: 'Indian CPCB AQI (Demo Simulation)',
    healthGuidance,
    pollutants: {
      pm25,
      pm10,
      no2: 48.2,
      so2: 19.5,
      co: 1.45,
      o3: 32.1,
      nh3: 18.0,
    },
    weather: {
      temperature: 19,
      humidity: 78,
      windSpeed: 4.2,
      windDirection: 310,
      condition: 'Dense Winter Smog / Haze (Demo)',
      code: 45,
    },
    hourlyTrend,
    dataSource: 'DEMO MODE — Simulation Data (External API Offline)',
    isDemo: true,
    lastUpdated: new Date().toISOString(),
  };
};
