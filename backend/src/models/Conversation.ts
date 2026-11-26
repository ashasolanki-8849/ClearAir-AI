import mongoose, { Document, Schema } from 'mongoose';

export type SupportedLanguage = 'en' | 'hi' | 'gu';
export type MessageRole = 'user' | 'assistant' | 'system';

export interface IAIRecommendation {
  category: string; // e.g. "Outdoor Safety", "Family Protection", "Student Guidance", "Working Professionals", "Fitness & Exercise", "Community"
  action: string;
  reason: string;
  timing: string;
  personal_benefit: string;
  environmental_benefit: string;
}

export interface IStructuredAIResponse {
  summary: string;
  is_off_topic?: boolean;
  current_conditions: {
    locationName: string;
    aqi: number | null;
    category: string;
    dominant_pollutant?: string;
    pm25?: number | null;
    pm10?: number | null;
    temperature?: number | null;
    data_timestamp: string | null;
    is_live: boolean;
  };
  risk_level: string; // "Good" | "Satisfactory" | "Moderate" | "Poor" | "Very Poor" | "Severe" | "Unknown"
  user_context_applied?: {
    category: string;
    age_group: string;
  };
  recommendations: IAIRecommendation[];
  daily_routine?: {
    morning: string;
    afternoon: string;
    evening: string;
    night: string;
  };
  what_if_analysis?: {
    scenario: string;
    consequences: string;
    safer_alternative: string;
  };
  alternatives: string[];
  limitations: string[];
  follow_up_questions: string[];
}

export interface IMessage {
  id: string;
  role: MessageRole;
  content: string;
  structuredData?: IStructuredAIResponse | null;
  timestamp: Date;
}

export interface IConversation extends Document {
  userId?: mongoose.Types.ObjectId | null;
  sessionId?: string | null;
  title: string;
  messages: IMessage[];
  aqiContextSnapshot?: {
    locationName: string;
    city: string;
    lat: number;
    lon: number;
    aqi: number;
    aqiCategory: string;
    pm25: number;
    pm10: number;
    temperature?: number;
    humidity?: number;
    windSpeed?: number;
    condition?: string;
    timestamp: Date;
  };
  language: SupportedLanguage;
  createdAt: Date;
  updatedAt: Date;
}

const MessageSchema = new Schema(
  {
    id: { type: String, required: true },
    role: { type: String, enum: ['user', 'assistant', 'system'], required: true },
    content: { type: String, required: true },
    structuredData: { type: Schema.Types.Mixed, default: null },
    timestamp: { type: Date, default: Date.now },
  },
  { _id: false }
);

const ConversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      default: null,
      index: true,
    },
    sessionId: {
      type: String,
      default: null,
      index: true,
    },
    title: {
      type: String,
      required: true,
      trim: true,
      maxlength: 120,
    },
    messages: [MessageSchema],
    aqiContextSnapshot: {
      locationName: { type: String, default: 'Selected Area' },
      city: { type: String, default: '' },
      lat: { type: Number, default: 28.6139 },
      lon: { type: Number, default: 77.2090 },
      aqi: { type: Number, default: 0 },
      aqiCategory: { type: String, default: 'Moderate' },
      pm25: { type: Number, default: 0 },
      pm10: { type: Number, default: 0 },
      temperature: { type: Number },
      humidity: { type: Number },
      windSpeed: { type: Number },
      condition: { type: String },
      timestamp: { type: Date, default: Date.now },
    },
    language: {
      type: String,
      enum: ['en', 'hi', 'gu'],
      default: 'en',
    },
  },
  {
    timestamps: true,
  }
);

ConversationSchema.index({ userId: 1, updatedAt: -1 });
ConversationSchema.index({ sessionId: 1, updatedAt: -1 });

export const Conversation = mongoose.model<IConversation>('Conversation', ConversationSchema);
