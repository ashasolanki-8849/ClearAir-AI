import mongoose from 'mongoose';
import {
  CommunityEvent,
  EventRegistration,
  ICommunityEvent,
  EventCategory,
  EventStatus,
} from '../models/CommunityEvent.js';
import CommunityCampaign, {
  ICommunityCampaign,
  CampaignCategory,
} from '../models/CommunityCampaign.js';
import CommunityAuditLog from '../models/CommunityAuditLog.js';
import CommunityNotification from '../models/CommunityNotification.js';

export const createCommunityEvent = async (
  communityId: string,
  userId: string,
  userName: string,
  input: {
    title: string;
    category: EventCategory;
    description: string;
    location: {
      name: string;
      address?: string;
      coordinates?: { lat: number; lon: number };
    };
    startDate: Date | string;
    endDate: Date | string;
    maxParticipants?: number;
  }
): Promise<ICommunityEvent> => {
  const event = new CommunityEvent({
    communityId: new mongoose.Types.ObjectId(communityId),
    title: input.title,
    category: input.category,
    description: input.description,
    location: input.location,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    organizerId: new mongoose.Types.ObjectId(userId),
    organizerName: userName,
    maxParticipants: input.maxParticipants || 50,
    registeredCount: 0,
    status: 'upcoming',
  });

  const savedEvent = await event.save();

  await CommunityNotification.create({
    communityId: new mongoose.Types.ObjectId(communityId),
    type: 'announcement',
    title: `New Event: ${input.title}`,
    message: `Scheduled for ${new Date(input.startDate).toLocaleDateString()}. Category: ${input.category.replace('_', ' ').toUpperCase()}`,
    severity: 'info',
    metadata: { eventId: savedEvent._id },
    readBy: [],
  });

  return savedEvent;
};

export const getCommunityEvents = async (communityId: string, userId?: string) => {
  const events = await CommunityEvent.find({
    communityId: new mongoose.Types.ObjectId(communityId),
  })
    .sort({ startDate: 1 })
    .lean();

  let userRegistrations: Record<string, boolean> = {};
  if (userId) {
    const regs = await EventRegistration.find({
      userId: new mongoose.Types.ObjectId(userId),
      status: 'registered',
    }).lean();
    userRegistrations = regs.reduce((acc, r) => {
      acc[r.eventId.toString()] = true;
      return acc;
    }, {} as Record<string, boolean>);
  }

  return events.map((e) => ({
    ...e,
    isUserRegistered: !!userRegistrations[e._id.toString()],
  }));
};

export const registerForEvent = async (
  eventId: string,
  userId: string,
  userName: string,
  userEmail: string
) => {
  const event = await CommunityEvent.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  if (event.status === 'completed' || event.status === 'cancelled') {
    throw new Error('This event is no longer open for registration');
  }

  if (event.registeredCount >= event.maxParticipants) {
    throw new Error('Event has reached maximum participant capacity');
  }

  const existing = await EventRegistration.findOne({
    eventId: event._id,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (existing && existing.status === 'registered') {
    return { success: true, message: 'Already registered for this event', registered: true };
  }

  if (existing) {
    existing.status = 'registered';
    await existing.save();
  } else {
    await EventRegistration.create({
      eventId: event._id,
      communityId: event.communityId,
      userId: new mongoose.Types.ObjectId(userId),
      userName,
      userEmail,
      status: 'registered',
    });
  }

  event.registeredCount += 1;
  await event.save();

  return { success: true, message: 'Successfully registered for event!', registered: true };
};

export const cancelEventRegistration = async (eventId: string, userId: string) => {
  const reg = await EventRegistration.findOne({
    eventId: new mongoose.Types.ObjectId(eventId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!reg || reg.status !== 'registered') {
    return { success: true, message: 'Not actively registered' };
  }

  reg.status = 'cancelled';
  await reg.save();

  await CommunityEvent.findByIdAndUpdate(eventId, {
    $inc: { registeredCount: -1 },
  });

  return { success: true, message: 'Registration cancelled' };
};

export const recordEventImpact = async (
  eventId: string,
  impact: { wasteCollectedKg?: number; treesPlanted?: number; attendees?: number; notes?: string },
  actorId: string,
  actorName: string
) => {
  const event = await CommunityEvent.findById(eventId);
  if (!event) {
    throw new Error('Event not found');
  }

  event.impactSummary = {
    wasteCollectedKg: impact.wasteCollectedKg || 0,
    treesPlanted: impact.treesPlanted || 0,
    attendees: impact.attendees || event.registeredCount,
    notes: impact.notes || '',
  };
  event.status = 'completed';
  await event.save();

  await CommunityAuditLog.create({
    communityId: event.communityId,
    actorId: new mongoose.Types.ObjectId(actorId),
    actorName,
    action: 'record_event_impact',
    targetType: 'community_event',
    targetId: event._id.toString(),
    details: impact,
  });

  return event;
};

// ================= CAMPAIGNS =================

export const createCommunityCampaign = async (
  communityId: string,
  userId: string,
  input: {
    title: string;
    objective: string;
    category: CampaignCategory;
    startDate: Date | string;
    endDate: Date | string;
    targetMetric: string;
    targetValue: number;
  }
): Promise<ICommunityCampaign> => {
  const campaign = new CommunityCampaign({
    communityId: new mongoose.Types.ObjectId(communityId),
    title: input.title,
    objective: input.objective,
    category: input.category,
    startDate: new Date(input.startDate),
    endDate: new Date(input.endDate),
    targetMetric: input.targetMetric,
    targetValue: input.targetValue,
    currentValue: 0,
    participantsCount: 0,
    status: 'active',
    createdBy: new mongoose.Types.ObjectId(userId),
  });

  return campaign.save();
};

export const getCommunityCampaigns = async (communityId: string) => {
  const campaigns = await CommunityCampaign.find({
    communityId: new mongoose.Types.ObjectId(communityId),
  })
    .sort({ createdAt: -1 })
    .lean();

  return campaigns.map((c) => ({
    ...c,
    progressPercentage: Math.min(100, Math.round((c.currentValue / (c.targetValue || 1)) * 100)),
  }));
};

export const recordCampaignProgress = async (
  campaignId: string,
  incrementValue: number,
  participantsIncrement: number = 1
) => {
  const campaign = await CommunityCampaign.findById(campaignId);
  if (!campaign) {
    throw new Error('Campaign not found');
  }

  campaign.currentValue += incrementValue;
  campaign.participantsCount += participantsIncrement;

  if (campaign.currentValue >= campaign.targetValue) {
    campaign.status = 'completed';
  }

  await campaign.save();
  return campaign;
};
