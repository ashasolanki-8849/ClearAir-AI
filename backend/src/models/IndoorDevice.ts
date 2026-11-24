import mongoose, { Document, Schema } from 'mongoose';

export type DeviceType =
  | 'physical_sensor'
  | 'smart_purifier'
  | 'hvac_monitor'
  | 'co_dedicated_sensor'
  | 'demo_sensor';

export type DeviceConnectionStatus = 'online' | 'offline' | 'simulated';

export interface IDeviceLatestReadings {
  pm25?: number;
  pm10?: number;
  co2?: number;
  humidity?: number;
  temperature?: number;
  voc?: number; // ppb or air quality index
  co?: number; // ppm (only from dedicated sensor)
  timestamp?: Date;
}

export interface IIndoorDevice extends Document {
  userId: mongoose.Types.ObjectId;
  deviceName: string;
  deviceType: DeviceType;
  deviceIdentifier: string; // MAC / Serial / Cloud Device ID
  roomId?: mongoose.Types.ObjectId;
  roomName?: string;
  connectionStatus: DeviceConnectionStatus;
  supportedMetrics: string[];
  latestReadings?: IDeviceLatestReadings;
  isDemo: boolean;
  filterLifePercentage?: number; // for smart purifiers
  createdAt: Date;
  updatedAt: Date;
}

const LatestReadingsSchema = new Schema(
  {
    pm25: { type: Number },
    pm10: { type: Number },
    co2: { type: Number },
    humidity: { type: Number },
    temperature: { type: Number },
    voc: { type: Number },
    co: { type: Number },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const IndoorDeviceSchema = new Schema<IIndoorDevice>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    deviceName: {
      type: String,
      required: [true, 'Device name is required'],
      trim: true,
      maxlength: 80,
    },
    deviceType: {
      type: String,
      enum: [
        'physical_sensor',
        'smart_purifier',
        'hvac_monitor',
        'co_dedicated_sensor',
        'demo_sensor',
      ],
      default: 'physical_sensor',
    },
    deviceIdentifier: {
      type: String,
      required: true,
      trim: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'IndoorRoom',
      required: false,
      index: true,
    },
    roomName: { type: String, default: 'General Space' },
    connectionStatus: {
      type: String,
      enum: ['online', 'offline', 'simulated'],
      default: 'online',
    },
    supportedMetrics: {
      type: [String],
      default: ['pm25', 'pm10', 'temperature', 'humidity', 'co2'],
    },
    latestReadings: {
      type: LatestReadingsSchema,
      default: null,
    },
    isDemo: { type: Boolean, default: false },
    filterLifePercentage: { type: Number, min: 0, max: 100, default: 92 },
  },
  {
    timestamps: true,
  }
);

IndoorDeviceSchema.index({ userId: 1, deviceIdentifier: 1 });

export const IndoorDevice = mongoose.model<IIndoorDevice>('IndoorDevice', IndoorDeviceSchema);
