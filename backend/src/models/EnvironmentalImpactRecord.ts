import mongoose, { Document, Schema } from 'mongoose';

export type ImpactActivityType =
  | 'transit_switch'
  | 'electricity_saving'
  | 'waste_segregation'
  | 'composting'
  | 'reusable_product'
  | 'water_conservation'
  | 'solar_generation'
  | 'trip_combining';

export interface IEnvironmentalImpactRecord extends Document {
  userId: mongoose.Types.ObjectId;
  activityType: ImpactActivityType;
  inputValues: {
    quantity: number;
    unit: string;
    description?: string;
  };
  calculatedValues: {
    co2EquivalentKg?: number;
    pm25AvoidedGrams?: number;
    noxAvoidedGrams?: number;
    wasteDivertedKg?: number;
    waterSavedLiters?: number;
  };
  calculationMethod: string;
  emissionFactor: {
    factor: number;
    unit: string;
    citation: string;
  };
  period: 'single_action' | 'daily' | 'weekly' | 'monthly';
  assumptions: string[];
  recordedAt: Date;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentalImpactRecordSchema = new Schema<IEnvironmentalImpactRecord>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    activityType: {
      type: String,
      enum: [
        'transit_switch',
        'electricity_saving',
        'waste_segregation',
        'composting',
        'reusable_product',
        'water_conservation',
        'solar_generation',
        'trip_combining',
      ],
      required: true,
      index: true,
    },
    inputValues: {
      quantity: { type: Number, required: true },
      unit: { type: String, required: true },
      description: { type: String },
    },
    calculatedValues: {
      co2EquivalentKg: { type: Number, default: 0 },
      pm25AvoidedGrams: { type: Number, default: 0 },
      noxAvoidedGrams: { type: Number, default: 0 },
      wasteDivertedKg: { type: Number, default: 0 },
      waterSavedLiters: { type: Number, default: 0 },
    },
    calculationMethod: { type: String, required: true },
    emissionFactor: {
      factor: { type: Number, required: true },
      unit: { type: String, required: true },
      citation: { type: String, required: true },
    },
    period: {
      type: String,
      enum: ['single_action', 'daily', 'weekly', 'monthly'],
      default: 'daily',
    },
    assumptions: { type: [String], default: [] },
    recordedAt: { type: Date, default: Date.now },
  },
  { timestamps: true }
);

export const EnvironmentalImpactRecord = mongoose.model<IEnvironmentalImpactRecord>(
  'EnvironmentalImpactRecord',
  EnvironmentalImpactRecordSchema
);
