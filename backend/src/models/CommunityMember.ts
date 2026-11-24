import mongoose, { Document, Schema } from 'mongoose';

export type MemberRole = 'owner' | 'admin' | 'moderator' | 'member';
export type MemberStatus = 'active' | 'pending' | 'rejected';

export interface ICommunityMember extends Document {
  communityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  role: MemberRole;
  status: MemberStatus;
  joinedAt: Date;
  requestedAt?: Date;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityMemberSchema = new Schema<ICommunityMember>(
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
    role: {
      type: String,
      enum: ['owner', 'admin', 'moderator', 'member'],
      default: 'member',
    },
    status: {
      type: String,
      enum: ['active', 'pending', 'rejected'],
      default: 'active',
    },
    joinedAt: {
      type: Date,
      default: Date.now,
    },
    requestedAt: {
      type: Date,
    },
    notes: {
      type: String,
      default: '',
    },
  },
  { timestamps: true }
);

CommunityMemberSchema.index({ communityId: 1, userId: 1 }, { unique: true });
CommunityMemberSchema.index({ communityId: 1, role: 1 });
CommunityMemberSchema.index({ userId: 1, status: 1 });

export default mongoose.model<ICommunityMember>('CommunityMember', CommunityMemberSchema);
