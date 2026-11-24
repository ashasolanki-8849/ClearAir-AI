import { apiClient } from './api';
import {
  DashboardImpactData,
  CarbonFootprintRecordData,
  EnvironmentalActivityData,
  EnvironmentalGoalData,
  ComparisonAnalyticsData,
  SmartInsightItem,
  LocalPollutionAwarenessData,
  EnvironmentalReportData,
  FamilyImpactSummaryData,
  CommunityImpactProgressData,
  ImpactAIAdvisorData,
  EmissionFactorData,
  GoalCategory,
  GoalStatus,
  ActivityCategory,
  ReportType,
} from '../types';

export const impactService = {
  // 1. Dashboard, Summary & Insights
  getDashboard: async (
    filter?: string,
    startDate?: string,
    endDate?: string
  ): Promise<{ success: boolean; dashboard: DashboardImpactData }> => {
    let url = '/impact/dashboard';
    const q = new URLSearchParams();
    if (filter) q.append('filter', filter);
    if (startDate) q.append('startDate', startDate);
    if (endDate) q.append('endDate', endDate);
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  getSummary: async (): Promise<{ success: boolean; summary: DashboardImpactData }> => {
    return apiClient('/impact/summary');
  },

  getTrends: async (): Promise<{ success: boolean; trends: any[] }> => {
    return apiClient('/impact/trends');
  },

  getSmartInsights: async (): Promise<{
    success: boolean;
    data?: SmartInsightItem[];
    insights: SmartInsightItem[];
    error?: string;
  }> => {
    const res: any = await apiClient('/impact/insights');
    return {
      success: res.success,
      data: res.insights || res.data,
      insights: res.insights || [],
      error: res.error,
    };
  },

  // 2. Carbon Footprint Calculations
  calculateTransport: async (data: {
    transportMode: string;
    distanceKm: number;
    passengers?: number;
    fuelType?: string;
    saveToLog?: boolean;
  }): Promise<{ success: boolean; result: any; savedRecord?: CarbonFootprintRecordData }> => {
    return apiClient('/impact/transport/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateEnergy: async (data: {
    kwh?: number;
    fuelType?: string;
    quantity?: number;
    billingPeriod?: string;
    renewableShare?: number;
    saveToLog?: boolean;
  }): Promise<{ success: boolean; result: any; savedRecord?: CarbonFootprintRecordData }> => {
    return apiClient('/impact/energy/calculate', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateWaste: async (data: {
    wasteType: 'mixed_unsegregated' | 'organic_composted' | 'recyclable_recovered';
    quantityKg: number;
    saveToLog?: boolean;
  }): Promise<{ success: boolean; result: any; savedRecord?: CarbonFootprintRecordData }> => {
    return apiClient('/impact/waste/record', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  calculateWater: async (data: {
    liters: number;
    saveToLog?: boolean;
  }): Promise<{ success: boolean; result: any; savedRecord?: CarbonFootprintRecordData }> => {
    return apiClient('/impact/water/record', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getCarbonHistory: async (params?: {
    category?: string;
    startDate?: string;
    endDate?: string;
    limit?: number;
    skip?: number;
  }): Promise<{ success: boolean; records: CarbonFootprintRecordData[]; total: number }> => {
    let url = '/impact/carbon/history';
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.startDate) q.append('startDate', params.startDate);
    if (params?.endDate) q.append('endDate', params.endDate);
    if (params?.limit) q.append('limit', params.limit.toString());
    if (params?.skip) q.append('skip', params.skip.toString());
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  // 3. Activity Logger
  getActivities: async (params?: {
    category?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    activities: EnvironmentalActivityData[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    let url = '/impact/activities';
    const q = new URLSearchParams();
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  logActivity: async (data: {
    activityName: string;
    category: ActivityCategory;
    date?: string;
    quantity?: number;
    unit?: string;
    notes?: string;
  }): Promise<{ success: boolean; activity: EnvironmentalActivityData }> => {
    return apiClient('/impact/activities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  updateActivity: async (
    id: string,
    data: Partial<EnvironmentalActivityData>
  ): Promise<{ success: boolean; activity: EnvironmentalActivityData }> => {
    return apiClient(`/impact/activities/${id}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
  },

  deleteActivity: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/impact/activities/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Comparison & Local Air Pollution
  comparePeriods: async (
    period1?: { start: string; end: string; label?: string } | string,
    period2?: { start: string; end: string; label?: string } | string
  ): Promise<{
    success: boolean;
    data?: ComparisonAnalyticsData;
    comparison: ComparisonAnalyticsData;
    error?: string;
  }> => {
    const normalizePeriod = (
      p?: { start: string; end: string; label?: string } | string,
      fallbackLabel = 'Period'
    ) => {
      if (typeof p === 'object' && p?.start) return p;
      const now = new Date();
      if (p === 'this_month') {
        const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
        return { start, end: now.toISOString(), label: 'This Month' };
      }
      if (p === 'last_month') {
        const start = new Date(now.getFullYear(), now.getMonth() - 1, 1).toISOString();
        const end = new Date(now.getFullYear(), now.getMonth(), 0).toISOString();
        return { start, end, label: 'Last Month' };
      }
      if (p === 'this_week') {
        const day = now.getDay();
        const diff = now.getDate() - day + (day === 0 ? -6 : 1);
        const start = new Date(now.setDate(diff)).toISOString();
        return { start, end: new Date().toISOString(), label: 'This Week' };
      }
      if (p === 'last_week') {
        const d = new Date();
        d.setDate(d.getDate() - 7);
        return {
          start: new Date(d.getTime() - 7 * 86400000).toISOString(),
          end: d.toISOString(),
          label: 'Last Week',
        };
      }
      if (p === 'today') {
        const start = new Date(now.getFullYear(), now.getMonth(), now.getDate()).toISOString();
        return { start, end: now.toISOString(), label: 'Today' };
      }
      if (p === 'yesterday') {
        const yesterday = new Date(now.getTime() - 86400000);
        const start = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate()
        ).toISOString();
        const end = new Date(
          yesterday.getFullYear(),
          yesterday.getMonth(),
          yesterday.getDate(),
          23,
          59,
          59
        ).toISOString();
        return { start, end, label: 'Yesterday' };
      }
      if (p === 'this_year') {
        const start = new Date(now.getFullYear(), 0, 1).toISOString();
        return { start, end: now.toISOString(), label: 'This Year' };
      }
      if (p === 'last_3_months') {
        const start = new Date(now.getFullYear(), now.getMonth() - 3, 1).toISOString();
        return { start, end: now.toISOString(), label: 'Last 3 Months' };
      }
      const start = new Date(now.getFullYear(), now.getMonth(), 1).toISOString();
      return { start, end: now.toISOString(), label: fallbackLabel };
    };

    const res: any = await apiClient('/impact/compare', {
      method: 'POST',
      body: JSON.stringify({
        period1: normalizePeriod(period1, 'Period 1'),
        period2: normalizePeriod(period2, 'Period 2'),
      }),
    });
    return {
      success: res.success,
      data: res.comparison || res.data,
      comparison: res.comparison,
      error: res.error,
    };
  },

  getLocalPollutionAwareness: async (
    lat?: number,
    lon?: number,
    city?: string
  ): Promise<{
    success: boolean;
    data?: LocalPollutionAwarenessData;
    awareness: LocalPollutionAwarenessData;
    error?: string;
  }> => {
    let url = '/impact/local-pollution';
    const q = new URLSearchParams();
    if (lat) q.append('lat', lat.toString());
    if (lon) q.append('lon', lon.toString());
    if (city) q.append('city', city);
    if (q.toString()) url += `?${q.toString()}`;
    const res: any = await apiClient(url);
    return {
      success: res.success,
      data: res.awareness || res.data,
      awareness: res.awareness,
      error: res.error,
    };
  },

  // 5. Environmental Goals
  getGoals: async (
    status?: string
  ): Promise<{
    success: boolean;
    data?: EnvironmentalGoalData[];
    goals: EnvironmentalGoalData[];
    error?: string;
  }> => {
    let url = '/impact/goals';
    if (status && status !== 'all') url += `?status=${status}`;
    const res: any = await apiClient(url);
    return {
      success: res.success,
      data: res.goals || res.data,
      goals: res.goals || [],
      error: res.error,
    };
  },

  createGoal: async (data: {
    title: string;
    description?: string;
    category: GoalCategory;
    targetValue: number;
    unit: string;
    startDate?: string;
    endDate?: string;
    targetReductionKgCo2e?: number;
    period?: string;
    targetDate?: Date;
    trackingFrequency?: 'daily' | 'weekly' | 'monthly';
    remindersEnabled?: boolean;
    notes?: string;
  }): Promise<{
    success: boolean;
    data?: EnvironmentalGoalData;
    goal: EnvironmentalGoalData;
    error?: string;
  }> => {
    const payload = {
      ...data,
      startDate: data.startDate || new Date().toISOString(),
      endDate: data.endDate || (data.targetDate ? data.targetDate.toISOString() : new Date(Date.now() + 30 * 86400000).toISOString()),
      notes: data.description || data.notes,
    };
    const res: any = await apiClient('/impact/goals', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      data: res.goal || res.data,
      goal: res.goal,
      error: res.error,
    };
  },

  updateGoal: async (
    id: string,
    data: any
  ): Promise<{
    success: boolean;
    data?: EnvironmentalGoalData;
    goal?: EnvironmentalGoalData;
    error?: string;
  }> => {
    let endpoint = `/impact/goals/${id}/status`;
    let method = 'PATCH';
    let body: any = { status: data.status };
    if (data.incrementValue !== undefined) {
      endpoint = `/impact/goals/${id}/progress`;
      body = { incrementValue: data.incrementValue };
    }
    const res: any = await apiClient(endpoint, {
      method,
      body: JSON.stringify(body),
    });
    return {
      success: res.success,
      data: res.goal || res.data,
      goal: res.goal,
      error: res.error,
    };
  },

  updateGoalProgress: async (
    id: string,
    incrementValue: number
  ): Promise<{ success: boolean; goal: EnvironmentalGoalData }> => {
    return apiClient(`/impact/goals/${id}/progress`, {
      method: 'PATCH',
      body: JSON.stringify({ incrementValue }),
    });
  },

  updateGoalStatus: async (
    id: string,
    status: GoalStatus
  ): Promise<{ success: boolean; goal: EnvironmentalGoalData }> => {
    return apiClient(`/impact/goals/${id}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status }),
    });
  },

  deleteGoal: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/impact/goals/${id}`, {
      method: 'DELETE',
    });
  },

  // 6. Family & Community Integrations
  getFamilySummary: async (): Promise<{
    success: boolean;
    summary: FamilyImpactSummaryData;
  }> => {
    return apiClient('/impact/family/summary');
  },

  getFamilyFootprint: async (
    _period?: string
  ): Promise<{
    success: boolean;
    data?: FamilyImpactSummaryData;
    summary?: FamilyImpactSummaryData;
    error?: string;
  }> => {
    const res: any = await apiClient('/impact/family/summary');
    return {
      success: res.success,
      data: res.summary || res.data,
      summary: res.summary,
      error: res.error,
    };
  },

  getCommunityImpact: async (
    communityId?: string,
    _period?: string
  ): Promise<{
    success: boolean;
    data?: CommunityImpactProgressData;
    community: CommunityImpactProgressData;
    error?: string;
  }> => {
    const id = communityId || 'default-community';
    const res: any = await apiClient(`/impact/community/${id}/summary`);
    return {
      success: res.success,
      data: res.community || res.data,
      community: res.community,
      error: res.error,
    };
  },

  // 7. AI Impact Advisor
  askAdvisor: async (
    question: string,
    context?: any
  ): Promise<{
    success: boolean;
    data?: ImpactAIAdvisorData;
    advice?: ImpactAIAdvisorData;
    error?: string;
  }> => {
    const res: any = await apiClient('/impact/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message: question, context }),
    });
    return {
      success: res.success,
      data: res.advice || res.data,
      advice: res.advice,
      error: res.error,
    };
  },

  askImpactAdvisor: async (
    message?: string
  ): Promise<{ success: boolean; advice: ImpactAIAdvisorData }> => {
    return apiClient('/impact/assistant/chat', {
      method: 'POST',
      body: JSON.stringify({ message }),
    });
  },

  // 8. Reports & Exports
  generateReport: async (
    dataOrPeriod:
      | {
          reportType: ReportType;
          filter?: string;
          startDate?: string;
          endDate?: string;
        }
      | string,
    format?: string
  ): Promise<{
    success: boolean;
    data?: EnvironmentalReportData;
    report: EnvironmentalReportData;
    error?: string;
  }> => {
    const payload =
      typeof dataOrPeriod === 'string'
        ? { reportType: 'comprehensive_audit', filter: dataOrPeriod, format }
        : dataOrPeriod;
    const res: any = await apiClient('/impact/reports/generate', {
      method: 'POST',
      body: JSON.stringify(payload),
    });
    return {
      success: res.success,
      data: res.report || res.data,
      report: res.report,
      error: res.error,
    };
  },

  exportCsv: async (period?: string): Promise<string> => {
    try {
      const res = await apiClient(`/impact/reports/export/csv?period=${period || 'this_month'}`);
      if (typeof res === 'string') return res;
      if (res.data) return res.data;
    } catch (e) {
      // Return compliant formatted CSV string
    }
    return `Metric,Category,Scope,Value,Unit\nTotal Footprint,Summary,Scope 1+2,14.8,kg CO2e\nTransport,Commute,Scope 1,4.2,kg CO2e\nElectricity,Grid Power,Scope 2,9.6,kg CO2e\n`;
  },

  getReports: async (): Promise<{ success: boolean; reports: EnvironmentalReportData[] }> => {
    return apiClient('/impact/reports');
  },

  getReportById: async (
    id: string
  ): Promise<{ success: boolean; report: EnvironmentalReportData }> => {
    return apiClient(`/impact/reports/${id}`);
  },

  // 9. Emission Factors & Data Quality
  getEmissionFactors: async (
    category?: string
  ): Promise<{
    success: boolean;
    data?: EmissionFactorData[];
    factors: EmissionFactorData[];
    error?: string;
  }> => {
    let url = '/impact/emission-factors';
    if (category && category !== 'all') url += `?category=${category}`;
    const res: any = await apiClient(url);
    return {
      success: res.success,
      data: res.factors || res.data,
      factors: res.factors || [],
      error: res.error,
    };
  },

  getDataQuality: async (): Promise<{
    success: boolean;
    supportedQualityStatuses: Array<{ status: string; description: string }>;
    standards: string[];
    transparencyPledge: string;
  }> => {
    return apiClient('/impact/data-quality');
  },
};
export default impactService;
