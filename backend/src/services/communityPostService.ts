import mongoose from 'mongoose';
import {
  CommunityPost,
  CommunityComment,
  ICommunityPost,
  PostCategory,
} from '../models/CommunityPost.js';
import CommunityAuditLog from '../models/CommunityAuditLog.js';

export const createCommunityPost = async (
  communityId: string,
  userId: string,
  authorName: string,
  authorRole: string,
  input: {
    category: PostCategory;
    title: string;
    content: string;
  }
): Promise<ICommunityPost> => {
  const post = new CommunityPost({
    communityId: new mongoose.Types.ObjectId(communityId),
    userId: new mongoose.Types.ObjectId(userId),
    authorName,
    authorRole: authorRole || 'member',
    category: input.category || 'general',
    title: input.title,
    content: input.content,
    pinned: false,
    likesCount: 0,
    likedBy: [],
    commentsCount: 0,
    isFlagged: false,
  });

  return post.save();
};

export const getCommunityPosts = async (params: {
  communityId: string;
  category?: string;
  page?: number;
  limit?: number;
  userId?: string;
}) => {
  const query: any = {
    communityId: new mongoose.Types.ObjectId(params.communityId),
    isFlagged: false,
  };

  if (params.category && params.category !== 'all') {
    query.category = params.category;
  }

  const page = Math.max(1, params.page || 1);
  const limit = Math.min(50, Math.max(1, params.limit || 20));
  const skip = (page - 1) * limit;

  const [posts, total] = await Promise.all([
    CommunityPost.find(query)
      .sort({ pinned: -1, createdAt: -1 })
      .skip(skip)
      .limit(limit)
      .lean(),
    CommunityPost.countDocuments(query),
  ]);

  const enriched = posts.map((p) => {
    const isLiked = params.userId
      ? p.likedBy?.some((id: any) => id.toString() === params.userId)
      : false;
    return {
      ...p,
      isLiked,
    };
  });

  return {
    posts: enriched,
    total,
    page,
    totalPages: Math.ceil(total / limit),
  };
};

export const addPostComment = async (
  postId: string,
  userId: string,
  authorName: string,
  authorRole: string,
  content: string
) => {
  const post = await CommunityPost.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const comment = await CommunityComment.create({
    postId: post._id,
    communityId: post.communityId,
    userId: new mongoose.Types.ObjectId(userId),
    authorName,
    authorRole: authorRole || 'member',
    content,
    isFlagged: false,
  });

  post.commentsCount += 1;
  await post.save();

  return comment;
};

export const getPostComments = async (postId: string) => {
  return CommunityComment.find({
    postId: new mongoose.Types.ObjectId(postId),
    isFlagged: false,
  })
    .sort({ createdAt: 1 })
    .lean();
};

export const toggleLikePost = async (postId: string, userId: string) => {
  const post = await CommunityPost.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  const uId = new mongoose.Types.ObjectId(userId);
  const alreadyLiked = post.likedBy.some((id) => id.equals(uId));

  if (alreadyLiked) {
    post.likedBy = post.likedBy.filter((id) => !id.equals(uId));
    post.likesCount = Math.max(0, post.likesCount - 1);
  } else {
    post.likedBy.push(uId);
    post.likesCount += 1;
  }

  await post.save();

  return {
    likesCount: post.likesCount,
    isLiked: !alreadyLiked,
  };
};

export const flagPost = async (postId: string, userId: string, reason: string) => {
  const post = await CommunityPost.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  post.isFlagged = true;
  post.flagReason = reason || 'Reported by community member';
  await post.save();

  return { success: true, message: 'Post flagged for moderator review' };
};

export const moderatePost = async (
  postId: string,
  action: 'pin' | 'unpin' | 'delete' | 'unflag',
  actorId: string,
  actorName: string
) => {
  const post = await CommunityPost.findById(postId);
  if (!post) {
    throw new Error('Post not found');
  }

  if (action === 'pin') {
    post.pinned = true;
    await post.save();
  } else if (action === 'unpin') {
    post.pinned = false;
    await post.save();
  } else if (action === 'unflag') {
    post.isFlagged = false;
    post.flagReason = '';
    await post.save();
  } else if (action === 'delete') {
    await CommunityPost.deleteOne({ _id: post._id });
    await CommunityComment.deleteMany({ postId: post._id });
  }

  await CommunityAuditLog.create({
    communityId: post.communityId,
    actorId: new mongoose.Types.ObjectId(actorId),
    actorName,
    action: `post_${action}`,
    targetType: 'community_post',
    targetId: post._id.toString(),
    details: { action },
  });

  return { success: true, action };
};
