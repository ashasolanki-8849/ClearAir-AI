import mongoose, { Document, Schema } from 'mongoose';

export type EmissionCategory =
  | 'electricity'
  | 'transportation'
  | 'household_fuel'
  | 'waste'
  | 'water';

export interface IEmissionFactor extends Document {
  name: string;
  category: EmissionCategory;
  value: number;
  unit: string;
  geography: string;
  source: string;
  sourceUrl?: string;
  publicationDate?: string;
  validFrom?: string;
  validUntil?: string;
  methodology: string;
  version: string;
  uncertaintyPercentage?: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const EmissionFactorSchema = new Schema<IEmissionFactor>(
  {
    name: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['electricity', 'transportation', 'household_fuel', 'waste', 'water'],
      required: true,
      index: true,
    },
    value: { type: Number, required: true },
    unit: { type: String, required: true, trim: true },
    geography: { type: String, default: 'India', trim: true },
    source: { type: String, required: true, trim: true },
    sourceUrl: { type: String, default: '' },
    publicationDate: { type: String, default: '' },
    validFrom: { type: String, default: '2023-01-01' },
    validUntil: { type: String, default: '2027-12-31' },
    methodology: { type: String, required: true },
    version: { type: String, default: '1.0' },
    uncertaintyPercentage: { type: Number, default: 5 },
    isDefault: { type: Boolean, default: true },
  },
  { timestamps: true }
);

EmissionFactorSchema.index({ category: 1, isDefault: 1 });
EmissionFactorSchema.index({ name: 1 });

export const EmissionFactor = mongoose.model<IEmissionFactor>('EmissionFactor', EmissionFactorSchema);
export default EmissionFactor;
