import mongoose, { Document, Schema } from 'mongoose';

export type ScenarioType =
  | 'transport_shift'
  | 'indoor_purification'
  | 'urban_greening'
  | 'dust_control'
  | 'waste_burning_ban'
  | 'peak_hour_avoidance'
  | 'carpooling_society'
  | 'community_wide'
  | 'custom_multivariate';

export interface ISimulationParameters {
  vehicleReductionPct: number;             // 0 - 100%
  publicTransitAdoptionPct: number;        // 0 - 100%
  evAdoptionPct: number;                   // 0 - 100%
  householdsIndoorPurifiedCount: number;   // 0 - 10000 households
  treesPlantedCount: number;               // 0 - 50000 trees
  constructionDustMitigationPct: number;   // 0 - 100%
  industrialEmissionReductionPct: number;  // 0 - 100%
  wasteBurningBanCompliancePct: number;    // 0 - 100%
  peakHourOutdoorAvoidancePct: number;     // 0 - 100%
  carpoolingHouseholdsCount: number;       // 0 - 5000 households
}

export interface IBaselineData {
  city: string;
  stationName?: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  currentAqi: number;
  currentPm25: number;
  currentPm10: number;
  currentNo2?: number;
  currentSo2?: number;
  currentCo?: number;
  temperature: number;
  humidity: number;
  windSpeed: number;
  pblHeightMeters?: number; // Planetary boundary layer / mixing depth
  timestamp: Date;
}

export interface ISimulationResults {
  simulatedAqi: number;
  simulatedPm25: number;
  simulatedPm10: number;
  aqiChange: number;                       // e.g. -45 (reduction)
  pm25ReductionPct: number;               // e.g. 24.5%
  pm10ReductionPct: number;               // e.g. 21.0%
  tailpipeEmissionsAvoidedKgCO2e: number; // e.g. 142.5 kg CO2e
  tailpipePm25AvoidedGrams: number;       // e.g. 18.4 g
  personalInhaledDoseAvoidedGrams: number;// e.g. 0.085 g
  communityImpact: {
    totalHouseholdParticipants: number;
    dailyEmissionsSavedKgCO2e: number;
    annualizedParticulateInterceptionKg: number;
  };
  comparison: {
    current: {
      aqi: number;
      pm25: number;
      pm10: number;
      category: string;
      personalRisk: string;
    };
    simulated: {
      aqi: number;
      pm25: number;
      pm10: number;
      category: string;
      personalRisk: string;
    };
    recommended: {
      aqi: number;
      pm25: number;
      pm10: number;
      category: string;
      personalRisk: string;
    };
  };
  projections: {
    daily: {
      pm25Avg: number;
      aqiAvg: number;
    };
    weekly: {
      cumulativeAvoidedKgCO2e: number;
      cumulativePm25Grams: number;
    };
    monthly: {
      cumulativeAvoidedKgCO2e: number;
      cumulativePm25Grams: number;
    };
  };
}

export interface ISimulationAIAnalysis {
  whatChanges: string;
  whyPollutionChanges: string;
  pollutantsAffected: string[];
  whoBenefits: string;
  limitations: string[];
  practicalActions: string[];
  communityParticipation: string;
  confidenceLevel: 'High' | 'Medium' | 'Indicative';
}

export interface IPollutionSimulation extends Document {
  userId?: mongoose.Types.ObjectId;
  householdId?: mongoose.Types.ObjectId;
  communityId?: mongoose.Types.ObjectId;
  name: string;
  scenarioType: ScenarioType;
  description?: string;
  parameters: ISimulationParameters;
  baselineData: IBaselineData;
  results: ISimulationResults;
  scientificAssumptions: string[];
  aiAnalysis?: ISimulationAIAnalysis;
  isSaved: boolean;
  tags: string[];
  createdAt: Date;
  updatedAt: Date;
}

const PollutionSimulationSchema = new Schema<IPollutionSimulation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
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
    name: {
      type: String,
      required: true,
      trim: true,
      default: 'Custom What-if Simulation',
    },
    scenarioType: {
      type: String,
      enum: [
        'transport_shift',
        'indoor_purification',
        'urban_greening',
        'dust_control',
        'waste_burning_ban',
        'peak_hour_avoidance',
        'carpooling_society',
        'community_wide',
        'custom_multivariate',
      ],
      default: 'custom_multivariate',
      index: true,
    },
    description: { type: String, trim: true },
    parameters: {
      vehicleReductionPct: { type: Number, default: 0, min: 0, max: 100 },
      publicTransitAdoptionPct: { type: Number, default: 0, min: 0, max: 100 },
      evAdoptionPct: { type: Number, default: 0, min: 0, max: 100 },
      householdsIndoorPurifiedCount: { type: Number, default: 0, min: 0 },
      treesPlantedCount: { type: Number, default: 0, min: 0 },
      constructionDustMitigationPct: { type: Number, default: 0, min: 0, max: 100 },
      industrialEmissionReductionPct: { type: Number, default: 0, min: 0, max: 100 },
      wasteBurningBanCompliancePct: { type: Number, default: 0, min: 0, max: 100 },
      peakHourOutdoorAvoidancePct: { type: Number, default: 0, min: 0, max: 100 },
      carpoolingHouseholdsCount: { type: Number, default: 0, min: 0 },
    },
    baselineData: {
      city: { type: String, required: true },
      stationName: { type: String },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
      currentAqi: { type: Number, required: true },
      currentPm25: { type: Number, required: true },
      currentPm10: { type: Number, required: true },
      currentNo2: { type: Number },
      currentSo2: { type: Number },
      currentCo: { type: Number },
      temperature: { type: Number, default: 22 },
      humidity: { type: Number, default: 60 },
      windSpeed: { type: Number, default: 5 },
      pblHeightMeters: { type: Number, default: 450 },
      timestamp: { type: Date, default: Date.now },
    },
    results: {
      simulatedAqi: { type: Number, required: true },
      simulatedPm25: { type: Number, required: true },
      simulatedPm10: { type: Number, required: true },
      aqiChange: { type: Number, required: true },
      pm25ReductionPct: { type: Number, default: 0 },
      pm10ReductionPct: { type: Number, default: 0 },
      tailpipeEmissionsAvoidedKgCO2e: { type: Number, default: 0 },
      tailpipePm25AvoidedGrams: { type: Number, default: 0 },
      personalInhaledDoseAvoidedGrams: { type: Number, default: 0 },
      communityImpact: {
        totalHouseholdParticipants: { type: Number, default: 0 },
        dailyEmissionsSavedKgCO2e: { type: Number, default: 0 },
        annualizedParticulateInterceptionKg: { type: Number, default: 0 },
      },
      comparison: {
        current: {
          aqi: Number,
          pm25: Number,
          pm10: Number,
          category: String,
          personalRisk: String,
        },
        simulated: {
          aqi: Number,
          pm25: Number,
          pm10: Number,
          category: String,
          personalRisk: String,
        },
        recommended: {
          aqi: Number,
          pm25: Number,
          pm10: Number,
          category: String,
          personalRisk: String,
        },
      },
      projections: {
        daily: {
          pm25Avg: Number,
          aqiAvg: Number,
        },
        weekly: {
          cumulativeAvoidedKgCO2e: Number,
          cumulativePm25Grams: Number,
        },
        monthly: {
          cumulativeAvoidedKgCO2e: Number,
          cumulativePm25Grams: Number,
        },
      },
    },
    scientificAssumptions: [{ type: String }],
    aiAnalysis: {
      whatChanges: String,
      whyPollutionChanges: String,
      pollutantsAffected: [String],
      whoBenefits: String,
      limitations: [String],
      practicalActions: [String],
      communityParticipation: String,
      confidenceLevel: {
        type: String,
        enum: ['High', 'Medium', 'Indicative'],
        default: 'Indicative',
      },
    },
    isSaved: { type: Boolean, default: false, index: true },
    tags: [{ type: String, trim: true }],
  },
  { timestamps: true }
);

PollutionSimulationSchema.index({ userId: 1, isSaved: 1, createdAt: -1 });

export const PollutionSimulation = mongoose.model<IPollutionSimulation>(
  'PollutionSimulation',
  PollutionSimulationSchema
);
export default PollutionSimulation;
