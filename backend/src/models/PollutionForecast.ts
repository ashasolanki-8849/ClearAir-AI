import mongoose, { Document, Schema } from 'mongoose';

export interface IPollutionForecast extends Document {
  location: {
    name: string;
    city?: string;
    coordinates: {
      lat: number;
      lon: number;
    };
  };
  forecastGeneratedAt: Date;
  forecastTargetTime: Date;
  forecastHorizon: '1h' | '3h' | '6h' | '12h' | '24h' | '48h' | '72h' | '7d';
  predictedAqi: number;
  predictedCategory: 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';
  predictedPollutants: {
    pm25: number;
    pm10: number;
    no2?: number;
    so2?: number;
    co?: number;
    o3?: number;
  };
  weatherForecast?: {
    temperature: number;
    humidity: number;
    windSpeed: number;
    windDirection: number;
    precipitation: number;
    weatherCode?: number;
  };
  providerOrModel: string;
  confidenceLevel: 'high' | 'medium' | 'low';
  confidenceScore: number; // 0-100
  trendDirection: 'increasing' | 'decreasing' | 'stable' | 'spike';
  createdAt: Date;
}

const PollutionForecastSchema = new Schema<IPollutionForecast>(
  {
    location: {
      name: { type: String, required: true },
      city: { type: String },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
    },
    forecastGeneratedAt: { type: Date, default: Date.now, index: true },
    forecastTargetTime: { type: Date, required: true, index: true },
    forecastHorizon: {
      type: String,
      enum: ['1h', '3h', '6h', '12h', '24h', '48h', '72h', '7d'],
      required: true,
    },
    predictedAqi: { type: Number, required: true },
    predictedCategory: {
      type: String,
      enum: ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
      required: true,
    },
    predictedPollutants: {
      pm25: { type: Number, required: true },
      pm10: { type: Number, required: true },
      no2: { type: Number },
      so2: { type: Number },
      co: { type: Number },
      o3: { type: Number },
    },
    weatherForecast: {
      temperature: { type: Number },
      humidity: { type: Number },
      windSpeed: { type: Number },
      windDirection: { type: Number },
      precipitation: { type: Number, default: 0 },
      weatherCode: { type: Number },
    },
    providerOrModel: { type: String, default: 'Open-Meteo CAMS Ensemble' },
    confidenceLevel: {
      type: String,
      enum: ['high', 'medium', 'low'],
      default: 'medium',
    },
    confidenceScore: { type: Number, default: 75 },
    trendDirection: {
      type: String,
      enum: ['increasing', 'decreasing', 'stable', 'spike'],
      default: 'stable',
    },
  },
  {
    timestamps: true,
  }
);

PollutionForecastSchema.index({
  'location.coordinates.lat': 1,
  'location.coordinates.lon': 1,
  forecastTargetTime: 1,
});

export const PollutionForecast = mongoose.model<IPollutionForecast>(
  'PollutionForecast',
  PollutionForecastSchema
);
