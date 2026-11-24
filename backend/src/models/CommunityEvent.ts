import mongoose, { Document, Schema } from 'mongoose';

export type EventCategory =
  | 'clean_drive'
  | 'tree_planting'
  | 'recycling_camp'
  | 'workshop'
  | 'smog_awareness'
  | 'carpool_initiative'
  | 'other';

export type EventStatus = 'upcoming' | 'ongoing' | 'completed' | 'cancelled';

export interface ICommunityEvent extends Document {
  communityId: mongoose.Types.ObjectId;
  title: string;
  category: EventCategory;
  description: string;
  location: {
    name: string;
    address?: string;
    coordinates?: {
      lat: number;
      lon: number;
    };
  };
  startDate: Date;
  endDate: Date;
  organizerId: mongoose.Types.ObjectId;
  organizerName: string;
  maxParticipants: number;
  registeredCount: number;
  status: EventStatus;
  impactSummary?: {
    wasteCollectedKg?: number;
    treesPlanted?: number;
    attendees?: number;
    notes?: string;
  };
  createdAt: Date;
  updatedAt: Date;
}

export interface IEventRegistration extends Document {
  eventId: mongoose.Types.ObjectId;
  communityId: mongoose.Types.ObjectId;
  userId: mongoose.Types.ObjectId;
  userName: string;
  userEmail: string;
  status: 'registered' | 'attended' | 'cancelled';
  notes?: string;
  createdAt: Date;
  updatedAt: Date;
}

const CommunityEventSchema = new Schema<ICommunityEvent>(
  {
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    title: { type: String, required: true, trim: true },
    category: {
      type: String,
      enum: [
        'clean_drive',
        'tree_planting',
        'recycling_camp',
        'workshop',
        'smog_awareness',
        'carpool_initiative',
        'other',
      ],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      name: { type: String, required: true },
      address: { type: String, default: '' },
      coordinates: {
        lat: { type: Number },
        lon: { type: Number },
      },
    },
    startDate: { type: Date, required: true },
    endDate: { type: Date, required: true },
    organizerId: { type: Schema.Types.ObjectId, ref: 'User', required: true },
    organizerName: { type: String, required: true },
    maxParticipants: { type: Number, default: 50 },
    registeredCount: { type: Number, default: 0 },
    status: {
      type: String,
      enum: ['upcoming', 'ongoing', 'completed', 'cancelled'],
      default: 'upcoming',
    },
    impactSummary: {
      wasteCollectedKg: { type: Number, default: 0 },
      treesPlanted: { type: Number, default: 0 },
      attendees: { type: Number, default: 0 },
      notes: { type: String, default: '' },
    },
  },
  { timestamps: true }
);

CommunityEventSchema.index({ communityId: 1, startDate: 1 });
CommunityEventSchema.index({ status: 1 });

const EventRegistrationSchema = new Schema<IEventRegistration>(
  {
    eventId: {
      type: Schema.Types.ObjectId,
      ref: 'CommunityEvent',
      required: true,
    },
    communityId: {
      type: Schema.Types.ObjectId,
      ref: 'Community',
      required: true,
    },
    userId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    userName: { type: String, required: true },
    userEmail: { type: String, required: true },
    status: {
      type: String,
      enum: ['registered', 'attended', 'cancelled'],
      default: 'registered',
    },
    notes: { type: String, default: '' },
  },
  { timestamps: true }
);

EventRegistrationSchema.index({ eventId: 1, userId: 1 }, { unique: true });
EventRegistrationSchema.index({ communityId: 1, userId: 1 });

export const CommunityEvent = mongoose.model<ICommunityEvent>('CommunityEvent', CommunityEventSchema);
export const EventRegistration = mongoose.model<IEventRegistration>(
  'EventRegistration',
  EventRegistrationSchema
);
export default CommunityEvent;
