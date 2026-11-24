import mongoose, { Document, Schema } from 'mongoose';

export type IndoorAlertCategory =
  | 'pm25_spike'
  | 'high_humidity'
  | 'co2_stuffiness'
  | 'purifier_filter'
  | 'kitchen_ventilation'
  | 'co_warning'
  | 'general_advisory';

export type AlertSeverity = 'info' | 'warning' | 'alert' | 'emergency';
export type AlertDataSource = 'connected_sensor' | 'estimated_assessment' | 'user_reported';

export interface IIndoorAlert extends Document {
  userId: mongoose.Types.ObjectId;
  roomId?: mongoose.Types.ObjectId;
  deviceId?: mongoose.Types.ObjectId;
  roomName: string;
  alertCategory: IndoorAlertCategory;
  severity: AlertSeverity;
  message: string;
  explanation: string;
  recommendedAction: string;
  dataSource: AlertDataSource;
  read: boolean;
  timestamp: Date;
  createdAt: Date;
  updatedAt: Date;
}

const IndoorAlertSchema = new Schema<IIndoorAlert>(
  {
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
    deviceId: {
      type: Schema.Types.ObjectId,
      ref: 'IndoorDevice',
      required: false,
    },
    roomName: { type: String, default: 'Indoor Space' },
    alertCategory: {
      type: String,
      enum: [
        'pm25_spike',
        'high_humidity',
        'co2_stuffiness',
        'purifier_filter',
        'kitchen_ventilation',
        'co_warning',
        'general_advisory',
      ],
      required: true,
    },
    severity: {
      type: String,
      enum: ['info', 'warning', 'alert', 'emergency'],
      default: 'warning',
    },
    message: { type: String, required: true },
    explanation: { type: String, default: '' },
    recommendedAction: { type: String, required: true },
    dataSource: {
      type: String,
      enum: ['connected_sensor', 'estimated_assessment', 'user_reported'],
      default: 'estimated_assessment',
    },
    read: { type: Boolean, default: false },
    timestamp: { type: Date, default: Date.now },
  },
  {
    timestamps: true,
  }
);

IndoorAlertSchema.index({ userId: 1, read: 1, createdAt: -1 });

export const IndoorAlert = mongoose.model<IIndoorAlert>('IndoorAlert', IndoorAlertSchema);
