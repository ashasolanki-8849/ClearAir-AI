import mongoose, { Document, Schema } from 'mongoose';

export interface IForecastAlert extends Document {
  userId?: mongoose.Types.ObjectId;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  alertCategory:
    | 'spike_warning'
    | 'aqi_deterioration'
    | 'rain_cleansing'
    | 'severe_hazard'
    | 'improving_window'
    | 'unusual_trend';
  severity: 'info' | 'warning' | 'alert' | 'emergency';
  title: string;
  expectedTime: Date;
  expectedAqi: number;
  expectedCategory: string;
  relevantPollutant?: string;
  explanation: string;
  recommendedAction: string;
  dataSource: string;
  forecastTimestamp: Date;
  read: boolean;
  createdAt: Date;
}

const ForecastAlertSchema = new Schema<IForecastAlert>(
  {
    userId: { type: Schema.Types.ObjectId, ref: 'User', index: true },
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    alertCategory: {
      type: String,
      enum: [
        'spike_warning',
        'aqi_deterioration',
        'rain_cleansing',
        'severe_hazard',
        'improving_window',
        'unusual_trend',
      ],
      required: true,
      index: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'alert', 'emergency'],
      default: 'warning',
    },
    title: { type: String, required: true },
    expectedTime: { type: Date, required: true },
    expectedAqi: { type: Number, required: true },
    expectedCategory: { type: String, required: true },
    relevantPollutant: { type: String },
    explanation: { type: String, required: true },
    recommendedAction: { type: String, required: true },
    dataSource: { type: String, default: 'Open-Meteo CAMS Atmospheric Engine' },
    forecastTimestamp: { type: Date, default: Date.now },
    read: { type: Boolean, default: false },
  },
  {
    timestamps: true,
  }
);

ForecastAlertSchema.index({ userId: 1, read: 1, expectedTime: 1 });
ForecastAlertSchema.index({ 'location.lat': 1, 'location.lon': 1, expectedTime: 1 });

export const ForecastAlert = mongoose.model<IForecastAlert>(
  'ForecastAlert',
  ForecastAlertSchema
);
