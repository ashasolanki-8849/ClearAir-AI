import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { LifestyleProfile } from '../models/LifestyleProfile.js';
import { DailyPlan } from '../models/DailyPlan.js';
import { FamilyProfile } from '../models/FamilyProfile.js';
import { PlannerReminder } from '../models/PlannerReminder.js';
import { getOrCreateTodayPlan } from '../services/dailyPlannerService.js';
import { fetchRealtimeAQI } from '../services/aqiService.js';
import { generatePersonalizedSchedule } from '../services/scheduleGeneratorService.js';
import { recalculatePlanWithLiveAQI } from '../services/scheduleAdjustmentService.js';
import { generateFamilyGuidance } from '../services/activityRecommendationService.js';

// ================= LIFESTYLE PROFILE ================= //

export const getLifestyle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let profile = await LifestyleProfile.findOne({ userId });
    if (!profile) {
      profile = await LifestyleProfile.create({
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

    res.status(200).json({ success: true, profile });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateLifestyle = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { userCategory, schedule, activityPreferences, transportationPreferences, healthVulnerabilities } =
      req.body;

    const profile = await LifestyleProfile.findOneAndUpdate(
      { userId },
      {
        $set: {
          ...(userCategory && { userCategory }),
          ...(schedule && { schedule }),
          ...(activityPreferences && { activityPreferences }),
          ...(transportationPreferences && { transportationPreferences }),
          ...(healthVulnerabilities && { healthVulnerabilities }),
        },
      },
      { new: true, upsert: true }
    );

    res.status(200).json({
      success: true,
      message: 'Lifestyle profile updated successfully.',
      profile,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= DAILY PLANS ================= //

export const getTodayPlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { lat, lon, name, city, language = 'en' } = req.query;
    const location =
      lat && lon ? { lat: Number(lat), lon: Number(lon), name: (name as string) || 'Selected Location', city: city as string } : undefined;

    const result = await getOrCreateTodayPlan(userId, location, (language as any) || 'en');

    res.status(200).json({
      success: true,
      plan: result.plan,
      isNew: result.isNew,
      aqiData: result.aqiData,
      message: result.message,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const generatePlan = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { location, language = 'en', force = true } = req.body;
    const todayDate = new Date().toISOString().slice(0, 10);

    const lifestyle =
      (await LifestyleProfile.findOne({ userId })) ||
      (await LifestyleProfile.create({ userId, userCategory: 'professional' }));

    const targetLat = location?.lat || lifestyle.preferredLocation?.lat || 28.6139;
    const targetLon = location?.lon || lifestyle.preferredLocation?.lon || 77.2090;
    const targetName = location?.name || lifestyle.preferredLocation?.name || 'New Delhi';
    const targetCity = location?.city || targetName;

    const aqiData = await fetchRealtimeAQI(targetLat, targetLon, targetName, targetCity);

    let plan = await DailyPlan.findOne({ userId, date: todayDate });

    if (plan && !force) {
      const adjustment = recalculatePlanWithLiveAQI(plan, aqiData, true);
      await plan.save();
      res.status(200).json({ success: true, plan, aqiData, message: adjustment.reason });
      return;
    }

    // Force regenerate fresh plan
    const activities = generatePersonalizedSchedule({
      aqiData,
      lifestyle,
      language,
    });

    if (plan) {
      plan.activities = activities;
      plan.environmentalContext = {
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
      };
      plan.completionPercentage = 0;
      plan.lastCalculatedAqi = aqiData.aqi;
      plan.language = language;
      await plan.save();
    } else {
      plan = await DailyPlan.create({
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
        lastCalculatedAqi: aqiData.aqi,
        language,
      });
    }

    res.status(200).json({
      success: true,
      message: 'Daily plan generated with real-time CPCB telemetry.',
      plan,
      aqiData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateActivityStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { activityId } = req.params;
    const { status, planId } = req.body; // 'completed' | 'skipped' | 'pending'

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const plan = planId
      ? await DailyPlan.findOne({ _id: planId, userId })
      : await DailyPlan.findOne({ userId, date: todayDate });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Daily plan not found.' });
      return;
    }

    const activity = plan.activities.find((a) => a.id === activityId);
    if (!activity) {
      res.status(404).json({ success: false, message: 'Activity not found in plan.' });
      return;
    }

    activity.status = status;
    activity.completedAt = status === 'completed' ? new Date() : null;

    // Recalculate completion percentage
    const total = plan.activities.length;
    const completed = plan.activities.filter((a) => a.status === 'completed').length;
    plan.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    await plan.save();

    res.status(200).json({
      success: true,
      message: `Activity marked as ${status}.`,
      completionPercentage: plan.completionPercentage,
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const swapActivityWithAlternative = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { activityId } = req.params;
    const { planId } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const plan = planId
      ? await DailyPlan.findOne({ _id: planId, userId })
      : await DailyPlan.findOne({ userId, date: todayDate });

    if (!plan) {
      res.status(404).json({ success: false, message: 'Plan not found.' });
      return;
    }

    const actIndex = plan.activities.findIndex((a) => a.id === activityId);
    if (actIndex === -1) {
      res.status(404).json({ success: false, message: 'Activity not found.' });
      return;
    }

    const act = plan.activities[actIndex];
    const prevAct = act.activity;
    act.activity = act.alternativeActivity;
    act.alternativeActivity = prevAct;
    act.indoorOutdoor = 'indoor';
    act.isAlternativeApplied = true;
    act.reason = 'User opted for safer indoor substitute to reduce particulate inhalation.';

    await plan.save();

    res.status(200).json({
      success: true,
      message: 'Replaced activity with safer indoor alternative.',
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const addCustomActivity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { period, activity, recommendedTime, indoorOutdoor } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const todayDate = new Date().toISOString().slice(0, 10);
    const plan = await DailyPlan.findOne({ userId, date: todayDate });
    if (!plan) {
      res.status(404).json({ success: false, message: 'Today’s plan does not exist yet. Please generate one first.' });
      return;
    }

    const newAct = {
      id: `custom_${Date.now()}`,
      period: period || 'afternoon',
      periodLabel: period?.toUpperCase() || 'AFTERNOON',
      activity: activity.trim(),
      recommendedTime: recommendedTime || '14:00',
      indoorOutdoor: indoorOutdoor || 'indoor',
      pollutionRisk: 'moderate',
      reason: 'Custom schedule entry added by user.',
      alternativeActivity: 'Indoor rest or indoor equivalent',
      expectedBenefit: 'Maintains personal routine safely.',
      personalBenefit: 'User-directed exposure control.',
      environmentalBenefit: 'Conscious scheduling reduces peak emission overlap.',
      status: 'pending',
      isCustom: true,
      isAlternativeApplied: false,
    };

    plan.activities.push(newAct as any);

    const total = plan.activities.length;
    const completed = plan.activities.filter((a) => a.status === 'completed').length;
    plan.completionPercentage = total > 0 ? Math.round((completed / total) * 100) : 0;

    await plan.save();

    res.status(201).json({
      success: true,
      message: 'Custom activity added to planner.',
      plan,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPlanHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const plans = await DailyPlan.find({ userId }).sort({ date: -1 }).limit(14);

    res.status(200).json({ success: true, plans });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= FAMILY PROFILES ================= //

export const getFamilyProfiles = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const members = await FamilyProfile.find({ ownerUserId: userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, members });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createFamilyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { name, relationship, category, age, activityPreferences, healthNotes } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!name || age == null || !category) {
      res.status(400).json({ success: false, message: 'Name, age and category are required' });
      return;
    }

    const member = await FamilyProfile.create({
      ownerUserId: userId,
      name: name.trim(),
      relationship: relationship || 'child',
      category,
      age: Number(age),
      activityPreferences: activityPreferences || [],
      healthNotes: healthNotes || '',
    });

    res.status(201).json({ success: true, member, message: 'Family member profile added.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteFamilyProfile = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    await FamilyProfile.findOneAndDelete({ _id: id, ownerUserId: userId });

    res.status(200).json({ success: true, message: 'Family member removed.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getFamilyRecommendations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { lat, lon, name, language = 'en' } = req.query;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const members = await FamilyProfile.find({ ownerUserId: userId });
    const targetLat = lat ? Number(lat) : 28.6139;
    const targetLon = lon ? Number(lon) : 77.2090;

    const aqiData = await fetchRealtimeAQI(targetLat, targetLon, (name as string) || 'Delhi');
    const guidance = generateFamilyGuidance(members, aqiData, (language as string) || 'en');

    res.status(200).json({
      success: true,
      guidance,
      aqiData,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ================= REMINDERS ================= //

export const getReminders = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let reminders = await PlannerReminder.find({ userId });
    if (reminders.length === 0) {
      await PlannerReminder.create([
        {
          userId: userId as any,
          reminderType: 'morning_aqi',
          title: 'Morning AQI & Smog Check',
          time: '07:00',
          enabled: true,
        },
        {
          userId: userId as any,
          reminderType: 'pre_exercise',
          title: 'Pre-Workout Air Safety Check',
          time: '06:30',
          enabled: true,
        },
        {
          userId: userId as any,
          reminderType: 'evening_update',
          title: 'Evening Smog Inversion Review',
          time: '18:00',
          enabled: true,
        },
      ]);
      reminders = await PlannerReminder.find({ userId });
    }

    res.status(200).json({ success: true, reminders });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const toggleReminder = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;
    const { enabled, time } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const updated = await PlannerReminder.findOneAndUpdate(
      { _id: id, userId },
      {
        $set: {
          ...(enabled != null && { enabled: Boolean(enabled) }),
          ...(time && { time }),
        },
      },
      { new: true }
    );

    res.status(200).json({ success: true, reminder: updated });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
