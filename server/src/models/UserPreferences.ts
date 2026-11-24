import mongoose, { Document, Schema } from 'mongoose';

export interface IUserPreferences extends Document {
  userId: mongoose.Types.ObjectId;
  theme: 'light' | 'dark' | 'system';
  standard: 'CPCB' | 'US_EPA' | 'WHO';
  notifications: {
    enabled: boolean;
    thresholdAqi: number;
    pm25SpikeAlert: boolean;
    improvementAlert: boolean;
    severeSmogWarning: boolean;
  };
  preferredLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserPreferencesSchema = new Schema<IUserPreferences>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    theme: {
      type: String,
      enum: ['light', 'dark', 'system'],
      default: 'dark',
    },
    standard: {
      type: String,
      enum: ['CPCB', 'US_EPA', 'WHO'],
      default: 'CPCB',
    },
    notifications: {
      enabled: { type: Boolean, default: true },
      thresholdAqi: { type: Number, default: 200 },
      pm25SpikeAlert: { type: Boolean, default: true },
      improvementAlert: { type: Boolean, default: true },
      severeSmogWarning: { type: Boolean, default: true },
    },
    preferredLocation: {
      name: { type: String, default: 'New Delhi' },
      lat: { type: Number, default: 28.6139 },
      lon: { type: Number, default: 77.2090 },
    },
  },
  {
    timestamps: true,
  }
);

export const UserPreferences = mongoose.model<IUserPreferences>('UserPreferences', UserPreferencesSchema);
