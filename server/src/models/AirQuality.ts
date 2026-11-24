import mongoose, { Document, Schema } from 'mongoose';

export type AQICategory = 'Good' | 'Satisfactory' | 'Moderate' | 'Poor' | 'Very Poor' | 'Severe';

export interface IPollutants {
  pm25: number;
  pm10: number;
  no2: number;
  so2: number;
  co: number;
  o3: number;
  nh3?: number | null;
}

export interface IWeather {
  temperature: number;
  humidity: number;
  windSpeed: number;
  windDirection: number;
  condition: string;
  code?: number;
}

export interface IAirQuality extends Document {
  location: {
    name: string;
    city: string;
    lat: number;
    lon: number;
  };
  aqi: number;
  aqiCategory: AQICategory;
  standard: string;
  pollutants: IPollutants;
  weather: IWeather;
  dataSource: string;
  isDemo: boolean;
  timestamp: Date;
}

const AirQualitySchema = new Schema<IAirQuality>(
  {
    location: {
      name: { type: String, required: true },
      city: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    aqi: { type: Number, required: true },
    aqiCategory: {
      type: String,
      enum: ['Good', 'Satisfactory', 'Moderate', 'Poor', 'Very Poor', 'Severe'],
      required: true,
    },
    standard: { type: String, default: 'Indian CPCB / US EPA' },
    pollutants: {
      pm25: { type: Number, required: true },
      pm10: { type: Number, required: true },
      no2: { type: Number, required: true },
      so2: { type: Number, required: true },
      co: { type: Number, required: true },
      o3: { type: Number, required: true },
      nh3: { type: Number, default: null },
    },
    weather: {
      temperature: { type: Number, default: 20 },
      humidity: { type: Number, default: 50 },
      windSpeed: { type: Number, default: 5 },
      windDirection: { type: Number, default: 0 },
      condition: { type: String, default: 'Haze / Smog' },
      code: { type: Number, default: 0 },
    },
    dataSource: { type: String, default: 'Open-Meteo Air Quality & CAMS' },
    isDemo: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

// Indexes for fast lookup and TTL cache cleanup (1 day expiry on raw readings to avoid bloating)
AirQualitySchema.index({ 'location.lat': 1, 'location.lon': 1, timestamp: -1 });
AirQualitySchema.index({ createdAt: 1 }, { expireAfterSeconds: 86400 * 7 }); // 7 days retention

export const AirQuality = mongoose.model<IAirQuality>('AirQuality', AirQualitySchema);
