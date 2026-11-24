import mongoose, { Document, Schema } from 'mongoose';
import { SustainabilityCategory, BudgetPreference } from './UserSustainabilityProfile.js';

export type PriorityLevel = 'high' | 'recommended' | 'optional';
export type ImplementationDifficulty = 'easy' | 'moderate' | 'advanced';

export interface ISustainableRecommendation extends Document {
  userId?: mongoose.Types.ObjectId;
  category: SustainabilityCategory;
  currentHabit: string;
  recommendedAlternative: string;
  reason: string;
  priority: PriorityLevel;
  costCategory: BudgetPreference;
  implementationDifficulty: ImplementationDifficulty;
  personalBenefit: string;
  environmentalBenefit: string;
  implementationSteps: string[];
  maintenanceRequirements: string;
  limitations: string[];
  estimatedSavings?: {
    amount?: number;
    unit?: string;
    period?: string;
    description?: string;
  };
  dataSource: {
    name: string;
    url?: string;
    lastUpdated?: string;
    assumptions?: string;
  };
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SustainableRecommendationSchema = new Schema<ISustainableRecommendation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      index: true,
      required: false,
    },
    category: {
      type: String,
      enum: ['transportation', 'energy', 'cooking', 'waste', 'shopping', 'water', 'environment'],
      required: true,
      index: true,
    },
    currentHabit: { type: String, required: true },
    recommendedAlternative: { type: String, required: true },
    reason: { type: String, required: true },
    priority: {
      type: String,
      enum: ['high', 'recommended', 'optional'],
      default: 'recommended',
      index: true,
    },
    costCategory: {
      type: String,
      enum: ['free', 'low_cost', 'medium_budget', 'high_investment', 'all'],
      required: true,
      index: true,
    },
    implementationDifficulty: {
      type: String,
      enum: ['easy', 'moderate', 'advanced'],
      default: 'easy',
    },
    personalBenefit: { type: String, required: true },
    environmentalBenefit: { type: String, required: true },
    implementationSteps: { type: [String], default: [] },
    maintenanceRequirements: { type: String, default: 'Minimal routine maintenance' },
    limitations: { type: [String], default: [] },
    estimatedSavings: {
      amount: { type: Number },
      unit: { type: String },
      period: { type: String },
      description: { type: String },
    },
    dataSource: {
      name: { type: String, default: 'Bureau of Energy Efficiency (BEE) / CPCB' },
      url: { type: String },
      lastUpdated: { type: String },
      assumptions: { type: String },
    },
    isActive: { type: Boolean, default: true },
  },
  { timestamps: true }
);

export const SustainableRecommendation = mongoose.model<ISustainableRecommendation>(
  'SustainableRecommendation',
  SustainableRecommendationSchema
);
