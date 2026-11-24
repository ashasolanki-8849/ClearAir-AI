import mongoose, { Document, Schema } from 'mongoose';

export type NotificationType =
  | 'severe_aqi_warning'
  | 'sudden_aqi_spike'
  | 'local_incident'
  | 'announcement'
  | 'event_reminder';

export type NotificationSeverity = 'info' | 'warning' | 'critical';

export interface ICommunityNotification extends Document {
  communityId: mongoose.Types.ObjectId;
  targetUserId?: mongoose.Types.ObjectId;
  type: NotificationType;
  title: string;
  message: string;
  severity: NotificationSeverity;
  readBy: mongoose.Types.ObjectId[];
  metadata?: Record<string, any>;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityNotificationSchema = new Schema<ICommunityNotification>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    targetUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
    },
    type: {
      type: String,
      enum: [
        'severe_aqi_warning',
        'sudden_aqi_spike',
        'local_incident',
        'announcement',
        'event_reminder',
      ],
      required: true,
    },
    title: { type: String, required: true },
    message: { type: String, required: true },
    severity: {
      type: String,
      enum: ['info', 'warning', 'critical'],
      default: 'info',
    },
    readBy: [{ type: Schema.Types.ObjectId, ref: 'User' }],
    metadata: { type: Schema.Types.Mixed },
  },
  { timestamps: true }
);

CommunityNotificationSchema.index({ communityId: 1, createdAt: -1 });

export default mongoose.model<ICommunityNotification>(
  'CommunityNotification',
  CommunityNotificationSchema
);
