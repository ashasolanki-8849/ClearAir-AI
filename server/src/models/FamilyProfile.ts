import mongoose, { Document, Schema } from 'mongoose';

export type FamilyCategory = 'children' | 'adults' | 'elderly';
export type FamilyRelationship = 'child' | 'spouse' | 'parent' | 'elderly' | 'sibling' | 'other';

export interface IFamilyProfile extends Document {
  ownerUserId: mongoose.Types.ObjectId;
  name: string;
  relationship: FamilyRelationship;
  category: FamilyCategory;
  age: number;
  activityPreferences: string[];
  healthNotes?: string;
  activePrecautions: string[];
  createdAt: Date;
  updatedAt: Date;
}

const FamilyProfileSchema = new Schema<IFamilyProfile>(
  {
    ownerUserId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: [true, 'Member name is required'],
      trim: true,
    },
    relationship: {
      type: String,
      enum: ['child', 'spouse', 'parent', 'elderly', 'sibling', 'other'],
      default: 'child',
    },
    category: {
      type: String,
      enum: ['children', 'adults', 'elderly'],
      required: true,
    },
    age: {
      type: Number,
      required: true,
      min: 0,
      max: 120,
    },
    activityPreferences: {
      type: [String],
      default: [],
    },
    healthNotes: {
      type: String,
      default: '',
      trim: true,
    },
    activePrecautions: {
      type: [String],
      default: [],
    },
  },
  {
    timestamps: true,
  }
);

FamilyProfileSchema.index({ ownerUserId: 1, name: 1 });

export const FamilyProfile = mongoose.model<IFamilyProfile>(
  'FamilyProfile',
  FamilyProfileSchema
);
