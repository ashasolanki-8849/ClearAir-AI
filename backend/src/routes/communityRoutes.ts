import { Router } from 'express';
import {
  authenticateToken as requireAuth,
  optionalAuthenticateToken as optionalAuth,
} from '../middleware/authMiddleware.js';
import * as controller from '../controllers/communityController.js';

export const communityRouter = Router();
export const pollutionReportRouter = Router();

// ================= /api/communities =================

// Area Feed for Simple Community Hub
communityRouter.get('/feed/posts', optionalAuth, controller.getAreaFeedPosts);
communityRouter.post('/feed/posts', requireAuth, controller.createAreaPost);

// Browse & Search Communities
communityRouter.get('/', optionalAuth, controller.getCommunities);
communityRouter.post('/', requireAuth, controller.createCommunity);
communityRouter.post('/join-by-code', requireAuth, controller.joinByInviteCode);
communityRouter.get('/my', requireAuth, controller.getUserCommunities);

// Single Community
communityRouter.get('/:id', optionalAuth, controller.getCommunityDetails);
communityRouter.post('/:id/join', requireAuth, controller.joinCommunity);
communityRouter.post('/:id/leave', requireAuth, controller.leaveCommunity);

// Community AQI & Impact Analytics
communityRouter.get('/:id/aqi', optionalAuth, controller.getCommunityAQI);
communityRouter.get('/:id/impact', optionalAuth, controller.getCommunityImpact);
communityRouter.get('/:id/leaderboard', optionalAuth, controller.getCommunityLeaderboard);
communityRouter.get('/:id/institution-view', optionalAuth, controller.getInstitutionViewData);

// AI Community Advisor
communityRouter.post('/:id/advisor', optionalAuth, controller.getCommunityAIAdvice);

// Events & Campaigns
communityRouter.get('/:id/events', optionalAuth, controller.getCommunityEvents);
communityRouter.post('/:id/events', requireAuth, controller.createCommunityEvent);
communityRouter.post('/:id/events/:eventId/register', requireAuth, controller.registerForEvent);
communityRouter.post('/:id/events/:eventId/cancel', requireAuth, controller.cancelEventRegistration);
communityRouter.post('/:id/events/:eventId/impact', requireAuth, controller.recordEventImpact);

communityRouter.get('/:id/campaigns', optionalAuth, controller.getCommunityCampaigns);
communityRouter.post('/:id/campaigns', requireAuth, controller.createCommunityCampaign);
communityRouter.post('/:id/campaigns/:campaignId/progress', requireAuth, controller.recordCampaignProgress);

// Discussion Forum
communityRouter.get('/:id/posts', optionalAuth, controller.getCommunityPosts);
communityRouter.post('/:id/posts', requireAuth, controller.createCommunityPost);
communityRouter.get('/:id/posts/:postId/comments', optionalAuth, controller.getPostComments);
communityRouter.post('/:id/posts/:postId/comments', requireAuth, controller.addPostComment);
communityRouter.post('/:id/posts/:postId/like', requireAuth, controller.toggleLikePost);
communityRouter.post('/:id/posts/:postId/flag', requireAuth, controller.flagPost);
communityRouter.post('/:id/posts/:postId/moderate', requireAuth, controller.moderatePost);

// Direct Event / Campaign / Post Action Aliases
communityRouter.post('/events/:eventId/register', requireAuth, controller.registerForEvent);
communityRouter.post('/events/:eventId/cancel', requireAuth, controller.cancelEventRegistration);
communityRouter.post('/events/:eventId/impact', requireAuth, controller.recordEventImpact);
communityRouter.post('/campaigns/:campaignId/progress', requireAuth, controller.recordCampaignProgress);
communityRouter.get('/posts/:postId/comments', optionalAuth, controller.getPostComments);
communityRouter.post('/posts/:postId/comments', requireAuth, controller.addPostComment);
communityRouter.post('/posts/:postId/like', requireAuth, controller.toggleLikePost);
communityRouter.post('/posts/:postId/flag', requireAuth, controller.flagPost);
communityRouter.post('/posts/:postId/moderate', requireAuth, controller.moderatePost);

// Community Admin, Roles & Notifications
communityRouter.get('/:id/notifications', optionalAuth, controller.getCommunityNotifications);
communityRouter.post('/:id/announcements', requireAuth, controller.createCommunityAnnouncement);
communityRouter.get('/:id/audit-logs', requireAuth, controller.getCommunityAuditLogs);
communityRouter.post('/:id/members/:targetUserId/role', requireAuth, controller.updateMemberRole);
communityRouter.post('/:id/members/:targetUserId/request', requireAuth, controller.respondToJoinRequest);

// Reports under a community
communityRouter.get('/:id/reports', optionalAuth, controller.getPollutionReports);

// ================= /api/community-reports =================
pollutionReportRouter.get('/', optionalAuth, controller.getPollutionReports);
pollutionReportRouter.post('/', requireAuth, controller.createPollutionReport);
pollutionReportRouter.get('/hotspots', optionalAuth, controller.getHotspots);
pollutionReportRouter.patch('/:id/status', requireAuth, controller.updateReportStatus);
pollutionReportRouter.post('/:id/upvote', requireAuth, controller.toggleReportUpvote);

export default communityRouter;
