import mongoose, { Document, Schema } from 'mongoose';

export type GoalCategory =
  | 'carbon'
  | 'electricity'
  | 'transportation'
  | 'waste'
  | 'water'
  | 'habits';

export type GoalStatus = 'active' | 'completed' | 'paused' | 'abandoned';

export interface IEnvironmentalGoal extends Document {
  userId: mongoose.Types.ObjectId;
  householdId?: mongoose.Types.ObjectId;
  title: string;
  category: GoalCategory;
  targetValue: number;
  currentValue: number;
  unit: string;
  startDate: Date;
  endDate: Date;
  status: GoalStatus;
  trackingFrequency: 'daily' | 'weekly' | 'monthly';
  remindersEnabled: boolean;
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentalGoalSchema = new Schema<IEnvironmentalGoal>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    householdId: {
      type: Schema.Types.ObjectId,
      ref: 'FamilyProfile',
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['carbon', 'electricity', 'transportation', 'waste', 'water', 'habits'],
      required: true,
    },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    unit: { type: String, required: true },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    status: {
      type: String,
      enum: ['active', 'completed', 'paused', 'abandoned'],
      default: 'active',
      index: true,
    },
    trackingFrequency: {
      type: String,
      enum: ['daily', 'weekly', 'monthly'],
      default: 'weekly',
    },
    remindersEnabled: { type: Boolean, default: true },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

EnvironmentalGoalSchema.index({ userId: 1, status: 1 });

export const EnvironmentalGoal = mongoose.model<IEnvironmentalGoal>(
  'EnvironmentalGoal',
  EnvironmentalGoalSchema
);
export default EnvironmentalGoal;
