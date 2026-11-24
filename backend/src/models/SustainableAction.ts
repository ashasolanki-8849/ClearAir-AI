import mongoose, { Document, Schema } from 'mongoose';
import { SustainabilityCategory, BudgetPreference } from './UserSustainabilityProfile.js';

export type ActionStatus = 'pending' | 'in_progress' | 'completed' | 'skipped';

export interface ISustainableAction extends Document {
  userId: mongoose.Types.ObjectId;
  recommendationId?: mongoose.Types.ObjectId;
  title: string;
  category: SustainabilityCategory;
  costCategory: BudgetPreference;
  status: ActionStatus;
  completedAt?: Date;
  notes?: string;
  impactEstimate?: {
    co2AvoidedKg?: number;
    wasteAvoidedKg?: number;
    waterSavedLiters?: number;
    moneySavedInr?: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const SustainableActionSchema = new Schema<ISustainableAction>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    recommendationId: {
      type: Schema.Types.ObjectId,
      ref: 'SustainableRecommendation',
    },
    title: { type: String, required: true },
    category: {
      type: String,
      enum: ['transportation', 'energy', 'cooking', 'waste', 'shopping', 'water', 'environment'],
      required: true,
      index: true,
    },
    costCategory: {
      type: String,
      enum: ['free', 'low_cost', 'medium_budget', 'high_investment', 'all'],
      default: 'free',
    },
    status: {
      type: String,
      enum: ['pending', 'in_progress', 'completed', 'skipped'],
      default: 'pending',
      index: true,
    },
    completedAt: { type: Date },
    notes: { type: String },
    impactEstimate: {
      co2AvoidedKg: { type: Number, default: 0 },
      wasteAvoidedKg: { type: Number, default: 0 },
      waterSavedLiters: { type: Number, default: 0 },
      moneySavedInr: { type: Number, default: 0 },
    },
  },
  { timestamps: true }
);

export const SustainableAction = mongoose.model<ISustainableAction>(
  'SustainableAction',
  SustainableActionSchema
);
