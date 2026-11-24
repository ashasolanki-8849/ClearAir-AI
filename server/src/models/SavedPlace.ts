import mongoose, { Document, Schema } from 'mongoose';

export type PlaceCategory = 'home' | 'office' | 'college' | 'school' | 'family' | 'other';

export interface ISavedPlace extends Document {
  userId: mongoose.Types.ObjectId;
  placeName: string;
  address: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  placeCategory: PlaceCategory;
  isDefaultOrigin: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const SavedPlaceSchema = new Schema<ISavedPlace>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    placeName: {
      type: String,
      required: [true, 'Place name is required'],
      trim: true,
      maxlength: 80,
    },
    address: {
      type: String,
      required: true,
      trim: true,
    },
    coordinates: {
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    placeCategory: {
      type: String,
      enum: ['home', 'office', 'college', 'school', 'family', 'other'],
      default: 'other',
    },
    isDefaultOrigin: {
      type: Boolean,
      default: false,
    },
  },
  {
    timestamps: true,
  }
);

SavedPlaceSchema.index({ userId: 1, placeName: 1 });

export const SavedPlace = mongoose.model<ISavedPlace>('SavedPlace', SavedPlaceSchema);
