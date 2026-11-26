import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import * as communityService from '../services/communityService.js';
import * as communityAqiService from '../services/communityAqiService.js';
import * as pollutionReportService from '../services/pollutionReportService.js';
import * as communityActivityService from '../services/communityActivityService.js';
import * as communityPostService from '../services/communityPostService.js';
import * as communityAdvisorService from '../services/communityAdvisorService.js';
import * as communityAnalyticsService from '../services/communityAnalyticsService.js';
import CommunityNotification from '../models/CommunityNotification.js';
import CommunityAuditLog from '../models/CommunityAuditLog.js';
import CommunityMember from '../models/CommunityMember.js';
import CommunityPost from '../models/CommunityPost.js';
import mongoose from 'mongoose';

// ================= AREA FEED FOR GENERAL COMMUNITY =================

export const getAreaFeedPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { city, category } = req.query;
    const filter: any = { isFlagged: false };
    if (category && category !== 'all') {
      filter.category = category;
    }
    if (city && city !== 'all') {
      filter.$or = [
        { city: new RegExp(city as string, 'i') },
        { areaName: new RegExp(city as string, 'i') },
      ];
    }
    const posts = await CommunityPost.find(filter)
      .sort({ createdAt: -1 })
      .limit(50);
    res.status(200).json({ success: true, posts });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createAreaPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { title, content, category, city, areaName } = req.body;
    if (!title || !content) {
      res.status(400).json({ success: false, message: 'Title and content are required' });
      return;
    }
    const post = await CommunityPost.create({
      userId: req.user.id,
      authorName: req.user.fullName || 'Citizen',
      authorRole: (req.user as any).userCategory || 'member',
      title: title.trim(),
      content: content.trim(),
      category: category || 'general',
      city: city || (req.user as any).city || 'Local Area',
      areaName: areaName || 'Local Neighborhood',
    });
    res.status(201).json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= COMMUNITIES =================

export const getCommunities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { city, type, search, privacy, page, limit } = req.query;
    const userId = req.user?.id;

    const result = await communityService.getCommunities(
      {
        city: city as string,
        type: type as string,
        search: search as string,
        privacy: privacy as string,
        page: page ? parseInt(page as string, 10) : 1,
        limit: limit ? parseInt(limit as string, 10) : 12,
      },
      userId
    );

    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, type, description, location, privacy, objectives, bannerUrl, logoUrl, adminContact, settings } = req.body;

    if (!name || !type || !description || !location || !location.city || !location.locality || !location.coordinates) {
      res.status(400).json({
        success: false,
        message: 'Name, type, description, and location with city/locality/coordinates are required',
      });
      return;
    }

    const community = await communityService.createCommunity(
      req.user.id,
      req.user.fullName || 'Community Founder',
      {
        name,
        type,
        description,
        location,
        privacy,
        objectives,
        bannerUrl,
        logoUrl,
        adminContact,
        settings,
      }
    );

    res.status(201).json({ success: true, community });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getUserCommunities = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const communities = await communityService.getUserCommunities(req.user.id);
    res.status(200).json({ success: true, communities });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityDetails = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const data = await communityService.getCommunityDetails(id, userId);
    res.status(200).json({ success: true, ...data });
  } catch (err: any) {
    res.status(404).json({ success: false, message: err.message });
  }
};

export const joinCommunity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { invitationCode } = req.body;

    const result = await communityService.joinCommunity(id, req.user.id, invitationCode);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const joinByInviteCode = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { code } = req.body;
    if (!code) {
      res.status(400).json({ success: false, message: 'Invitation code is required' });
      return;
    }

    const result = await communityService.joinByInviteCode(code, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const leaveCommunity = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const result = await communityService.leaveCommunity(id, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

// ================= COMMUNITY AQI & IMPACT =================

export const getCommunityAQI = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await communityAqiService.getCommunityAQI(id);
    res.status(200).json({ success: true, aqi: data });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityImpact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const analytics = await communityAnalyticsService.getCommunityImpactAnalytics(id);
    res.status(200).json({ success: true, impact: analytics });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityLeaderboard = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const leaderboard = await communityAnalyticsService.getCommunityLeaderboard(id);
    res.status(200).json({ success: true, leaderboard });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getInstitutionViewData = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const data = await communityService.getCommunityDetails(id);
    const viewData = communityAnalyticsService.getInstitutionSpecificViewData(data.community.type);
    res.status(200).json({ success: true, viewData, communityType: data.community.type });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= AI ADVISOR =================

export const getCommunityAIAdvice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { query } = req.body;
    const advice = await communityAdvisorService.getCommunityAIAdvice(id, query);
    res.status(200).json({ success: true, advice });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= POLLUTION REPORTS =================

export const getPollutionReports = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { communityId, city, category, status, severity, page, limit } = req.query;
    const result = await pollutionReportService.getPollutionReports({
      communityId: communityId as string,
      city: city as string,
      category: category as string,
      status: status as string,
      severity: severity as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 15,
    });
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getHotspots = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { city, category, status } = req.query;
    const hotspots = await pollutionReportService.getHotspotMapPoints({
      city: city as string,
      category: category as string,
      status: status as string,
    });
    res.status(200).json({ success: true, hotspots });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createPollutionReport = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { communityId, category, title, description, location, imageUrl, severity, isAnonymous } = req.body;

    if (!category || !title || !description || !location || !location.name || !location.city || !location.coordinates) {
      res.status(400).json({
        success: false,
        message: 'Category, title, description, and location coordinates are required',
      });
      return;
    }

    const report = await pollutionReportService.createPollutionReport(
      req.user.id,
      req.user.fullName || 'Citizen Contributor',
      {
        communityId,
        category,
        title,
        description,
        location,
        imageUrl,
        severity,
        isAnonymous,
      }
    );

    res.status(201).json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateReportStatus = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { status, moderationNotes } = req.body;

    const report = await pollutionReportService.updateReportStatus(
      id,
      status,
      moderationNotes,
      req.user.id,
      req.user.fullName || 'Community Moderator'
    );

    res.status(200).json({ success: true, report });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleReportUpvote = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const result = await pollutionReportService.toggleReportUpvote(id, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= EVENTS & CAMPAIGNS =================

export const getCommunityEvents = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;
    const events = await communityActivityService.getCommunityEvents(id, userId);
    res.status(200).json({ success: true, events });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { title, category, description, location, startDate, endDate, maxParticipants } = req.body;

    const event = await communityActivityService.createCommunityEvent(
      id,
      req.user.id,
      req.user.fullName || 'Community Organizer',
      {
        title,
        category,
        description,
        location,
        startDate,
        endDate,
        maxParticipants,
      }
    );

    res.status(201).json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const registerForEvent = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { eventId } = req.params;
    const result = await communityActivityService.registerForEvent(
      eventId,
      req.user.id,
      req.user.fullName || 'Community Member',
      req.user.email
    );
    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const cancelEventRegistration = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { eventId } = req.params;
    const result = await communityActivityService.cancelEventRegistration(eventId, req.user.id);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordEventImpact = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { eventId } = req.params;
    const { wasteCollectedKg, treesPlanted, attendees, notes } = req.body;

    const event = await communityActivityService.recordEventImpact(
      eventId,
      { wasteCollectedKg, treesPlanted, attendees, notes },
      req.user.id,
      req.user.fullName || 'Community Organizer'
    );

    res.status(200).json({ success: true, event });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityCampaigns = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const campaigns = await communityActivityService.getCommunityCampaigns(id);
    res.status(200).json({ success: true, campaigns });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityCampaign = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { title, objective, category, startDate, endDate, targetMetric, targetValue } = req.body;

    const campaign = await communityActivityService.createCommunityCampaign(id, req.user.id, {
      title,
      objective,
      category,
      startDate,
      endDate,
      targetMetric,
      targetValue,
    });

    res.status(201).json({ success: true, campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const recordCampaignProgress = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { campaignId } = req.params;
    const { incrementValue, participantsIncrement } = req.body;

    const campaign = await communityActivityService.recordCampaignProgress(
      campaignId,
      incrementValue || 1,
      participantsIncrement || 1
    );

    res.status(200).json({ success: true, campaign });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= DISCUSSIONS =================

export const getCommunityPosts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const { category, page, limit } = req.query;
    const userId = req.user?.id;

    const result = await communityPostService.getCommunityPosts({
      communityId: id,
      category: category as string,
      page: page ? parseInt(page as string, 10) : 1,
      limit: limit ? parseInt(limit as string, 10) : 20,
      userId,
    });

    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { category, title, content } = req.body;

    // Fetch user role in community
    const membership = await CommunityMember.findOne({
      communityId: new mongoose.Types.ObjectId(id),
      userId: new mongoose.Types.ObjectId(req.user.id),
      status: 'active',
    });

    const role = membership ? membership.role : 'member';

    const post = await communityPostService.createCommunityPost(
      id,
      req.user.id,
      req.user.fullName || 'Community Member',
      role,
      { category, title, content }
    );

    res.status(201).json({ success: true, post });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getPostComments = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { postId } = req.params;
    const comments = await communityPostService.getPostComments(postId);
    res.status(200).json({ success: true, comments });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const addPostComment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { postId } = req.params;
    const { content } = req.body;

    const comment = await communityPostService.addPostComment(
      postId,
      req.user.id,
      req.user.fullName || 'Community Member',
      'member',
      content
    );

    res.status(201).json({ success: true, comment });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const toggleLikePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { postId } = req.params;
    const result = await communityPostService.toggleLikePost(postId, req.user.id);
    res.status(200).json({ success: true, ...result });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const flagPost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { postId } = req.params;
    const { reason } = req.body;
    const result = await communityPostService.flagPost(postId, req.user.id, reason);
    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const moderatePost = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { postId } = req.params;
    const { action } = req.body;

    const result = await communityPostService.moderatePost(
      postId,
      action,
      req.user.id,
      req.user.fullName || 'Moderator'
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// ================= ADMIN & NOTIFICATIONS =================

export const getCommunityNotifications = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const notifications = await CommunityNotification.find({
      communityId: new mongoose.Types.ObjectId(id),
    })
      .sort({ createdAt: -1 })
      .limit(30)
      .lean();

    res.status(200).json({ success: true, notifications });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const createCommunityAnnouncement = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id } = req.params;
    const { title, message, severity } = req.body;

    const notification = await CommunityNotification.create({
      communityId: new mongoose.Types.ObjectId(id),
      type: 'announcement',
      title,
      message,
      severity: severity || 'info',
      readBy: [new mongoose.Types.ObjectId(req.user.id)],
    });

    res.status(201).json({ success: true, notification });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCommunityAuditLogs = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const logs = await CommunityAuditLog.find({
      communityId: new mongoose.Types.ObjectId(id),
    })
      .sort({ createdAt: -1 })
      .limit(50)
      .lean();

    res.status(200).json({ success: true, logs });
  } catch (err: any) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const updateMemberRole = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id, targetUserId } = req.params;
    const { role } = req.body;

    const result = await communityService.updateMemberRole(
      id,
      targetUserId,
      role,
      req.user.id,
      req.user.fullName || 'Admin'
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};

export const respondToJoinRequest = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }
    const { id, targetUserId } = req.params;
    const { action } = req.body;

    const result = await communityService.respondToJoinRequest(
      id,
      targetUserId,
      action,
      req.user.id,
      req.user.fullName || 'Admin'
    );

    res.status(200).json(result);
  } catch (err: any) {
    res.status(400).json({ success: false, message: err.message });
  }
};
