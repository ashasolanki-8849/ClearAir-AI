import mongoose, { Document, Schema } from 'mongoose';

export type CampaignCategory =
  | 'waste_segregation'
  | 'anti_burning'
  | 'green_commute'
  | 'energy_conservation'
  | 'clean_air_audit';

export type CampaignStatus = 'active' | 'completed' | 'draft';

export interface ICommunityCampaign extends Document {
  communityId: mongoose.Types.ObjectId;
  title: string;
  objective: string;
  category: CampaignCategory;
  startDate: Date;
  endDate: Date;
  targetMetric: string;
  targetValue: number;
  currentValue: number;
  participantsCount: number;
  status: CampaignStatus;
  resultsNotes?: string;
  createdBy: mongoose.Types.ObjectId;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityCampaignSchema = new Schema<ICommunityCampaign>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    objective: { type: String, required: true },
    category: {
      type: String,
      enum: [
        'waste_segregation',
        'anti_burning',
        'green_commute',
        'energy_conservation',
        'clean_air_audit',
      ],
      required: true,
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    targetMetric: { type: String, required: true },
    targetValue: { type: Number, required: true },
    currentValue: { type: Number, default: 0 },
    participantsCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['active', 'completed', 'draft'],
      default: 'active',
    },
    resultsNotes: { type: String, default: '' },
    createdBy: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
  },
  { timestamps: true }
);

CommunityCampaignSchema.index({ communityId: 1, status: 1 });

export const CommunityCampaign = mongoose.model<ICommunityCampaign>('CommunityCampaign', CommunityCampaignSchema);
export default CommunityCampaign;
