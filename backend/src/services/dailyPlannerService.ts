import { DailyPlan, IDailyPlan, IPlannedActivity } from '../models/DailyPlan.js';
import { LifestyleProfile, ILifestyleProfile } from '../models/LifestyleProfile.js';
import { fetchRealtimeAQI, AQIResponseData } from './aqiService.js';
import { generatePersonalizedSchedule } from './scheduleGeneratorService.js';
import { recalculatePlanWithLiveAQI } from './scheduleAdjustmentService.js';

export const getOrCreateTodayPlan = async (
  userId: string,
  preferredLocation?: { lat: number; lon: number; name: string; city?: string },
  language: 'en' | 'hi' | 'gu' = 'en'
): Promise<{ plan: IDailyPlan; isNew: boolean; aqiData: AQIResponseData; message?: string }> => {
  const todayDate = new Date().toISOString().slice(0, 10); // YYYY-MM-DD

  // 1. Fetch user's lifestyle profile (or create defaults)
  let lifestyle = await LifestyleProfile.findOne({ userId });
  if (!lifestyle) {
    lifestyle = await LifestyleProfile.create({
      userId,
      userCategory: 'professional',
      schedule: {
        wakeUpTime: '06:30',
        sleepTime: '22:30',
        workOrSchoolStart: '09:00',
        workOrSchoolEnd: '17:30',
        exerciseTime: '07:00',
        mealTimings: { breakfast: '08:00', lunch: '13:00', dinner: '20:30' },
        travelTimings: { morningCommute: '08:30', eveningCommute: '17:30' },
      },
      activityPreferences: ['morning_walk', 'yoga', 'commuting', 'shopping'],
      transportationPreferences: ['public_transport', 'walking'],
    });
  }

  // 2. Determine target coordinates
  const lat = preferredLocation?.lat ?? lifestyle.preferredLocation?.lat ?? 28.6139;
  const lon = preferredLocation?.lon ?? lifestyle.preferredLocation?.lon ?? 77.2090;
  const locName = preferredLocation?.name ?? lifestyle.preferredLocation?.name ?? 'New Delhi';
  const locCity = preferredLocation?.city ?? locName;

  // 3. Fetch real-time telemetry from Open-Meteo & Copernicus CAMS
  const aqiData = await fetchRealtimeAQI(lat, lon, locName, locCity);

  // 4. Check if a plan for today already exists
  let existingPlan = await DailyPlan.findOne({ userId, date: todayDate });

  if (existingPlan) {
    // Dynamically check if AQI has shifted and re-evaluate pending activities
    const adjResult = recalculatePlanWithLiveAQI(existingPlan, aqiData, false);
    if (adjResult.updated) {
      await existingPlan.save();
    }
    return {
      plan: existingPlan,
      isNew: false,
      aqiData,
      message: adjResult.updated ? adjResult.reason : undefined,
    };
  }

  // 5. Generate new plan
  const activities = generatePersonalizedSchedule({
    aqiData,
    lifestyle,
    language,
  });

  const newPlan = await DailyPlan.create({
    userId,
    date: todayDate,
    environmentalContext: {
      locationName: aqiData.location.name,
      city: aqiData.location.city,
      lat: aqiData.location.lat,
      lon: aqiData.location.lon,
      aqi: aqiData.aqi,
      aqiCategory: aqiData.aqiCategory,
      pm25: aqiData.pollutants.pm25,
      pm10: aqiData.pollutants.pm10,
      temperature: aqiData.weather.temperature,
      timestamp: new Date(),
    },
    activities,
    completionPercentage: 0,
    exposureScore: {
      outdoorMinutes: activities.filter((a) => a.indoorOutdoor === 'outdoor').length * 45,
      indoorMinutes: activities.filter((a) => a.indoorOutdoor === 'indoor').length * 90,
      exposureAvoidanceActions: 0,
    },
    lastCalculatedAqi: aqiData.aqi,
    language,
  });

  return {
    plan: newPlan,
    isNew: true,
    aqiData,
  };
};
