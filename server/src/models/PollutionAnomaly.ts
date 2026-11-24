import mongoose, { Document, Schema } from 'mongoose';

export interface IPollutionAnomaly extends Document {
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  pollutant: 'aqi' | 'pm25' | 'pm10' | 'no2' | 'so2' | 'co' | 'o3';
  detectedValue: number;
  baselineValue: number; // 24-hour moving average
  anomalyDelta: number; // detected - baseline
  zScore: number; // standard deviations from normal
  rateOfChangePerHour?: number;
  severity: 'mild' | 'moderate' | 'severe' | 'critical_spike';
  detectionMethod: 'rolling_zscore' | 'rate_of_change_spike' | 'cpcb_severe_jump' | 'threshold';
  possibleCauses: string[];
  actionableAdvice: string;
  timestamp: Date;
  resolved: boolean;
  createdAt: Date;
}

const PollutionAnomalySchema = new Schema<IPollutionAnomaly>(
  {
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    pollutant: {
      type: String,
      enum: ['aqi', 'pm25', 'pm10', 'no2', 'so2', 'co', 'o3'],
      required: true,
    },
    detectedValue: { type: Number, required: true },
    baselineValue: { type: Number, required: true },
    anomalyDelta: { type: Number, required: true },
    zScore: { type: Number, required: true },
    rateOfChangePerHour: { type: Number },
    severity: {
      type: String,
      enum: ['mild', 'moderate', 'severe', 'critical_spike'],
      required: true,
      index: true,
    },
    detectionMethod: {
      type: String,
      enum: ['rolling_zscore', 'rate_of_change_spike', 'cpcb_severe_jump', 'threshold'],
      default: 'rolling_zscore',
    },
    possibleCauses: [{ type: String }],
    actionableAdvice: { type: String, required: true },
    timestamp: { type: Date, default: Date.now, index: true },
    resolved: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

PollutionAnomalySchema.index({ 'location.lat': 1, 'location.lon': 1, timestamp: -1 });

export const PollutionAnomaly = mongoose.model<IPollutionAnomaly>(
  'PollutionAnomaly',
  PollutionAnomalySchema
);
