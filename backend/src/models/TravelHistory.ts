import mongoose, { Document, Schema } from 'mongoose';
import { TransportMode } from './SavedRoute.js';

export interface ITravelHistory extends Document {
  userId: mongoose.Types.ObjectId;
  origin: {
    name: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    lat: number;
    lon: number;
  };
  transportMode: TransportMode;
  distanceKm: number;
  durationMinutes: number;
  estimatedEmissionsGrams: number;
  emissionsAvoidedGrams: number;
  exposureScore: 'low' | 'moderate' | 'high' | 'severe';
  timestamp: Date;
  createdAt: Date;
}

const TravelHistorySchema = new Schema<ITravelHistory>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    origin: {
      name: { type: String, required: true },
      lat: { type: Number, default: 28.6139 },
      lon: { type: Number, default: 77.2090 },
    },
    destination: {
      name: { type: String, required: true },
      lat: { type: Number, default: 28.4986 },
      lon: { type: Number, default: 77.0878 },
    },
    transportMode: {
      type: String,
      required: true,
    },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    estimatedEmissionsGrams: { type: Number, default: 0 },
    emissionsAvoidedGrams: { type: Number, default: 0 },
    exposureScore: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

TravelHistorySchema.index({ userId: 1, timestamp: -1 });

export const TravelHistory = mongoose.model<ITravelHistory>(
  'TravelHistory',
  TravelHistorySchema
);
