import mongoose, { Document, Schema } from 'mongoose';

export type TransportMode =
  | 'walking'
  | 'cycling'
  | 'public_transit'
  | 'metro'
  | 'bus'
  | 'carpool'
  | 'electric_vehicle'
  | 'two_wheeler'
  | 'private_car';

export interface ISavedRoute extends Document {
  userId: mongoose.Types.ObjectId;
  routeName: string;
  origin: {
    name: string;
    address: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    address: string;
    lat: number;
    lon: number;
  };
  preferredMode: TransportMode;
  alertEnabled: boolean;
  alertThresholdAqi: number;
  estimatedDistanceKm?: number;
  estimatedDurationMins?: number;
  createdAt: Date;
  updatedAt: Date;
}

const SavedRouteSchema = new Schema<ISavedRoute>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    routeName: {
      type: String,
      required: [true, 'Route name is required'],
      trim: true,
      maxlength: 100,
    },
    origin: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    destination: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    preferredMode: {
      type: String,
      enum: [
        'walking',
        'cycling',
        'public_transit',
        'metro',
        'bus',
        'carpool',
        'electric_vehicle',
        'two_wheeler',
        'private_car',
      ],
      default: 'metro',
    },
    alertEnabled: { type: Boolean, default: true },
    alertThresholdAqi: { type: Number, default: 200 },
    estimatedDistanceKm: { type: Number },
    estimatedDurationMins: { type: Number },
  },
  {
    timestamps: true,
  }
);

SavedRouteSchema.index({ userId: 1, routeName: 1 });

export const SavedRoute = mongoose.model<ISavedRoute>('SavedRoute', SavedRouteSchema);
