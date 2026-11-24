import mongoose, { Document, Schema } from 'mongoose';

export type PollutionCategory = 'particulate' | 'gaseous' | 'biological_moisture';
export type RiskSeverity = 'low' | 'moderate' | 'high' | 'severe';

export interface IIdentifiedSource {
  id: string;
  category: PollutionCategory;
  sourceName: string;
  whyItMatters: string;
  whereItOccurs: string;
  healthConcerns: string;
  preventiveAction: string;
  severity: RiskSeverity;
}

export interface IAssessmentRecommendation {
  id: string;
  category: 'immediate' | 'daily_habit' | 'ventilation' | 'filtration' | 'maintenance';
  title: string;
  action: string;
  benefit: string;
  priority: 'low' | 'medium' | 'high' | 'urgent';
  costCategory: 'zero_cost' | 'low_cost' | 'medium_cost' | 'higher_investment';
}

export interface IQuestionnaireResponses {
  roomType: string;
  roomAreaSqFt?: number;
  windowCount: number;
  ventilationAvailability: 'none' | 'limited' | 'adequate' | 'cross_ventilation';
  airPurifierStatus: 'none' | 'present_running' | 'present_idle';
  cookingActivities?: 'none' | 'light_boiling' | 'heavy_frying_tadka' | 'wood_kerosene';
  indoorSmoking: boolean;
  incenseOrCandles: 'never' | 'occasional' | 'daily_puja' | 'heavy';
  dustAccumulation: 'low' | 'moderate' | 'heavy';
  petsInRoom: boolean;
  cleaningHabits: 'dry_sweeping' | 'wet_mopping' | 'vacuum_hepa' | 'irregular';
  dampnessOrMold: 'none' | 'musty_odor' | 'visible_damp_patches' | 'visible_black_mold';
  combustionAppliances?: 'none' | 'piped_gas' | 'lpg_cylinder' | 'room_heater_unvented';
}

export interface IIndoorAssessment extends Document {
  userId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  roomName: string;
  roomType: string;
  questionnaireResponses: IQuestionnaireResponses;
  identifiedPollutionSources: IIdentifiedSource[];
  overallRiskLevel: RiskSeverity;
  assessmentSummary: string;
  recommendations: IAssessmentRecommendation[];
  isQuestionnaireBased: boolean;
  outdoorAqiAtAssessment?: number;
  createdAt: Date;
  updatedAt: Date;
}

const IdentifiedSourceSchema = new Schema(
  {
    id: { type: String, required: true },
    category: {
      type: String,
      enum: ['particulate', 'gaseous', 'biological_moisture'],
      required: true,
    },
    sourceName: { type: String, required: true },
    whyItMatters: { type: String, required: true },
    whereItOccurs: { type: String, required: true },
    healthConcerns: { type: String, required: true },
    preventiveAction: { type: String, required: true },
    severity: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
  },
  { _id: false }
);

const AssessmentRecommendationSchema = new Schema(
  {
    id: { type: String, required: true },
    category: {
      type: String,
      enum: ['immediate', 'daily_habit', 'ventilation', 'filtration', 'maintenance'],
      required: true,
    },
    title: { type: String, required: true },
    action: { type: String, required: true },
    benefit: { type: String, required: true },
    priority: {
      type: String,
      enum: ['low', 'medium', 'high', 'urgent'],
      default: 'medium',
    },
    costCategory: {
      type: String,
      enum: ['zero_cost', 'low_cost', 'medium_cost', 'higher_investment'],
      default: 'zero_cost',
    },
  },
  { _id: false }
);

const IndoorAssessmentSchema = new Schema<IIndoorAssessment>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'IndoorRoom',
      required: false,
      index: true,
    },
    roomName: { type: String, default: 'Living Area' },
    roomType: { type: String, default: 'living_room' },
    questionnaireResponses: {
      type: Schema.Types.Mixed,
      required: true,
    },
    identifiedPollutionSources: {
      type: [IdentifiedSourceSchema],
      default: [],
    },
    overallRiskLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    assessmentSummary: { type: String, default: '' },
    recommendations: {
      type: [AssessmentRecommendationSchema],
      default: [],
    },
    isQuestionnaireBased: { type: Boolean, default: true },
    outdoorAqiAtAssessment: { type: Number },
  },
  {
    timestamps: true,
  }
);

IndoorAssessmentSchema.index({ userId: 1, createdAt: -1 });

export const IndoorAssessment = mongoose.model<IIndoorAssessment>(
  'IndoorAssessment',
  IndoorAssessmentSchema
);
