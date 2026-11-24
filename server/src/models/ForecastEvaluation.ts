import mongoose, { Document, Schema } from 'mongoose';

export interface IForecastEvaluation extends Document {
  forecastId?: mongoose.Types.ObjectId;
  location: {
    name: string;
    lat: number;
    lon: number;
  };
  predictedAqi: number;
  actualAqi: number;
  absoluteError: number; // |predicted - actual|
  squaredError: number; // (predicted - actual)^2
  percentageError?: number; // |actual - predicted| / actual * 100
  horizon: '1h' | '3h' | '6h' | '12h' | '24h' | '48h' | '7d';
  forecastTargetTime: Date;
  evaluatedAt: Date;
  modelEvaluated: string;
  isWithinAcceptableTolerance: boolean; // within +/- 15 AQI points or 15%
}

const ForecastEvaluationSchema = new Schema<IForecastEvaluation>(
  {
    forecastId: { type: Schema.Types.ObjectId, ref: 'PollutionForecast' },
    location: {
      name: { type: String, required: true },
      lat: { type: Number, required: true },
      lon: { type: Number, required: true },
    },
    predictedAqi: { type: Number, required: true },
    actualAqi: { type: Number, required: true },
    absoluteError: { type: Number, required: true },
    squaredError: { type: Number, required: true },
    percentageError: { type: Number },
    horizon: {
      type: String,
      enum: ['1h', '3h', '6h', '12h', '24h', '48h', '7d'],
      required: true,
      index: true,
    },
    forecastTargetTime: { type: Date, required: true },
    evaluatedAt: { type: Date, default: Date.now, index: true },
    modelEvaluated: { type: String, default: 'Open-Meteo CAMS Ensemble' },
    isWithinAcceptableTolerance: { type: Boolean, default: true },
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  }
);

ForecastEvaluationSchema.index({ 'location.lat': 1, 'location.lon': 1, horizon: 1 });

export const ForecastEvaluation = mongoose.model<IForecastEvaluation>(
  'ForecastEvaluation',
  ForecastEvaluationSchema
);
