import { apiClient } from './api';
import {
  DailyPlanData,
  LifestyleProfileData,
  FamilyProfileData,
  FamilyGuidanceItem,
  PlannerReminderData,
  AQIData,
} from '../types';

export const plannerService = {
  // Lifestyle
  getLifestyle: async (): Promise<{ success: boolean; profile: LifestyleProfileData }> => {
    return apiClient('/planner/lifestyle');
  },

  updateLifestyle: async (
    profile: Partial<LifestyleProfileData>
  ): Promise<{ success: boolean; message: string; profile: LifestyleProfileData }> => {
    return apiClient('/planner/lifestyle', {
      method: 'PUT',
      bodyData: profile,
    });
  },

  // Daily Plans
  getTodayPlan: async (
    location?: { lat: number; lon: number; name: string; city?: string },
    language: string = 'en'
  ): Promise<{
    success: boolean;
    plan: DailyPlanData;
    isNew: boolean;
    aqiData: AQIData;
    message?: string;
  }> => {
    const params = new URLSearchParams();
    if (location) {
      params.append('lat', location.lat.toString());
      params.append('lon', location.lon.toString());
      params.append('name', location.name);
      if (location.city) params.append('city', location.city);
    }
    params.append('language', language);

    return apiClient(`/planner/today?${params.toString()}`);
  },

  generatePlan: async (
    location?: { lat: number; lon: number; name: string; city?: string },
    language: string = 'en',
    force: boolean = true
  ): Promise<{
    success: boolean;
    message: string;
    plan: DailyPlanData;
    aqiData: AQIData;
  }> => {
    return apiClient('/planner/generate', {
      method: 'POST',
      bodyData: { location, language, force },
    });
  },

  updateActivityStatus: async (
    activityId: string,
    status: 'pending' | 'completed' | 'skipped',
    planId?: string
  ): Promise<{
    success: boolean;
    message: string;
    completionPercentage: number;
    plan: DailyPlanData;
  }> => {
    return apiClient(`/planner/activity/${activityId}/status`, {
      method: 'PATCH',
      bodyData: { status, planId },
    });
  },

  swapActivityWithAlternative: async (
    activityId: string,
    planId?: string
  ): Promise<{
    success: boolean;
    message: string;
    plan: DailyPlanData;
  }> => {
    return apiClient(`/planner/activity/${activityId}/swap`, {
      method: 'POST',
      bodyData: { planId },
    });
  },

  addCustomActivity: async (activityData: {
    period: string;
    activity: string;
    recommendedTime: string;
    indoorOutdoor: string;
  }): Promise<{
    success: boolean;
    message: string;
    plan: DailyPlanData;
  }> => {
    return apiClient('/planner/activity/custom', {
      method: 'POST',
      bodyData: activityData,
    });
  },

  getPlanHistory: async (): Promise<{ success: boolean; plans: DailyPlanData[] }> => {
    return apiClient('/planner/history');
  },

  // Family
  getFamilyProfiles: async (): Promise<{ success: boolean; members: FamilyProfileData[] }> => {
    return apiClient('/planner/family');
  },

  createFamilyProfile: async (
    member: Partial<FamilyProfileData>
  ): Promise<{ success: boolean; member: FamilyProfileData; message: string }> => {
    return apiClient('/planner/family', {
      method: 'POST',
      bodyData: member,
    });
  },

  deleteFamilyProfile: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/planner/family/${id}`, {
      method: 'DELETE',
    });
  },

  getFamilyRecommendations: async (
    location?: { lat: number; lon: number; name: string },
    language: string = 'en'
  ): Promise<{
    success: boolean;
    guidance: FamilyGuidanceItem[];
    aqiData: AQIData;
  }> => {
    const params = new URLSearchParams();
    if (location) {
      params.append('lat', location.lat.toString());
      params.append('lon', location.lon.toString());
      params.append('name', location.name);
    }
    params.append('language', language);
    return apiClient(`/planner/family/recommendations?${params.toString()}`);
  },

  // Reminders
  getReminders: async (): Promise<{ success: boolean; reminders: PlannerReminderData[] }> => {
    return apiClient('/planner/reminders');
  },

  toggleReminder: async (
    id: string,
    enabled: boolean,
    time?: string
  ): Promise<{ success: boolean; reminder: PlannerReminderData }> => {
    return apiClient(`/planner/reminders/${id}`, {
      method: 'PUT',
      bodyData: { enabled, time },
    });
  },
};
