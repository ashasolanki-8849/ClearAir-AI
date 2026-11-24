import mongoose, { Document, Schema } from 'mongoose';

export type SustainabilityChangeType =
  | 'habit_upgrade'
  | 'impact_milestone'
  | 'challenge_completed'
  | 'budget_shift';

export interface ISustainabilityHistory extends Document {
  userId: mongoose.Types.ObjectId;
  activity: string;
  category: string;
  previousValue: string;
  currentValue: string;
  changeType: SustainabilityChangeType;
  impactSummary?: string;
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const SustainabilityHistorySchema = new Schema<ISustainabilityHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activity: { type: String, required: true },
    category: { type: String, required: true, index: true },
    previousValue: { type: String, required: true },
    currentValue: { type: String, required: true },
    changeType: {
      type: String,
      enum: ['habit_upgrade', 'impact_milestone', 'challenge_completed', 'budget_shift'],
      default: 'habit_upgrade',
      index: true,
    },
    impactSummary: { type: String },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const SustainabilityHistory = mongoose.model<ISustainabilityHistory>(
  'SustainabilityHistory',
  SustainabilityHistorySchema
);
