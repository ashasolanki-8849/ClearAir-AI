import mongoose, { Document, Schema } from 'mongoose';

export type RoomType =
  | 'living_room'
  | 'bedroom'
  | 'kitchen'
  | 'bathroom'
  | 'study_room'
  | 'classroom'
  | 'office'
  | 'other';

export interface IRoomDimensions {
  length: number; // in meters or feet
  width: number;
  height: number;
  unit: 'meters' | 'feet';
}

export interface IRoomVentilation {
  windowCount: number;
  hasExhaustFan: boolean;
  hasAirPurifier: boolean;
  hasAC: boolean;
  ventilationType: 'natural' | 'mechanical' | 'balanced' | 'poor';
}

export interface IIndoorRoom extends Document {
  userId: mongoose.Types.ObjectId;
  roomName: string;
  roomType: RoomType;
  dimensions: IRoomDimensions;
  ventilation: IRoomVentilation;
  occupancyCount: number;
  hasSmokingExposure: boolean;
  hasPets: boolean;
  hasIncenseCandles: boolean;
  createdAt: Date;
  updatedAt: Date;
}

const RoomDimensionsSchema = new Schema(
  {
    length: { type: Number, default: 4 },
    width: { type: Number, default: 3.5 },
    height: { type: Number, default: 3 },
    unit: { type: String, enum: ['meters', 'feet'], default: 'meters' },
  },
  { _id: false }
);

const RoomVentilationSchema = new Schema(
  {
    windowCount: { type: Number, default: 1 },
    hasExhaustFan: { type: Boolean, default: false },
    hasAirPurifier: { type: Boolean, default: false },
    hasAC: { type: Boolean, default: false },
    ventilationType: {
      type: String,
      enum: ['natural', 'mechanical', 'balanced', 'poor'],
      default: 'natural',
    },
  },
  { _id: false }
);

const IndoorRoomSchema = new Schema<IIndoorRoom>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomName: {
      type: String,
      required: [true, 'Room name is required'],
      trim: true,
      maxlength: 60,
    },
    roomType: {
      type: String,
      enum: [
        'living_room',
        'bedroom',
        'kitchen',
        'bathroom',
        'study_room',
        'classroom',
        'office',
        'other',
      ],
      default: 'living_room',
    },
    dimensions: {
      type: RoomDimensionsSchema,
      default: () => ({ length: 4, width: 3.5, height: 3, unit: 'meters' }),
    },
    ventilation: {
      type: RoomVentilationSchema,
      default: () => ({
        windowCount: 1,
        hasExhaustFan: false,
        hasAirPurifier: false,
        hasAC: false,
        ventilationType: 'natural',
      }),
    },
    occupancyCount: { type: Number, default: 2 },
    hasSmokingExposure: { type: Boolean, default: false },
    hasPets: { type: Boolean, default: false },
    hasIncenseCandles: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

IndoorRoomSchema.index({ userId: 1, roomName: 1 });

export const IndoorRoom = mongoose.model<IIndoorRoom>('IndoorRoom', IndoorRoomSchema);
