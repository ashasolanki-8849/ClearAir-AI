import { apiClient } from './api';
import {
  UserSustainabilityProfileData,
  SustainableRecommendationData,
  SustainableActionData,
  BudgetAlternativeData,
  LocalSustainableFacilityData,
  ImpactCalculationResultData,
  ImpactSummaryData,
  ChallengeProgressData,
  HouseholdSustainabilityData,
  SustainabilityAIData,
  BeforeAfterComparisonItem,
  BudgetPreference,
} from '../types';

export const sustainabilityService = {
  // 1. Dashboard Aggregate
  getDashboard: async (): Promise<{
    success: boolean;
    data: {
      sustainabilityScore: UserSustainabilityProfileData['sustainabilityScore'];
      profile: UserSustainabilityProfileData;
      recommendedImprovements: SustainableRecommendationData[];
      allRecommendations: SustainableRecommendationData[];
      dailyActions: SustainableActionData[];
      challengeProgress: ChallengeProgressData;
      household: HouseholdSustainabilityData;
      impactSummary: ImpactSummaryData;
    };
  }> => {
    return apiClient('/sustainability/dashboard');
  },

  // 2. Recommendations
  getRecommendations: async (
    category?: string,
    budget?: string
  ): Promise<{
    success: boolean;
    count: number;
    recommendations: SustainableRecommendationData[];
  }> => {
    let url = '/sustainability/recommendations';
    const params = new URLSearchParams();
    if (category && category !== 'all') params.append('category', category);
    if (budget && budget !== 'all') params.append('budget', budget);
    if (params.toString()) url += `?${params.toString()}`;
    return apiClient(url);
  },

  updateRecommendationAction: async (
    id: string,
    status: 'completed' | 'skipped' | 'in_progress',
    notes?: string
  ): Promise<{
    success: boolean;
    action: SustainableActionData;
    sustainabilityScore: UserSustainabilityProfileData['sustainabilityScore'];
  }> => {
    return apiClient(`/sustainability/recommendations/${id}/status`, {
      method: 'PATCH',
      bodyData: { status, notes },
    });
  },

  // 3. User Profile
  getProfile: async (): Promise<{
    success: boolean;
    profile: UserSustainabilityProfileData;
  }> => {
    return apiClient('/sustainability/profile');
  },

  updateProfile: async (
    data: Partial<UserSustainabilityProfileData>
  ): Promise<{
    success: boolean;
    profile: UserSustainabilityProfileData;
  }> => {
    return apiClient('/sustainability/profile', {
      method: 'PUT',
      bodyData: data,
    });
  },

  // 4. Budget Alternatives
  getAlternatives: async (
    budget?: BudgetPreference
  ): Promise<{
    success: boolean;
    count: number;
    alternatives: BudgetAlternativeData[];
  }> => {
    const url = budget && budget !== 'all' ? `/sustainability/alternatives?budget=${budget}` : '/sustainability/alternatives';
    return apiClient(url);
  },

  // 5. Local Solutions
  getLocalSolutions: async (
    lat?: number,
    lon?: number,
    category?: string
  ): Promise<{
    success: boolean;
    facilities: LocalSustainableFacilityData[];
    totalFound: number;
    dataNotice: string;
    sourceAttribution: string;
  }> => {
    const params = new URLSearchParams();
    if (lat !== undefined) params.append('lat', lat.toString());
    if (lon !== undefined) params.append('lon', lon.toString());
    if (category && category !== 'all') params.append('category', category);
    const qs = params.toString() ? `?${params.toString()}` : '';
    return apiClient(`/sustainability/local-solutions${qs}`);
  },

  // 6. AI Sustainable Lifestyle Advisor
  chatWithAdvisor: async (
    message: string,
    context?: {
      locationName?: string;
      currentAqi?: number;
      dominantPollutant?: string;
      temperature?: number;
      humidity?: number;
      userCategory?: string;
    }
  ): Promise<{
    success: boolean;
    advice: SustainabilityAIData;
    source: string;
  }> => {
    return apiClient('/sustainability/assistant/chat', {
      method: 'POST',
      bodyData: { message, context },
    });
  },

  // 7. Environmental Impact Calculator
  calculateImpact: async (data: {
    activityType: string;
    quantity: number;
    unit: string;
    period?: 'single_action' | 'daily' | 'weekly' | 'monthly';
    description?: string;
  }): Promise<{
    success: boolean;
    impact: ImpactCalculationResultData;
  }> => {
    return apiClient('/sustainability/impact/calculate', {
      method: 'POST',
      bodyData: data,
    });
  },

  getImpactSummary: async (): Promise<{
    success: boolean;
    summary: ImpactSummaryData;
  }> => {
    return apiClient('/sustainability/impact/summary');
  },

  // 8. 7-Day Sustainable Living Challenges
  getChallengeProgress: async (): Promise<{
    success: boolean;
    progress: ChallengeProgressData;
  }> => {
    return apiClient('/sustainability/challenges/progress');
  },

  updateChallengeDay: async (
    dayNumber: number,
    isCompleted: boolean
  ): Promise<{
    success: boolean;
    progress: ChallengeProgressData;
  }> => {
    return apiClient('/sustainability/challenges/current/progress', {
      method: 'PATCH',
      bodyData: { dayNumber, isCompleted },
    });
  },

  // 9. Household & Community
  getHousehold: async (): Promise<{
    success: boolean;
    household: HouseholdSustainabilityData;
  }> => {
    return apiClient('/sustainability/household');
  },

  addHouseholdGoal: async (goal: {
    title: string;
    category?: string;
    targetDescription: string;
    assignedMemberName?: string;
    targetDate?: string;
  }): Promise<{
    success: boolean;
    household: HouseholdSustainabilityData;
  }> => {
    return apiClient('/sustainability/household/goals', {
      method: 'POST',
      bodyData: goal,
    });
  },

  updateHouseholdGoal: async (
    goalId: string,
    updates: {
      progressPercentage?: number;
      isCompleted?: boolean;
    }
  ): Promise<{
    success: boolean;
    household: HouseholdSustainabilityData;
  }> => {
    return apiClient(`/sustainability/household/goals/${goalId}`, {
      method: 'PATCH',
      bodyData: updates,
    });
  },

  // 10. Lifestyle Comparisons & History
  getComparisons: async (): Promise<{
    success: boolean;
    comparisons: BeforeAfterComparisonItem[];
    overallMonthlyCo2SavedKg: number;
    overallMonthlyMoneySavedInr: number;
    disclaimerNotice: string;
  }> => {
    return apiClient('/sustainability/comparison');
  },
};
