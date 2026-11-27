import mongoose, { Document, Schema } from 'mongoose';
import { TransportMode } from './SavedRoute.js';

export interface IRouteAlternative {
  routeId: string;
  routeName: string;
  routeTag: 'fastest' | 'cleanest_corridor' | 'transit_eco' | 'balanced' | 'transit_bus' | 'two_wheeler';
  mode: TransportMode;
  distanceKm: number;
  durationMinutes: number;
  trafficStatus: 'low' | 'moderate' | 'heavy' | 'severe';
  estimatedEmissionsGrams: number;
  estimatedCostInr?: number;
  exposureLevel: 'low' | 'moderate' | 'high' | 'severe';
  exposureExplanation: string;
  advantages: string[];
  disadvantages: string[];
  geometryCoordinates: [number, number][]; // [lat, lon] array for Leaflet polyline
  steps?: { instruction: string; distanceMeters: number }[];
}

export interface IRouteComparison extends Document {
  userId?: mongoose.Types.ObjectId;
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
  routes: IRouteAlternative[];
  environmentalContext: {
    cityAqi: number;
    aqiCategory: string;
    pm25: number;
    temperature: number;
    isRouteSensorAvailable: boolean;
  };
  recommendedRouteId: string;
  recommendationReason: string;
  timestamp: Date;
}

const RouteAlternativeSchema = new Schema(
  {
    routeId: { type: String, required: true },
    routeName: { type: String, required: true },
    routeTag: {
      type: String,
      enum: ['fastest', 'cleanest_corridor', 'transit_eco', 'balanced'],
      default: 'balanced',
    },
    mode: { type: String, required: true },
    distanceKm: { type: Number, required: true },
    durationMinutes: { type: Number, required: true },
    trafficStatus: {
      type: String,
      enum: ['low', 'moderate', 'heavy', 'severe'],
      default: 'moderate',
    },
    estimatedEmissionsGrams: { type: Number, default: 0 },
    estimatedCostInr: { type: Number },
    exposureLevel: {
      type: String,
      enum: ['low', 'moderate', 'high', 'severe'],
      default: 'moderate',
    },
    exposureExplanation: { type: String, default: '' },
    advantages: { type: [String], default: [] },
    disadvantages: { type: [String], default: [] },
    geometryCoordinates: { type: [[Number]], default: [] },
    steps: { type: [Schema.Types.Mixed], default: [] },
  },
  { _id: false }
);

const RouteComparisonSchema = new Schema<IRouteComparison>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: false,
      index: true,
    },
    origin: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    routes: {
      type: [RouteAlternativeSchema],
      default: [],
    },
    environmentalContext: {
      cityAqi: { type: Number, default: 150 },
      aqiCategory: { type: String, default: 'Moderate' },
      pm25: { type: Number, default: 60 },
      temperature: { type: Number, default: 20 },
      isRouteSensorAvailable: { type: Boolean, default: false },
    },
    recommendedRouteId: { type: String, default: 'route_1' },
    recommendationReason: { type: String, default: '' },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

RouteComparisonSchema.index({ userId: 1, createdAt: -1 });

export const RouteComparison = mongoose.model<IRouteComparison>(
  'RouteComparison',
  RouteComparisonSchema
);
