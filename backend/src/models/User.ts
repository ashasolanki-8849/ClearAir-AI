import mongoose, { Document, Schema } from 'mongoose';
import bcrypt from 'bcryptjs';

export type AgeGroup = 'under_18' | '18_35' | '36_60' | 'above_60';
export type UserCategory = 'student' | 'professional' | 'family' | 'elderly' | 'general' | 'community';

export interface IUser extends Document {
  fullName: string;
  email: string;
  password?: string;
  ageGroup: AgeGroup;
  userCategory: UserCategory;
  city: string;
  preferredLocation?: {
    name: string;
    lat: number;
    lon: number;
  };
  loginAttempts: number;
  lockUntil?: Date;
  createdAt: Date;
  updatedAt: Date;
  comparePassword(candidatePassword: string): Promise<boolean>;
  isLocked: boolean;
}

const UserSchema = new Schema<IUser>(
  {
    fullName: {
      type: String,
      required: [true, 'Full name is required'],
      trim: true,
      maxlength: [100, 'Name cannot exceed 100 characters'],
    },
    email: {
      type: String,
      required: [true, 'Email is required'],
      unique: true,
      lowercase: true,
      trim: true,
      match: [/^\S+@\S+\.\S+$/, 'Please provide a valid email address'],
    },
    password: {
      type: String,
      required: [true, 'Password is required'],
      minlength: [8, 'Password must be at least 8 characters long'],
      select: false,
    },
    ageGroup: {
      type: String,
      enum: ['under_18', '18_35', '36_60', 'above_60'],
      default: '18_35',
    },
    userCategory: {
      type: String,
      enum: ['student', 'professional', 'family', 'elderly', 'general', 'community'],
      default: 'general',
    },
    city: {
      type: String,
      required: [true, 'City is required'],
      trim: true,
      default: 'Gandhinagar',
    },
    preferredLocation: {
      name: { type: String, default: 'Gandhinagar' },
      lat: { type: Number, default: 23.2156 },
      lon: { type: Number, default: 72.6369 },
    },
    loginAttempts: {
      type: Number,
      default: 0,
    },
    lockUntil: {
      type: Date,
    },
  },
  {
    timestamps: true,
  }
);

// Virtual property to check if account is currently locked
UserSchema.virtual('isLocked').get(function (this: IUser) {
  return !!(this.lockUntil && this.lockUntil.getTime() > Date.now());
});

// Hash password with strong salt work factor (12 rounds) before saving
UserSchema.pre('save', async function (next) {
  if (!this.isModified('password') || !this.password) {
    return next();
  }
  try {
    const salt = await bcrypt.genSalt(12);
    this.password = await bcrypt.hash(this.password, salt);
    next();
  } catch (err: any) {
    next(err);
  }
});

// Timing-safe password verification
UserSchema.methods.comparePassword = async function (candidatePassword: string): Promise<boolean> {
  if (!this.password) return false;
  return bcrypt.compare(candidatePassword, this.password);
};

export const User = mongoose.model<IUser>('User', UserSchema);
