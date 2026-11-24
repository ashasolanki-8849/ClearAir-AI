import mongoose, { Document, Schema } from 'mongoose';

export type BudgetPreference = 'free' | 'low_cost' | 'medium_budget' | 'high_investment' | 'all';
export type SustainabilityCategory =
  | 'transportation'
  | 'energy'
  | 'cooking'
  | 'waste'
  | 'shopping'
  | 'water'
  | 'environment';

export interface IUserSustainabilityProfile extends Document {
  userId: mongoose.Types.ObjectId;
  budgetPreference: BudgetPreference;
  focusCategories: SustainabilityCategory[];
  transportationHabits: {
    primaryCommuteMode: string;
    hasBicycle: boolean;
    hasElectricVehicle: boolean;
    willingToCarpool: boolean;
    dailyCommuteDistanceKm?: number;
  };
  householdHabits: {
    cookingFuel: 'lpg' | 'piped_natural_gas' | 'induction_electric' | 'traditional_biomass';
    wasteSegregationPracticed: boolean;
    compostingActive: boolean;
    airConditioningUsageHoursPerDay: number;
    solarPanelsInstalled: boolean;
    waterPurifierRejectWaterReused: boolean;
    appliancesStarRatingAvg: number;
  };
  sustainabilityGoals: string[];
  sustainabilityScore: {
    overall: number; // 0 to 100
    actionCompletionScore: number;
    challengeScore: number;
    diversityScore: number;
    householdScore: number;
    lastCalculatedAt: Date;
    calculationExplanation: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

const UserSustainabilityProfileSchema = new Schema<IUserSustainabilityProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    budgetPreference: {
      type: String,
      enum: ['free', 'low_cost', 'medium_budget', 'high_investment', 'all'],
      default: 'all',
    },
    focusCategories: {
      type: [String],
      enum: ['transportation', 'energy', 'cooking', 'waste', 'shopping', 'water', 'environment'],
      default: ['transportation', 'energy', 'waste', 'cooking'],
    },
    transportationHabits: {
      primaryCommuteMode: { type: String, default: 'public_transit' },
      hasBicycle: { type: Boolean, default: false },
      hasElectricVehicle: { type: Boolean, default: false },
      willingToCarpool: { type: Boolean, default: true },
      dailyCommuteDistanceKm: { type: Number, default: 12 },
    },
    householdHabits: {
      cookingFuel: {
        type: String,
        enum: ['lpg', 'piped_natural_gas', 'induction_electric', 'traditional_biomass'],
        default: 'piped_natural_gas',
      },
      wasteSegregationPracticed: { type: Boolean, default: true },
      compostingActive: { type: Boolean, default: false },
      airConditioningUsageHoursPerDay: { type: Number, default: 4 },
      solarPanelsInstalled: { type: Boolean, default: false },
      waterPurifierRejectWaterReused: { type: Boolean, default: false },
      appliancesStarRatingAvg: { type: Number, default: 3 },
    },
    sustainabilityGoals: {
      type: [String],
      default: ['Reduce single-use plastic', 'Optimize AC temperature to 24°C', 'Segregate household waste'],
    },
    sustainabilityScore: {
      overall: { type: Number, default: 58, min: 0, max: 100 },
      actionCompletionScore: { type: Number, default: 22 },
      challengeScore: { type: Number, default: 14 },
      diversityScore: { type: Number, default: 12 },
      householdScore: { type: Number, default: 10 },
      lastCalculatedAt: { type: Date, default: Date.now },
      calculationExplanation: {
        type: String,
        default: 'Score = (Completed Actions / Active Actions * 40) + (Challenge Days / 7 * 25) + (Category Breadth * 20) + (Household Practices * 15)',
      },
    },
  },
  { timestamps: true }
);

export const UserSustainabilityProfile = mongoose.model<IUserSustainabilityProfile>(
  'UserSustainabilityProfile',
  UserSustainabilityProfileSchema
);
