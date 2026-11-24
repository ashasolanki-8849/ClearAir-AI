import mongoose, { Document, Schema } from 'mongoose';

export interface IIndoorReading extends Document {
  deviceId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  pm25: number;
  pm10: number;
  co2?: number; // ppm (parts per million)
  humidity: number; // percentage
  temperature: number; // Celsius
  voc?: number; // ppb or index (optional)
  co?: number; // ppm (ONLY from dedicated CO sensor)
  isSimulated: boolean;
  timestamp: Date;
  createdAt: Date;
}

const IndoorReadingSchema = new Schema<IIndoorReading>(
  {
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'IndoorDevice',
      required: true,
      index: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
      index: true,
    },
    roomId: {
      type: Schema.Types.ObjectId,
      ref: 'IndoorRoom',
      required: false,
      index: true,
    },
    pm25: { type: Number, required: true },
    pm10: { type: Number, required: true },
    co2: { type: Number, default: 450 },
    humidity: { type: Number, required: true },
    temperature: { type: Number, required: true },
    voc: { type: Number },
    co: { type: Number },
    isSimulated: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now, index: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

IndoorReadingSchema.index({ deviceId: 1, timestamp: -1 });

export const IndoorReading = mongoose.model<IIndoorReading>(
  'IndoorReading',
  IndoorReadingSchema
);
