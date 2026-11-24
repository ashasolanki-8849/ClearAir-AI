import mongoose, { Document, Schema } from 'mongoose';
import { DataQualityStatus } from './CarbonFootprintRecord.js';

export type ActivityCategory =
  | 'transportation'
  | 'energy'
  | 'electricity'
  | 'household_fuel'
  | 'waste'
  | 'water'
  | 'community'
  | 'consumption';

export interface IEnvironmentalActivity extends Document {
  userId: mongoose.Types.ObjectId;
  householdId?: mongoose.Types.ObjectId;
  activityName: string;
  category: ActivityCategory;
  date: Date;
  quantity?: number;
  unit?: string;
  notes?: string;
  isCompleted: boolean;
  dataQuality: {
    status: DataQualityStatus;
    source: string;
  };
  footprintRecordId?: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentalActivitySchema = new Schema<IEnvironmentalActivity>(
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
    activityName: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: ['transportation', 'energy', 'electricity', 'household_fuel', 'waste', 'water', 'community', 'consumption'],
      required: true,
      index: true,
    },
    date: { type: Date, default: Date.now, index: true },
    quantity: { type: Number },
    unit: { type: String },
    notes: { type: String, default: '' },
    isCompleted: { type: Boolean, default: true },
    dataQuality: {
      status: {
        type: String,
        enum: ['User Entered', 'Measured', 'Imported', 'Estimated', 'Calculated', 'Verified'],
        default: 'User Entered',
      },
      source: { type: String, default: 'Manual Logger' },
    },
    footprintRecordId: {
      type: Schema.Types.ObjectId,
      ref: 'CarbonFootprintRecord',
    },
  },
  { timestamps: true }
);

EnvironmentalActivitySchema.index({ userId: 1, date: -1 });

export const EnvironmentalActivity = mongoose.model<IEnvironmentalActivity>(
  'EnvironmentalActivity',
  EnvironmentalActivitySchema
);
export default EnvironmentalActivity;
