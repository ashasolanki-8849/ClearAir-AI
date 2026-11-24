import mongoose, { Document, Schema } from 'mongoose';

export type PostCategory =
  | 'air_quality'
  | 'pollution_concerns'
  | 'sustainable_living'
  | 'waste_management'
  | 'activities'
  | 'education'
  | 'general';

export interface ICommunityPost extends Document {
  communityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: string;
  category: PostCategory;
  title: string;
  content: string;
  pinned: boolean;
  likesCount: number;
  likedBy: mongoose.Types.ObjectId[];
  commentsCount: number;
  isFlagged: boolean;
  flagReason?: string;
  createdAt: Date;
  updatedAt: Date;
}

export interface ICommunityComment extends Document {
  postId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  authorName: string;
  authorRole: string;
  content: string;
  isFlagged: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityPostSchema = new Schema<ICommunityPost>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'member' },
    category: {
      type: String,
      enum: [
        'air_quality',
        'pollution_concerns',
        'sustainable_living',
        'waste_management',
        'activities',
        'education',
        'general',
      ],
      default: 'general',
    },
    title: { type: String, required: true, trim: true },
    content: { type: String, required: true },
    pinned: { type: Boolean, default: false },
    likesCount: { type: Number, default: 0 },
    likedBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    commentsCount: { type: Number, default: 0 },
    isFlagged: { type: Boolean, default: false },
    flagReason: { type: String, default: '' },
  },
  { timestamps: true }
);

CommunityPostSchema.index({ communityId: 1, pinned: -1, createdAt: -1 });
CommunityPostSchema.index({ category: 1 });

const CommunityCommentSchema = new Schema<ICommunityComment>(
  {
    postId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityPost',
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    authorName: { type: String, required: true },
    authorRole: { type: String, default: 'member' },
    content: { type: String, required: true },
    isFlagged: { type: Boolean, default: false },
  },
  { timestamps: true }
);

CommunityCommentSchema.index({ postId: 1, createdAt: 1 });

export const CommunityPost = mongoose.model<ICommunityPost>('CommunityPost', CommunityPostSchema);
export const CommunityComment = mongoose.model<ICommunityComment>(
  'CommunityComment',
  CommunityCommentSchema
);
export default CommunityPost;
