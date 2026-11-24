import { apiClient } from './api';
import {
  CommunityData,
  CommunityType,
  CommunityPrivacy,
  PollutionReportData,
  HotspotMapPoint,
  CommunityEventData,
  CommunityCampaignData,
  CommunityPostData,
  CommunityCommentData,
  CommunityNotificationData,
  CommunityImpactData,
  CommunityLeaderboardEntryData,
  CommunityAIData,
  InstitutionSpecificViewData,
  PollutionCategory,
  ReportSeverity,
  ReportStatus,
  EventCategory,
  CampaignCategory,
  PostCategory,
  MemberRole,
} from '../types';

export const communityService = {
  // 1. Communities list & search
  getCommunities: async (params?: {
    city?: string;
    type?: string;
    search?: string;
    privacy?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    communities: CommunityData[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    let url = '/communities';
    const query = new URLSearchParams();
    if (params?.city) query.append('city', params.city);
    if (params?.type && params.type !== 'all') query.append('type', params.type);
    if (params?.search) query.append('search', params.search);
    if (params?.privacy) query.append('privacy', params.privacy);
    if (params?.page) query.append('page', params.page.toString());
    if (params?.limit) query.append('limit', params.limit.toString());
    if (query.toString()) url += `?${query.toString()}`;
    return apiClient(url);
  },

  // 2. Create Community
  createCommunity: async (data: {
    name: string;
    type: CommunityType;
    description: string;
    location: {
      city: string;
      locality: string;
      coordinates: { lat: number; lon: number };
      address?: string;
      pincode?: string;
    };
    privacy?: CommunityPrivacy;
    objectives?: string[];
    bannerUrl?: string;
    logoUrl?: string;
    adminContact?: { email?: string; phone?: string; organizationName?: string };
    settings?: {
      allowMemberPosts?: boolean;
      requireReportVerification?: boolean;
      autoAlertSevereAqi?: boolean;
      aqiAlertThreshold?: number;
    };
  }): Promise<{ success: boolean; community: CommunityData }> => {
    return apiClient('/communities', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  // 3. User Joined Communities
  getUserCommunities: async (): Promise<{ success: boolean; communities: CommunityData[] }> => {
    return apiClient('/communities/my');
  },

  // 4. Community Details
  getCommunityDetails: async (
    id: string
  ): Promise<{
    success: boolean;
    community: CommunityData;
    userMembership?: { role: MemberRole; status: string; joinedAt: string } | null;
    members: Array<{ memberId: string; userId: string; name: string; role: MemberRole; joinedAt: string }>;
  }> => {
    return apiClient(`/communities/${id}`);
  },

  // 5. Join / Leave Community
  joinCommunity: async (
    id: string,
    invitationCode?: string
  ): Promise<{ success: boolean; status: string; message: string; role?: MemberRole }> => {
    return apiClient(`/communities/${id}/join`, {
      method: 'POST',
      body: JSON.stringify({ invitationCode }),
    });
  },

  joinByInviteCode: async (
    code: string
  ): Promise<{ success: boolean; status: string; message: string; role?: MemberRole }> => {
    return apiClient('/communities/join-by-code', {
      method: 'POST',
      body: JSON.stringify({ code }),
    });
  },

  leaveCommunity: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/communities/${id}/leave`, {
      method: 'POST',
    });
  },

  // 6. Community AQI & Alerts
  getCommunityAQI: async (id: string): Promise<{
    success: boolean;
    aqi: {
      communityId: string;
      communityName: string;
      aqiData: any;
      severeConditionActive: boolean;
      alertThreshold: number;
      dataSourceLabel: string;
      lastUpdated: string;
    };
  }> => {
    return apiClient(`/communities/${id}/aqi`);
  },

  // 7. Community Impact & Analytics
  getCommunityImpact: async (id: string): Promise<{ success: boolean; impact: CommunityImpactData }> => {
    return apiClient(`/communities/${id}/impact`);
  },

  getCommunityLeaderboard: async (
    id: string
  ): Promise<{ success: boolean; leaderboard: CommunityLeaderboardEntryData[] }> => {
    return apiClient(`/communities/${id}/leaderboard`);
  },

  getInstitutionView: async (
    id: string
  ): Promise<{ success: boolean; viewData: InstitutionSpecificViewData; communityType: string }> => {
    return apiClient(`/communities/${id}/institution-view`);
  },

  // 8. AI Community Advisor
  getAIAdvice: async (
    id: string,
    query?: string
  ): Promise<{ success: boolean; advice: CommunityAIData }> => {
    return apiClient(`/communities/${id}/advisor`, {
      method: 'POST',
      body: JSON.stringify({ query }),
    });
  },

  // 9. Events & Campaigns
  getEvents: async (id: string): Promise<{ success: boolean; events: CommunityEventData[] }> => {
    return apiClient(`/communities/${id}/events`);
  },

  createEvent: async (
    id: string,
    data: {
      title: string;
      category: EventCategory;
      description: string;
      location: { name: string; address?: string; coordinates?: { lat: number; lon: number } };
      startDate: string;
      endDate: string;
      maxParticipants?: number;
    }
  ): Promise<{ success: boolean; event: CommunityEventData }> => {
    return apiClient(`/communities/${id}/events`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  registerForEvent: async (eventId: string): Promise<{ success: boolean; message: string; registered: boolean }> => {
    return apiClient(`/communities/events/${eventId}/register`, {
      method: 'POST',
    });
  },

  cancelEventRegistration: async (eventId: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/communities/events/${eventId}/cancel`, {
      method: 'POST',
    });
  },

  recordEventImpact: async (
    eventId: string,
    impact: { wasteCollectedKg?: number; treesPlanted?: number; attendees?: number; notes?: string }
  ): Promise<{ success: boolean; event: CommunityEventData }> => {
    return apiClient(`/communities/events/${eventId}/impact`, {
      method: 'POST',
      body: JSON.stringify(impact),
    });
  },

  getCampaigns: async (id: string): Promise<{ success: boolean; campaigns: CommunityCampaignData[] }> => {
    return apiClient(`/communities/${id}/campaigns`);
  },

  createCampaign: async (
    id: string,
    data: {
      title: string;
      objective: string;
      category: CampaignCategory;
      startDate: string;
      endDate: string;
      targetMetric: string;
      targetValue: number;
    }
  ): Promise<{ success: boolean; campaign: CommunityCampaignData }> => {
    return apiClient(`/communities/${id}/campaigns`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  recordCampaignProgress: async (
    campaignId: string,
    incrementValue: number,
    participantsIncrement?: number
  ): Promise<{ success: boolean; campaign: CommunityCampaignData }> => {
    return apiClient(`/communities/campaigns/${campaignId}/progress`, {
      method: 'POST',
      body: JSON.stringify({ incrementValue, participantsIncrement }),
    });
  },

  // 10. Discussion Forum
  getPosts: async (
    id: string,
    category?: string,
    page?: number
  ): Promise<{ success: boolean; posts: CommunityPostData[]; total: number; page: number; totalPages: number }> => {
    let url = `/communities/${id}/posts`;
    const q = new URLSearchParams();
    if (category && category !== 'all') q.append('category', category);
    if (page) q.append('page', page.toString());
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  createPost: async (
    id: string,
    data: { category: PostCategory; title: string; content: string }
  ): Promise<{ success: boolean; post: CommunityPostData }> => {
    return apiClient(`/communities/${id}/posts`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getPostComments: async (postId: string): Promise<{ success: boolean; comments: CommunityCommentData[] }> => {
    return apiClient(`/communities/posts/${postId}/comments`);
  },

  addPostComment: async (
    postId: string,
    content: string
  ): Promise<{ success: boolean; comment: CommunityCommentData }> => {
    return apiClient(`/communities/posts/${postId}/comments`, {
      method: 'POST',
      body: JSON.stringify({ content }),
    });
  },

  toggleLikePost: async (postId: string): Promise<{ success: boolean; likesCount: number; isLiked: boolean }> => {
    return apiClient(`/communities/posts/${postId}/like`, {
      method: 'POST',
    });
  },

  flagPost: async (postId: string, reason: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/communities/posts/${postId}/flag`, {
      method: 'POST',
      body: JSON.stringify({ reason }),
    });
  },

  moderatePost: async (
    postId: string,
    action: 'pin' | 'unpin' | 'delete' | 'unflag'
  ): Promise<{ success: boolean; action: string }> => {
    return apiClient(`/communities/posts/${postId}/moderate`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // 11. Admin, Notifications & Audit Logs
  getNotifications: async (id: string): Promise<{ success: boolean; notifications: CommunityNotificationData[] }> => {
    return apiClient(`/communities/${id}/notifications`);
  },

  createAnnouncement: async (
    id: string,
    data: { title: string; message: string; severity?: 'info' | 'warning' | 'critical' }
  ): Promise<{ success: boolean; notification: CommunityNotificationData }> => {
    return apiClient(`/communities/${id}/announcements`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getAuditLogs: async (id: string): Promise<{ success: boolean; logs: any[] }> => {
    return apiClient(`/communities/${id}/audit-logs`);
  },

  updateMemberRole: async (
    id: string,
    targetUserId: string,
    role: MemberRole
  ): Promise<{ success: boolean; role: MemberRole }> => {
    return apiClient(`/communities/${id}/members/${targetUserId}/role`, {
      method: 'POST',
      body: JSON.stringify({ role }),
    });
  },

  respondToJoinRequest: async (
    id: string,
    targetUserId: string,
    action: 'approve' | 'reject'
  ): Promise<{ success: boolean; status: string }> => {
    return apiClient(`/communities/${id}/members/${targetUserId}/request`, {
      method: 'POST',
      body: JSON.stringify({ action }),
    });
  },

  // 12. Pollution Reports & Hotspots
  getPollutionReports: async (params?: {
    communityId?: string;
    city?: string;
    category?: string;
    status?: string;
    severity?: string;
    page?: number;
    limit?: number;
  }): Promise<{
    success: boolean;
    reports: PollutionReportData[];
    total: number;
    page: number;
    totalPages: number;
  }> => {
    let url = '/community-reports';
    const q = new URLSearchParams();
    if (params?.communityId) q.append('communityId', params.communityId);
    if (params?.city) q.append('city', params.city);
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (params?.severity && params.severity !== 'all') q.append('severity', params.severity);
    if (params?.page) q.append('page', params.page.toString());
    if (params?.limit) q.append('limit', params.limit.toString());
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  createPollutionReport: async (data: {
    communityId?: string;
    category: PollutionCategory;
    title: string;
    description: string;
    location: {
      name: string;
      city: string;
      locality?: string;
      coordinates: { lat: number; lon: number };
    };
    imageUrl?: string;
    severity?: ReportSeverity;
    isAnonymous?: boolean;
  }): Promise<{ success: boolean; report: PollutionReportData }> => {
    return apiClient('/community-reports', {
      method: 'POST',
      body: JSON.stringify(data),
    });
  },

  getHotspots: async (params?: {
    city?: string;
    category?: string;
    status?: string;
  }): Promise<{ success: boolean; hotspots: HotspotMapPoint[] }> => {
    let url = '/community-reports/hotspots';
    const q = new URLSearchParams();
    if (params?.city) q.append('city', params.city);
    if (params?.category && params.category !== 'all') q.append('category', params.category);
    if (params?.status && params.status !== 'all') q.append('status', params.status);
    if (q.toString()) url += `?${q.toString()}`;
    return apiClient(url);
  },

  updateReportStatus: async (
    reportId: string,
    status: ReportStatus,
    moderationNotes?: string
  ): Promise<{ success: boolean; report: PollutionReportData }> => {
    return apiClient(`/community-reports/${reportId}/status`, {
      method: 'PATCH',
      body: JSON.stringify({ status, moderationNotes }),
    });
  },

  toggleReportUpvote: async (
    reportId: string
  ): Promise<{ success: boolean; upvotes: number; hasUpvoted: boolean }> => {
    return apiClient(`/community-reports/${reportId}/upvote`, {
      method: 'POST',
    });
  },
};
