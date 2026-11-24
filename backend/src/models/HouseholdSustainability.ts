import mongoose, { Document, Schema } from 'mongoose';

export interface IHouseholdGoal {
  id: string;
  title: string;
  category: string;
  targetDescription: string;
  progressPercentage: number;
  assignedMemberName?: string;
  isCompleted: boolean;
  targetDate?: string;
}

export interface IHouseholdSustainability extends Document {
  userId: mongoose.Types.ObjectId;
  householdName: string;
  memberCount: number;
  sharedGoals: IHouseholdGoal[];
  wasteManagement: {
    segregationRatePercentage: number;
    compostingActive: boolean;
    eWasteDropOffsCount: number;
  };
  energySavingProgress: {
    ledPercentage: number;
    offPeakUsageHabit: boolean;
    starRatedAppliancesInstalled: boolean;
  };
  completedHouseholdActionsCount: number;
  apartmentSocietyInitiatives?: Array<{
    title: string;
    organizer: string;
    description: string;
    status: 'active' | 'upcoming';
  }>;
  createdAt: Date;
  updatedAt: Date;
}

const HouseholdGoalSchema = new Schema<IHouseholdGoal>({
  id: { type: String, required: true },
  title: { type: String, required: true },
  category: { type: String, default: 'waste' },
  targetDescription: { type: String, required: true },
  progressPercentage: { type: Number, default: 0, min: 0, max: 100 },
  assignedMemberName: { type: String },
  isCompleted: { type: Boolean, default: false },
  targetDate: { type: String },
});

const HouseholdSustainabilitySchema = new Schema<IHouseholdSustainability>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    householdName: { type: String, default: 'Green Home' },
    memberCount: { type: Number, default: 3, min: 1 },
    sharedGoals: { type: [HouseholdGoalSchema], default: [] },
    wasteManagement: {
      segregationRatePercentage: { type: Number, default: 75, min: 0, max: 100 },
      compostingActive: { type: Boolean, default: false },
      eWasteDropOffsCount: { type: Number, default: 1 },
    },
    energySavingProgress: {
      ledPercentage: { type: Number, default: 80, min: 0, max: 100 },
      offPeakUsageHabit: { type: Boolean, default: true },
      starRatedAppliancesInstalled: { type: Boolean, default: true },
    },
    completedHouseholdActionsCount: { type: Number, default: 6 },
    apartmentSocietyInitiatives: {
      type: [
        {
          title: String,
          organizer: String,
          description: String,
          status: { type: String, enum: ['active', 'upcoming'], default: 'active' },
        },
      ],
      default: [
        {
          title: 'Society Wet-Waste Composting Drive',
          organizer: 'Resident Welfare Association (RWA)',
          description: 'Decentralized aerated bin composting in the society garden zone.',
          status: 'active',
        },
        {
          title: 'E-Waste & Dry Recyclable Collection Camp',
          organizer: 'CleanAir Community Taskforce',
          description: 'Bi-monthly drop-off camp for end-of-life electronics and batteries.',
          status: 'active',
        },
      ],
    },
  },
  { timestamps: true }
);

export const HouseholdSustainability = mongoose.model<IHouseholdSustainability>(
  'HouseholdSustainability',
  HouseholdSustainabilitySchema
);
