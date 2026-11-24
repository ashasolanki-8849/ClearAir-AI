import mongoose, { Document, Schema } from 'mongoose';
import { TransportMode } from './SavedRoute.js';

export type TravelPriority =
  | 'balanced'
  | 'fastest'
  | 'lowest_emissions'
  | 'lowest_exposure'
  | 'lowest_cost';

export interface ITravelPreference extends Document {
  userId: mongoose.Types.ObjectId;
  preferredModes: TransportMode[];
  priority: TravelPriority;
  alertSettings: {
    emailAlerts: boolean;
    severeSmogWarning: boolean;
    routeDegradedAlert: boolean;
    aqiThreshold: number;
  };
  preferredDepartureWindows: {
    morningCommute: string;
    eveningReturn: string;
  };
  vehicleProfile: {
    carFuelType: 'petrol' | 'diesel' | 'cng' | 'ev' | 'hybrid' | 'none';
    twoWheelerType: 'petrol' | 'electric' | 'none';
    hasCarpoolAccess: boolean;
  };
  createdAt: Date;
  updatedAt: Date;
}

const TravelPreferenceSchema = new Schema<ITravelPreference>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      unique: true,
      index: true,
    },
    preferredModes: {
      type: [String],
      default: ['metro', 'public_transit', 'carpool', 'walking'],
    },
    priority: {
      type: String,
      enum: ['balanced', 'fastest', 'lowest_emissions', 'lowest_exposure', 'lowest_cost'],
      default: 'balanced',
    },
    alertSettings: {
      emailAlerts: { type: Boolean, default: false },
      severeSmogWarning: { type: Boolean, default: true },
      routeDegradedAlert: { type: Boolean, default: true },
      aqiThreshold: { type: Number, default: 200 },
    },
    preferredDepartureWindows: {
      morningCommute: { type: String, default: '08:30' },
      eveningReturn: { type: String, default: '17:30' },
    },
    vehicleProfile: {
      carFuelType: {
        type: String,
        enum: ['petrol', 'diesel', 'cng', 'ev', 'hybrid', 'none'],
        default: 'none',
      },
      twoWheelerType: {
        type: String,
        enum: ['petrol', 'electric', 'none'],
        default: 'none',
      },
      hasCarpoolAccess: { type: Boolean, default: true },
    },
  },
  {
    timestamps: true,
  }
);

export const TravelPreference = mongoose.model<ITravelPreference>(
  'TravelPreference',
  TravelPreferenceSchema
);
