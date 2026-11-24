import mongoose, { Document, Schema } from 'mongoose';

export type ReportType =
  | 'personal_summary'
  | 'monthly_carbon'
  | 'household_overview'
  | 'transportation_impact'
  | 'waste_management'
  | 'community_progress'
  | 'comprehensive_audit';

export interface IEnvironmentalReportRecord extends Document {
  userId: mongoose.Types.ObjectId;
  householdId?: mongoose.Types.ObjectId;
  communityId?: mongoose.Types.ObjectId;
  reportType: ReportType;
  title: string;
  reportingPeriod: {
    startDate: Date;
    endDate: Date;
    label: string;
  };
  reportData: Record<string, any>;
  generatedAt: Date;
  fileReference?: string;
  createdAt: Date;
  updatedAt: Date;
}

const EnvironmentalReportRecordSchema = new Schema<IEnvironmentalReportRecord>(
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
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
    },
    reportType: {
      type: String,
      enum: [
        'personal_summary',
        'monthly_carbon',
        'household_overview',
        'transportation_impact',
        'waste_management',
        'community_progress',
        'comprehensive_audit',
      ],
      required: true,
      index: true,
    },
    title: { type: String, required: true },
    reportingPeriod: {
      startDate: { type: Date, required: true },
      endDate: { type: Date, required: true },
      label: { type: String, required: true },
    },
    reportData: { type: Schema.Types.Mixed, required: true },
    generatedAt: { type: Date, default: Date.now },
    fileReference: { type: String, default: '' },
  },
  { timestamps: true }
);

EnvironmentalReportRecordSchema.index({ userId: 1, reportType: 1, generatedAt: -1 });

export const EnvironmentalReportRecord = mongoose.model<IEnvironmentalReportRecord>(
  'EnvironmentalReportRecord',
  EnvironmentalReportRecordSchema
);
export default EnvironmentalReportRecord;
