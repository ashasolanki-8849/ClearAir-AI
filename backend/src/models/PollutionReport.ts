import mongoose, { Document, Schema } from 'mongoose';

export type PollutionCategory =
  | 'garbage_burning'
  | 'construction_dust'
  | 'road_dust'
  | 'vehicle_smoke'
  | 'industrial_emissions'
  | 'open_waste_dumping'
  | 'excessive_smoke'
  | 'waste_management'
  | 'other';

export type ReportSeverity = 'low' | 'moderate' | 'high' | 'severe';

export type ReportStatus =
  | 'submitted'
  | 'under_review'
  | 'verified'
  | 'in_progress'
  | 'resolved'
  | 'rejected';

export interface IPollutionReport extends Document {
  communityId?: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  reporterName: string;
  isAnonymous: boolean;
  category: PollutionCategory;
  title: string;
  description: string;
  location: {
    name: string;
    city: string;
    locality?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  imageUrl?: string;
  severity: ReportSeverity;
  status: ReportStatus;
  moderationNotes?: string;
  verifiedBy?: mongoose.Types.ObjectId;
  verifiedAt?: Date;
  resolvedAt?: Date;
  resolvedNotes?: string;
  isPublic: boolean;
  upvotes: number;
  upvoters: mongoose.Types.ObjectId[];
  createdAt: Date;
  updatedAt: Date;
}

const PollutionReportSchema = new Schema<IPollutionReport>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    reporterName: {
      type: String,
      required: true,
      default: 'Anonymous Citizen',
    },
    isAnonymous: {
      type: Boolean,
      default: false,
    },
    category: {
      type: String,
      enum: [
        'garbage_burning',
        'construction_dust',
        'road_dust',
        'vehicle_smoke',
        'industrial_emissions',
        'open_waste_dumping',
        'excessive_smoke',
        'waste_management',
        'other',
      ],
      required: true,
    },
    title: { type: String, required: true, trim: true },
    description: { type: String, required: true },
    location: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      locality: { type: String, default: '' },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    imageUrl: { type: String, default: '' },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    status: {
      type: String,
      enum: ['submitted', 'under_review', 'verified', 'in_progress', 'resolved', 'rejected'],
      default: 'submitted',
    },
    moderationNotes: { type: String, default: '' },
    verifiedBy: { type: Schema.Types.ObjectId, ref: 'User' },
    verifiedAt: { type: Date },
    resolvedAt: { type: Date },
    resolvedNotes: { type: String, default: '' },
    isPublic: { type: Boolean, default: true },
    upvotes: { type: Number, default: 0 },
    upvoters: [{ type: Schema.Types.ObjectId, ref: 'User' }],
  },
  { timestamps: true }
);

PollutionReportSchema.index({ communityId: 1, status: 1 });
PollutionReportSchema.index({ 'location.city': 1, status: 1 });
PollutionReportSchema.index({ category: 1, status: 1 });
PollutionReportSchema.index({ createdAt: -1 });

export default mongoose.model<IPollutionReport>('PollutionReport', PollutionReportSchema);
