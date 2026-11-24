import mongoose, { Document, Schema } from 'mongoose';

export interface ICommunityAuditLog extends Document {
  communityId: mongoose.Types.ObjectId;
  actorId: mongoose.Types.ObjectId;
  actorName: string;
  action: string;
  targetType: string;
  targetId?: string;
  details: Record<string, any>;
  createdAt: Date;
}

const CommunityAuditLogSchema = new Schema<ICommunityAuditLog>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    actorId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    actorName: { type: String, required: true },
    action: { type: String, required: true },
    targetType: { type: String, required: true },
    targetId: { type: String },
    details: { type: Schema.Types.Mixed, default: {} },
  },
  { timestamps: { createdAt: true, updatedAt: false } }
);

CommunityAuditLogSchema.index({ communityId: 1, createdAt: -1 });

export default mongoose.model<ICommunityAuditLog>('CommunityAuditLog', CommunityAuditLogSchema);
