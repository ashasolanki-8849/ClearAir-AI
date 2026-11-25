import mongoose, { Schema, Document } from 'mongoose';

export interface IReview extends Document {
  name: string;
  rating: number; // 1 to 5
  comment: string;
  location?: string;
  createdAt: Date;
}

const ReviewSchema: Schema = new Schema(
  {
    name: {
      type: String,
      required: [true, 'Please provide your name'],
      trim: true,
      maxlength: [60, 'Name cannot exceed 60 characters'],
    },
    rating: {
      type: Number,
      required: [true, 'Please provide a rating'],
      min: [1, 'Rating must be at least 1'],
      max: [5, 'Rating cannot exceed 5'],
    },
    comment: {
      type: String,
      required: [true, 'Please provide your review comment'],
      trim: true,
      maxlength: [500, 'Comment cannot exceed 500 characters'],
    },
    location: {
      type: String,
      trim: true,
      default: 'India',
    },
  },
  {
    timestamps: true,
  }
);

export const Review = mongoose.model<IReview>('Review', ReviewSchema);
