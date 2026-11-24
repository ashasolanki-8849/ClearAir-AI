import mongoose, { Document, Schema } from 'mongoose';

export type FootprintCategory =
  | 'transportation'
  | 'electricity'
  | 'household_fuel'
  | 'waste'
  | 'water'
  | 'other';

export type DataQualityStatus =
  | 'User Entered'
  | 'Measured'
  | 'Imported'
  | 'Estimated'
  | 'Calculated'
  | 'Verified';

export interface ICarbonFootprintRecord extends Document {
  userId: mongoose.Types.ObjectId;
  householdId?: mongoose.Types.ObjectId;
  category: FootprintCategory;
  activityName: string;
  inputValues: {
    quantity: number;
    unit: string;
    passengers?: number;
    fuelType?: string;
    transportMode?: string;
    distanceKm?: number;
    kwh?: number;
    billingPeriod?: string;
    gridRegion?: string;
    wasteType?: string;
    disposalMethod?: string;
    waterLiters?: number;
    notes?: string;
  };
  calculatedEmissionsKgCO2e: number;
  criteriaPollutantsGrams?: {
    pm25?: number;
    pm10?: number;
    nox?: number;
    so2?: number;
    co?: number;
  };
  emissionFactor: {
    name: string;
    factor: number;
    unit: string;
    source: string;
    methodology: string;
  };
  dataQuality: {
    status: DataQualityStatus;
    completenessPercentage: number;
    assumptions: string[];
    limitations: string[];
  };
  date: Date;
  period: 'single' | 'daily' | 'weekly' | 'monthly' | 'yearly';
  createdAt: Date;
  updatedAt: Date;
}

const CarbonFootprintRecordSchema = new Schema<ICarbonFootprintRecord>(
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
    category: {
      type: String,
      enum: ['transportation', 'electricity', 'household_fuel', 'waste', 'water', 'other'],
      required: true,
      index: true,
    },
    activityName: { type: String, required: true, trim: true },
    inputValues: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
      passengers: { type: Number },
      fuelType: { type: String },
      transportMode: { type: String },
      distanceKm: { type: Number },
      kwh: { type: Number },
      billingPeriod: { type: String },
      gridRegion: { type: String },
      wasteType: { type: String },
      disposalMethod: { type: String },
      waterLiters: { type: Number },
      notes: { type: String },
    },
    calculatedEmissionsKgCO2e: { type: Number, required: true },
    criteriaPollutantsGrams: {
      pm25: { type: Number, default: 0 },
      pm10: { type: Number, default: 0 },
      nox: { type: Number, default: 0 },
      so2: { type: Number, default: 0 },
      co: { type: Number, default: 0 },
    },
    emissionFactor: {
      name: { type: String, required: true },
      factor: { type: Number, required: true },
      unit: { type: String, required: true },
      source: { type: String, required: true },
      methodology: { type: String, required: true },
    },
    dataQuality: {
      status: {
        type: String,
        enum: ['User Entered', 'Measured', 'Imported', 'Estimated', 'Calculated', 'Verified'],
        default: 'Calculated',
      },
      completenessPercentage: { type: Number, default: 100 },
      assumptions: [{ type: String }],
      limitations: [{ type: String }],
    },
    date: { type: Date, default: Date.now, index: true },
    period: {
      type: String,
      enum: ['single', 'daily', 'weekly', 'monthly', 'yearly'],
      default: 'single',
    },
  },
  { timestamps: true }
);

CarbonFootprintRecordSchema.index({ userId: 1, date: -1 });
CarbonFootprintRecordSchema.index({ userId: 1, category: 1, date: -1 });

export const CarbonFootprintRecord = mongoose.model<ICarbonFootprintRecord>(
  'CarbonFootprintRecord',
  CarbonFootprintRecordSchema
);
export default CarbonFootprintRecord;
