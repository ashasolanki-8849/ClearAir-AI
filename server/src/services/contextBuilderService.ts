import { User, IUser } from '../models/User.js';
import { fetchRealtimeAQI, AQIResponseData } from './aqiService.js';

export interface EnvironmentalContext {
  locationName: string;
  city: string;
  lat: number;
  lon: number;
  aqi: number;
  aqiCategory: string;
  standard: string;
  dominantPollutant: string;
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
  };
  dataSource: string;
  isDemo: boolean;
  lastUpdated: string;
}

export interface UserContext {
  userId?: string;
  fullName: string;
  userCategory: string; // 'student' | 'professional' | 'family' | 'elderly' | 'community'
  ageGroup: string; // 'under_18' | '18_35' | '36_60' | 'above_60'
  city: string;
}

export interface FullAssistantContext {
  environmental: EnvironmentalContext;
  user: UserContext;
  hasRealtimeData: boolean;
  dataNotice?: string;
}

export const buildAssistantContext = async (
  userId?: string | null,
  overrideLocation?: { lat: number; lon: number; name: string; city?: string }
): Promise<FullAssistantContext> => {
  // 1. Fetch user profile if logged in
  let userContext: UserContext = {
    fullName: 'Guest User',
    userCategory: 'family',
    ageGroup: '18_35',
    city: 'New Delhi',
  };

  let targetLat = 28.6139;
  let targetLon = 77.2090;
  let targetName = 'New Delhi';
  let targetCity = 'Delhi';

  if (userId) {
    try {
      const dbUser = await User.findById(userId);
      if (dbUser) {
        userContext = {
          userId: dbUser._id.toString(),
          fullName: dbUser.fullName,
          userCategory: dbUser.userCategory || 'family',
          ageGroup: dbUser.ageGroup || '18_35',
          city: dbUser.city || 'Delhi',
        };

        if (dbUser.preferredLocation && dbUser.preferredLocation.lat && dbUser.preferredLocation.lon) {
          targetLat = dbUser.preferredLocation.lat;
          targetLon = dbUser.preferredLocation.lon;
          targetName = dbUser.preferredLocation.name || dbUser.city;
          targetCity = dbUser.city;
        }
      }
    } catch (err: any) {
      console.warn('Could not load user profile for AI context:', err.message);
    }
  }

  // 2. Allow override from current active client location
  if (overrideLocation && overrideLocation.lat != null && overrideLocation.lon != null) {
    targetLat = overrideLocation.lat;
    targetLon = overrideLocation.lon;
    targetName = overrideLocation.name || targetName;
    targetCity = overrideLocation.city || targetName;
  }

  // 3. Fetch real-time AQI telemetry
  const aqiData: AQIResponseData = await fetchRealtimeAQI(targetLat, targetLon, targetName, targetCity);

  const dominant =
    aqiData.pollutants.pm25 > 60
      ? `PM2.5 (${aqiData.pollutants.pm25} µg/m³)`
      : aqiData.pollutants.pm10 > 100
      ? `PM10 (${aqiData.pollutants.pm10} µg/m³)`
      : 'PM2.5';

  const environmentalContext: EnvironmentalContext = {
    locationName: aqiData.location.name,
    city: aqiData.location.city,
    lat: aqiData.location.lat,
    lon: aqiData.location.lon,
    aqi: aqiData.aqi,
    aqiCategory: aqiData.aqiCategory,
    standard: aqiData.standard,
    dominantPollutant: dominant,
    pollutants: aqiData.pollutants,
    weather: aqiData.weather,
    dataSource: aqiData.dataSource,
    isDemo: aqiData.isDemo,
    lastUpdated: aqiData.lastUpdated,
  };

  const hasRealtimeData = !aqiData.isDemo;
  const dataNotice = aqiData.isDemo
    ? 'Note: Live satellite feed is currently unreachable; observations reflect regional historical smog models and may differ slightly from ambient real-time levels.'
    : undefined;

  return {
    environmental: environmentalContext,
    user: userContext,
    hasRealtimeData,
    dataNotice,
  };
};
