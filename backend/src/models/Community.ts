import mongoose, { Document, Schema } from 'mongoose';

export type CommunityType =
  | 'residential_society'
  | 'school'
  | 'college'
  | 'workplace'
  | 'neighborhood'
  | 'environmental_group';

export type CommunityPrivacy = 'public' | 'private' | 'invite_only';

export interface ICommunityLocation {
  city: string;
  locality: string;
  coordinates: {
    lat: number;
    lon: number;
  };
  address?: string;
  pincode?: string;
}

export interface ICommunitySettings {
  allowMemberPosts: boolean;
  requireReportVerification: boolean;
  autoAlertSevereAqi: boolean;
  aqiAlertThreshold: number;
}

export interface ICommunity extends Document {
  name: string;
  slug: string;
  type: CommunityType;
  description: string;
  location: ICommunityLocation;
  privacy: CommunityPrivacy;
  invitationCode: string;
  ownerId: mongoose.Types.ObjectId;
  objectives: string[];
  bannerUrl?: string;
  logoUrl?: string;
  adminContact?: {
    email?: string;
    phone?: string;
    organizationName?: string;
  };
  membersCount: number;
  settings: ICommunitySettings;
  createdAt: Date;
  updatedAt: Date;
}

const CommunitySchema = new Schema<ICommunity>(
  {
    name: { type: String, required: true, trim: true },
    slug: { type: String, required: true, unique: true, lowercase: true, trim: true },
    type: {
      type: String,
      enum: [
        'residential_society',
        'school',
        'college',
        'workplace',
        'neighborhood',
        'environmental_group',
      ],
      required: true,
    },
    description: { type: String, required: true },
    location: {
      city: { type: String, required: true, trim: true },
      locality: { type: String, required: true, trim: true },
      coordinates: {
        lat: { type: Number, required: true },
        lon: { type: Number, required: true },
      },
      address: { type: String, default: '' },
      pincode: { type: String, default: '' },
    },
    privacy: {
      type: String,
      enum: ['public', 'private', 'invite_only'],
      default: 'public',
    },
    invitationCode: {
      type: String,
      required: true,
      unique: true,
      uppercase: true,
      trim: true,
    },
    ownerId: {
      type: Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    objectives: [{ type: String }],
    bannerUrl: { type: String, default: '' },
    logoUrl: { type: String, default: '' },
    adminContact: {
      email: { type: String, default: '' },
      phone: { type: String, default: '' },
      organizationName: { type: String, default: '' },
    },
    membersCount: { type: Number, default: 1 },
    settings: {
      allowMemberPosts: { type: Boolean, default: true },
      requireReportVerification: { type: Boolean, default: true },
      autoAlertSevereAqi: { type: Boolean, default: true },
      aqiAlertThreshold: { type: Number, default: 300 },
    },
  },
  { timestamps: true }
);

CommunitySchema.index({ 'location.city': 1, 'location.locality': 1 });
CommunitySchema.index({ type: 1 });
CommunitySchema.index({ privacy: 1 });

export default mongoose.model<ICommunity>('Community', CommunitySchema);
