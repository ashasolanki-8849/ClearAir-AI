import mongoose, { Document, Schema } from 'mongoose';

export type UserCategory =
  | 'student'
  | 'professional'
  | 'homemaker'
  | 'elderly'
  | 'outdoor_worker'
  | 'fitness_enthusiast'
  | 'family'
  | 'other';

export interface ILifestyleSchedule {
  wakeUpTime: string; // e.g. "06:30"
  sleepTime: string; // e.g. "22:30"
  workOrSchoolStart: string; // e.g. "09:00"
  workOrSchoolEnd: string; // e.g. "17:00"
  exerciseTime: string; // e.g. "07:00"
  mealTimings: {
    breakfast: string;
    lunch: string;
    dinner: string;
  };
  travelTimings: {
    morningCommute: string;
    eveningCommute: string;
  };
}

export interface ILifestyleProfile extends Document {
  userId: mongoose.Types.ObjectId;
  userCategory: UserCategory;
  schedule: ILifestyleSchedule;
  activityPreferences: string[];
  transportationPreferences: string[];
  healthVulnerabilities?: string[];
  preferredLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  createdAt: Date;
  updatedAt: Date;
}

const LifestyleProfileSchema = new Schema<ILifestyleProfile>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    userCategory: {
      type: String,
      enum: [
        'student',
        'professional',
        'homemaker',
        'elderly',
        'outdoor_worker',
        'fitness_enthusiast',
        'family',
        'other',
      ],
      default: 'professional',
    },
    schedule: {
      wakeUpTime: { type: String, default: '06:30' },
      sleepTime: { type: String, default: '22:30' },
      workOrSchoolStart: { type: String, default: '09:00' },
      workOrSchoolEnd: { type: String, default: '17:30' },
      exerciseTime: { type: String, default: '07:00' },
      mealTimings: {
        breakfast: { type: String, default: '08:00' },
        lunch: { type: String, default: '13:00' },
        dinner: { type: String, default: '20:30' },
      },
      travelTimings: {
        morningCommute: { type: String, default: '08:30' },
        eveningCommute: { type: String, default: '17:30' },
      },
    },
    activityPreferences: {
      type: [String],
      default: ['morning_walk', 'yoga', 'commuting', 'shopping'],
    },
    transportationPreferences: {
      type: [String],
      default: ['public_transport', 'walking'],
    },
    healthVulnerabilities: {
      type: [String],
      default: [],
    },
    preferredLocation: {
      name: { type: String, default: 'New Delhi' },
      lat: { type: Number, default: 28.6139 },
      lon: { type: Number, default: 77.2090 },
    },
  },
  {
    timestamps: true,
  }
);

export const LifestyleProfile = mongoose.model<ILifestyleProfile>(
  'LifestyleProfile',
  LifestyleProfileSchema
);
