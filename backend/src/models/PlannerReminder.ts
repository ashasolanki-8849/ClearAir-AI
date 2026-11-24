import mongoose, { Document, Schema } from 'mongoose';

export type ReminderType =
  | 'morning_aqi'
  | 'pre_exercise'
  | 'severe_alert_check'
  | 'evening_update'
  | 'custom';

export interface IPlannerReminder extends Document {
  userId: mongoose.Types.ObjectId;
  reminderType: ReminderType;
  title: string;
  time: string; // e.g. "07:00"
  enabled: boolean;
  days: string[]; // e.g. ["Mon", "Tue", "Wed", "Thu", "Fri", "Sat", "Sun"]
  createdAt: Date;
  updatedAt: Date;
}

const PlannerReminderSchema = new Schema<IPlannerReminder>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    reminderType: {
      type: String,
      enum: ['morning_aqi', 'pre_exercise', 'severe_alert_check', 'evening_update', 'custom'],
      required: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    time: {
      type: String,
      required: true,
      default: '07:00',
    },
    enabled: {
      type: Boolean,
      default: true,
    },
    days: {
      type: [String],
      default: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
    },
  },
  {
    timestamps: true,
  }
);

PlannerReminderSchema.index({ userId: 1, enabled: 1 });

export const PlannerReminder = mongoose.model<IPlannerReminder>(
  'PlannerReminder',
  PlannerReminderSchema
);
