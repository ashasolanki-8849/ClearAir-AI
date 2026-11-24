import mongoose from 'mongoose';
import Community, { ICommunity, CommunityType, CommunityPrivacy } from '../models/Community.js';
import CommunityMember, { ICommunityMember, MemberRole } from '../models/CommunityMember.js';
import CommunityAuditLog from '../models/CommunityAuditLog.js';
import { User } from '../models/User.js';

export interface CreateCommunityInput {
  name: string;
  type: CommunityType;
  description: string;
  location: {
    city: string;
    locality: string;
    coordinates: {
      lat: number;
      lon: number;
    };
    address?: string;
    pincode?: string;
  };
  privacy?: CommunityPrivacy;
  objectives?: string[];
  bannerUrl?: string;
  logoUrl?: string;
  adminContact?: {
    email?: string;
    phone?: string;
    organizationName?: string;
  };
  settings?: {
    allowMemberPosts?: boolean;
    requireReportVerification?: boolean;
    autoAlertSevereAqi?: boolean;
    aqiAlertThreshold?: number;
  };
}

const generateSlug = (name: string): string => {
  const base = name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/(^-|-$)+/g, '');
  const randomSuffix = Math.random().toString(36).substring(2, 6);
  return `${base}-${randomSuffix}`;
};

const generateInviteCode = (): string => {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';
  let code = 'CLR-';
  for (let i = 0; i < 5; i++) {
    code += chars.charAt(Math.floor(Math.random() * chars.length));
  }
  return code;
};

export const createCommunity = async (
  userId: string,
  userFullName: string,
  input: CreateCommunityInput
): Promise<ICommunity> => {
  const slug = generateSlug(input.name);
  let invitationCode = generateInviteCode();

  // Ensure unique invitation code
  while (await Community.findOne({ invitationCode })) {
    invitationCode = generateInviteCode();
  }

  const community = new Community({
    name: input.name,
    slug,
    type: input.type,
    description: input.description,
    location: input.location,
    privacy: input.privacy || 'public',
    invitationCode,
    ownerId: new mongoose.Types.ObjectId(userId),
    objectives: input.objectives || [
      'Monitor and understand hyper-local winter smog',
      'Report pollution violations & stop illegal garbage burning',
      'Coordinate community green actions and low-emission practices',
    ],
    bannerUrl: input.bannerUrl || '',
    logoUrl: input.logoUrl || '',
    adminContact: input.adminContact || {},
    membersCount: 1,
    settings: {
      allowMemberPosts: input.settings?.allowMemberPosts ?? true,
      requireReportVerification: input.settings?.requireReportVerification ?? true,
      autoAlertSevereAqi: input.settings?.autoAlertSevereAqi ?? true,
      aqiAlertThreshold: input.settings?.aqiAlertThreshold ?? 300,
    },
  });

  const savedCommunity = await community.save();

  // Automatically register owner as active member with 'owner' role
  await CommunityMember.create({
    communityId: savedCommunity._id,
    userId: new mongoose.Types.ObjectId(userId),
    role: 'owner',
    status: 'active',
    joinedAt: new Date(),
    notes: 'Community Founder',
  });

  // Log audit
  await CommunityAuditLog.create({
    communityId: savedCommunity._id,
    actorId: new mongoose.Types.ObjectId(userId),
    actorName: userFullName || 'Community Founder',
    action: 'community_created',
    targetType: 'community',
    targetId: savedCommunity._id.toString(),
    details: { name: savedCommunity.name, type: savedCommunity.type },
  });

  return savedCommunity;
};

export const getCommunities = async (
  params: {
    city?: string;
    type?: string;
    search?: string;
    privacy?: string;
    page?: number;
    limit?: number;
  },
  userId?: string
) => {
  const query: any = {};

  if (params.city) {
    query['location.city'] = new RegExp(params.city, 'i');
  }

  if (params.type && params.type !== 'all') {
    query.type = params.type;
  }

  if (params.privacy) {
    query.privacy = params.privacy;
  }

  if (params.search) {
    const s = new RegExp(params.search, 'i');
    query.$or = [{ name: s }, { description: s }, { 'location.locality': s }, { 'location.city': s }];
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 12));
  const skip = (page - 1) * limit;

  const [communities, total] = await Promise.all([
    Community.find(query).sort({ membersCount: -1, createdAt: -1 }).skip(skip).limit(limit).lean(),
    Community.countDocuments(query),
  ]);

  let memberships: Record<string, { role: MemberRole; status: string }> = {};

  if (userId) {
    const userMembers = await CommunityMember.find({
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();

    memberships = userMembers.reduce((acc, m) => {
      acc[m.communityId.toString()] = { role: m.role, status: m.status };
      return acc;
    }, {} as Record<string, { role: MemberRole; status: string }>);
  }

  const enriched = communities.map((comm) => {
    const mem = memberships[comm._id.toString()];
    return {
      ...comm,
      isMember: !!mem && mem.status === 'active',
      membershipStatus: mem ? mem.status : 'not_joined',
      userRole: mem ? mem.role : null,
    };
  });

  return {
    communities: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const getCommunityDetails = async (communityId: string, userId?: string) => {
  let query: any = {};
  if (mongoose.Types.ObjectId.isValid(communityId)) {
    query = { _id: new mongoose.Types.ObjectId(communityId) };
  } else {
    query = { slug: communityId };
  }

  const community = await Community.findOne(query).lean();
  if (!community) {
    throw new Error('Community not found');
  }

  let userMembership = null;
  if (userId) {
    userMembership = await CommunityMember.findOne({
      communityId: community._id,
      userId: new mongoose.Types.ObjectId(userId),
    }).lean();
  }

  const members = await CommunityMember.find({
    communityId: community._id,
    status: 'active',
  })
    .populate('userId', 'fullName email avatarUrl')
    .sort({ role: 1, joinedAt: -1 })
    .limit(30)
    .lean();

  return {
    community,
    userMembership: userMembership
      ? {
          role: userMembership.role,
          status: userMembership.status,
          joinedAt: userMembership.joinedAt,
        }
      : null,
    members: members.map((m: any) => ({
      memberId: m._id,
      userId: m.userId?._id || m.userId,
      name: m.userId?.fullName || 'Community Member',
      role: m.role,
      joinedAt: m.joinedAt,
    })),
  };
};

export const joinCommunity = async (
  communityId: string,
  userId: string,
  invitationCode?: string
) => {
  const community = await Community.findById(communityId);
  if (!community) {
    throw new Error('Community not found');
  }

  const existing = await CommunityMember.findOne({
    communityId: community._id,
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (existing) {
    if (existing.status === 'active') {
      return { success: true, message: 'Already an active member', status: 'active', role: existing.role };
    }
    if (existing.status === 'pending') {
      return { success: true, message: 'Your request is pending review by community admins', status: 'pending' };
    }
  }

  let targetStatus: 'active' | 'pending' = 'active';

  if (community.privacy === 'private') {
    // If user provided a valid invitation code, bypass pending
    if (invitationCode && invitationCode.trim().toUpperCase() === community.invitationCode) {
      targetStatus = 'active';
    } else {
      targetStatus = 'pending';
    }
  } else if (community.privacy === 'invite_only') {
    if (!invitationCode || invitationCode.trim().toUpperCase() !== community.invitationCode) {
      throw new Error('Valid invitation code required to join this invite-only community');
    }
    targetStatus = 'active';
  }

  const member = await CommunityMember.findOneAndUpdate(
    { communityId: community._id, userId: new mongoose.Types.ObjectId(userId) },
    {
      role: 'member',
      status: targetStatus,
      joinedAt: targetStatus === 'active' ? new Date() : undefined,
      requestedAt: targetStatus === 'pending' ? new Date() : undefined,
    },
    { upsert: true, new: true }
  );

  if (targetStatus === 'active') {
    await Community.findByIdAndUpdate(community._id, { $inc: { membersCount: 1 } });
  }

  return {
    success: true,
    status: targetStatus,
    message:
      targetStatus === 'active'
        ? 'Successfully joined community!'
        : 'Request submitted for administrator approval.',
    role: member.role,
  };
};

export const joinByInviteCode = async (inviteCode: string, userId: string) => {
  const code = inviteCode.trim().toUpperCase();
  const community = await Community.findOne({ invitationCode: code });
  if (!community) {
    throw new Error('Invalid invitation code. No matching community found.');
  }

  return joinCommunity(community._id.toString(), userId, code);
};

export const respondToJoinRequest = async (
  communityId: string,
  targetUserId: string,
  action: 'approve' | 'reject',
  actorId: string,
  actorName: string
) => {
  const membership = await CommunityMember.findOne({
    communityId: new mongoose.Types.ObjectId(communityId),
    userId: new mongoose.Types.ObjectId(targetUserId),
  });

  if (!membership) {
    throw new Error('Join request not found');
  }

  if (action === 'approve') {
    membership.status = 'active';
    membership.joinedAt = new Date();
    await membership.save();
    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: 1 } });
  } else {
    membership.status = 'rejected';
    await membership.save();
  }

  await CommunityAuditLog.create({
    communityId: new mongoose.Types.ObjectId(communityId),
    actorId: new mongoose.Types.ObjectId(actorId),
    actorName,
    action: action === 'approve' ? 'approve_member' : 'reject_member',
    targetType: 'member',
    targetId: targetUserId,
    details: { action },
  });

  return { success: true, status: membership.status };
};

export const updateMemberRole = async (
  communityId: string,
  targetUserId: string,
  newRole: MemberRole,
  actorId: string,
  actorName: string
) => {
  const membership = await CommunityMember.findOne({
    communityId: new mongoose.Types.ObjectId(communityId),
    userId: new mongoose.Types.ObjectId(targetUserId),
  });

  if (!membership) {
    throw new Error('Member not found');
  }

  const previousRole = membership.role;
  membership.role = newRole;
  await membership.save();

  await CommunityAuditLog.create({
    communityId: new mongoose.Types.ObjectId(communityId),
    actorId: new mongoose.Types.ObjectId(actorId),
    actorName,
    action: 'change_role',
    targetType: 'member',
    targetId: targetUserId,
    details: { previousRole, newRole },
  });

  return { success: true, role: newRole };
};

export const leaveCommunity = async (communityId: string, userId: string) => {
  const membership = await CommunityMember.findOne({
    communityId: new mongoose.Types.ObjectId(communityId),
    userId: new mongoose.Types.ObjectId(userId),
  });

  if (!membership) {
    throw new Error('You are not a member of this community');
  }

  if (membership.role === 'owner') {
    throw new Error('As the owner, you cannot leave the community without transferring ownership first.');
  }

  await CommunityMember.deleteOne({ _id: membership._id });
  if (membership.status === 'active') {
    await Community.findByIdAndUpdate(communityId, { $inc: { membersCount: -1 } });
  }

  return { success: true, message: 'You have left the community' };
};

export const getUserCommunities = async (userId: string) => {
  const memberships = await CommunityMember.find({
    userId: new mongoose.Types.ObjectId(userId),
    status: 'active',
  })
    .populate('communityId')
    .lean();

  return memberships
    .filter((m) => m.communityId)
    .map((m: any) => ({
      ...m.communityId,
      userRole: m.role,
      joinedAt: m.joinedAt,
    }));
};
