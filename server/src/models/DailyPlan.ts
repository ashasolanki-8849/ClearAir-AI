import mongoose, { Document, Schema } from 'mongoose';

export type PlanPeriod = 'early_morning' | 'morning' | 'afternoon' | 'evening' | 'night';
export type ActivityStatus = 'pending' | 'completed' | 'skipped';
export type IndoorOutdoorType = 'indoor' | 'outdoor' | 'transit';

export interface IPlannedActivity {
  id: string;
  period: PlanPeriod;
  periodLabel: string;
  activity: string;
  recommendedTime: string;
  indoorOutdoor: IndoorOutdoorType;
  pollutionRisk: 'low' | 'moderate' | 'high' | 'severe';
  reason: string;
  alternativeActivity: string;
  expectedBenefit: string;
  personalBenefit: string;
  environmentalBenefit: string;
  status: ActivityStatus;
  completedAt?: Date | null;
  isCustom?: boolean;
  isAlternativeApplied?: boolean;
}

export interface IDailyPlan extends Document {
  userId: mongoose.Types.ObjectId;
  date: string; // YYYY-MM-DD
  environmentalContext: {
    locationName: string;
    city: string;
    lat: number;
    lon: number;
    aqi: number;
    aqiCategory: string;
    pm25: number;
    pm10: number;
    temperature: number;
    timestamp: Date;
  };
  activities: IPlannedActivity[];
  completionPercentage: number;
  exposureScore: {
    outdoorMinutes: number;
    indoorMinutes: number;
    exposureAvoidanceActions: number;
  };
  lastCalculatedAqi: number;
  language: string;
  createdAt: Date;
  updatedAt: Date;
}

const PlannedActivitySchema = new Schema(
  {
    id: { type: String, required: true },
    period: {
      type: String,
      enum: ['early_morning', 'morning', 'afternoon', 'evening', 'night'],
      required: true,
    },
    periodLabel: { type: String, required: true },
    activity: { type: String, required: true },
    recommendedTime: { type: String, required: true },
    indoorOutdoor: {
      type: String,
      enum: ['indoor', 'outdoor', 'transit'],
      default: 'indoor',
    },
    pollutionRisk: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    reason: { type: String, default: '' },
    alternativeActivity: { type: String, default: '' },
    expectedBenefit: { type: String, default: '' },
    personalBenefit: { type: String, default: '' },
    environmentalBenefit: { type: String, default: '' },
    status: {
      type: String,
      enum: ['pending', 'completed', 'skipped'],
      default: 'pending',
    },
    completedAt: { type: Date, default: null },
    isCustom: { type: Boolean, default: false },
    isAlternativeApplied: { type: Boolean, default: false },
  },
  { _id: false }
);

const DailyPlanSchema = new Schema<IDailyPlan>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    date: {
      type: String,
      required: true,
      index: true,
    },
    environmentalContext: {
      locationName: { type: String, default: 'Selected Area' },
      city: { type: String, default: '' },
      lat: { type: Number, default: 28.6139 },
      lon: { type: Number, default: 77.2090 },
      aqi: { type: Number, default: 0 },
      aqiCategory: { type: String, default: 'Moderate' },
      pm25: { type: Number, default: 0 },
      pm10: { type: Number, default: 0 },
      temperature: { type: Number, default: 20 },
      timestamp: { type: Date, default: Date.now },
    },
    activities: [PlannedActivitySchema],
    completionPercentage: {
      type: Number,
      default: 0,
      min: 0,
      max: 100,
    },
    exposureScore: {
      outdoorMinutes: { type: Number, default: 0 },
      indoorMinutes: { type: Number, default: 0 },
      exposureAvoidanceActions: { type: Number, default: 0 },
    },
    lastCalculatedAqi: {
      type: Number,
      default: 0,
    },
    language: {
      type: String,
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

// Compound index for fast single-day lookup per user
DailyPlanSchema.index({ userId: 1, date: -1 });

export const DailyPlan = mongoose.model<IDailyPlan>('DailyPlan', DailyPlanSchema);
