import mongoose, { Document, Schema } from 'mongoose';

export type AlertSeverity = 'low' | 'moderate' | 'high' | 'critical';
export type AlertType = 'unhealthy_aqi' | 'pm25_spike' | 'air_quality_improvement' | 'severe_smog_warning' | 'advisory';

export interface IAlert extends Document {
  userId?: mongoose.Types.ObjectId | null;
  alertType: AlertType;
  severity: AlertSeverity;
  title: string;
  message: string;
  locationName: string;
  aqiValue?: number;
  read: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const AlertSchema = new Schema<IAlert>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    alertType: {
      type: String,
      enum: ['unhealthy_aqi', 'pm25_spike', 'air_quality_improvement', 'severe_smog_warning', 'advisory'],
      required: true,
    },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'critical'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    message: {
      type: String,
      required: true,
      trim: true,
    },
    locationName: {
      type: String,
      default: 'Current Location',
    },
    aqiValue: {
      type: Number,
    },
    read: {
      type: Boolean,
      default: false,
    },
    timestamp: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true,
  }
);

AlertSchema.index({ userId: 1, read: 1, timestamp: -1 });

export const Alert = mongoose.model<IAlert>('Alert', AlertSchema);
