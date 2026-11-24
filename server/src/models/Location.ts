import mongoose, { Document, Schema } from 'mongoose';

export interface ILocation extends Document {
  userId: mongoose.Types.ObjectId;
  name: string;
  city: string;
  country: string;
  lat: number;
  lon: number;
  isDefault: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const LocationSchema = new Schema<ILocation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    name: {
      type: String,
      required: true,
      trim: true,
    },
    city: {
      type: String,
      required: true,
      trim: true,
    },
    country: {
      type: String,
      default: '',
      trim: true,
    },
    lat: {
      type: Number,
      required: true,
    },
    lon: {
      type: Number,
      required: true,
    },
    isDefault: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

// Compound index to avoid duplicate saved locations for same user
LocationSchema.index({ userId: 1, name: 1, lat: 1, lon: 1 }, { unique: true });

export const Location = mongoose.model<ILocation>('Location', LocationSchema);
