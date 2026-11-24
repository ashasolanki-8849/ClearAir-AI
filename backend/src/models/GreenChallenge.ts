import mongoose, { Document, Schema } from 'mongoose';
import { SustainabilityCategory } from './UserSustainabilityProfile.js';

export interface IChallengeDayItem {
  dayNumber: number;
  title: string;
  description: string;
  category: SustainabilityCategory;
  practicalAction: string;
  estimatedTimeMinutes: number;
  expectedBenefit: string;
  isCompleted: boolean;
  completedAt?: Date;
}

export interface IGreenChallenge extends Document {
  title: string;
  description: string;
  durationDays: number;
  category: SustainabilityCategory | 'holistic';
  difficulty: 'beginner' | 'intermediate' | 'advanced';
  instructions: string[];
  days: IChallengeDayItem[];
  badgeName: string;
  badgeDescription: string;
  badgeIcon: string;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

export interface IChallengeProgress extends Document {
  userId: mongoose.Types.ObjectId;
  challengeId: mongoose.Types.ObjectId;
  challengeTitle: string;
  startedAt: Date;
  completedAt?: Date;
  status: 'active' | 'completed' | 'abandoned';
  daysProgress: IChallengeDayItem[];
  completedDaysCount: number;
  totalDays: number;
  badgeAwarded: boolean;
  userCustomNotes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const ChallengeDayItemSchema = new Schema<IChallengeDayItem>({
  dayNumber: { type: Number, required: true },
  title: { type: String, required: true },
  description: { type: String, required: true },
  category: {
    type: String,
    enum: ['transportation', 'energy', 'cooking', 'waste', 'shopping', 'water', 'environment'],
    required: true,
  },
  practicalAction: { type: String, required: true },
  estimatedTimeMinutes: { type: Number, default: 10 },
  expectedBenefit: { type: String, required: true },
  isCompleted: { type: Boolean, default: false },
  completedAt: { type: Date },
});

const GreenChallengeSchema = new Schema<IGreenChallenge>(
  {
    title: { type: String, required: true },
    description: { type: String, required: true },
    durationDays: { type: Number, default: 7 },
    category: {
      type: String,
      enum: ['transportation', 'energy', 'cooking', 'waste', 'shopping', 'water', 'environment', 'holistic'],
      default: 'holistic',
    },
    difficulty: {
      type: String,
      enum: ['beginner', 'intermediate', 'advanced'],
      default: 'beginner',
    },
    instructions: { type: [String], default: [] },
    days: { type: [ChallengeDayItemSchema], required: true },
    badgeName: { type: String, default: 'Green Habit Champion' },
    badgeDescription: { type: String, default: 'Completed 7-day sustainable living challenge' },
    badgeIcon: { type: String, default: 'Award' },
    isDefault: { type: Boolean, default: true },
  },
  { timestamps: true }
);

const ChallengeProgressSchema = new Schema<IChallengeProgress>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    challengeId: {
      type: Schema.Types.ObjectId,
      ref: 'GreenChallenge',
      required: true,
    },
    challengeTitle: { type: String, required: true },
    startedAt: { type: Date, default: Date.now },
    completedAt: { type: Date },
    status: {
      type: String,
      enum: ['active', 'completed', 'abandoned'],
      default: 'active',
      index: true,
    },
    daysProgress: { type: [ChallengeDayItemSchema], default: [] },
    completedDaysCount: { type: Number, default: 0 },
    totalDays: { type: Number, default: 7 },
    badgeAwarded: { type: Boolean, default: false },
    userCustomNotes: { type: String },
  },
  { timestamps: true }
);

export const GreenChallenge = mongoose.model<IGreenChallenge>('GreenChallenge', GreenChallengeSchema);
export const ChallengeProgress = mongoose.model<IChallengeProgress>(
  'ChallengeProgress',
  ChallengeProgressSchema
);
