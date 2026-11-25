import { Router, Request, Response } from 'express';
import { Review } from '../models/Review.js';

export const reviewRoutes = Router();

// GET /api/reviews - Get latest genuine user reviews
reviewRoutes.get('/', async (_req: Request, res: Response) => {
  try {
    const reviews = await Review.find().sort({ createdAt: -1 }).limit(30).lean();
    return res.status(200).json({
      success: true,
      reviews,
    });
  } catch (error: any) {
    console.error('Failed to fetch reviews:', error);
    return res.status(500).json({
      success: false,
      message: 'Failed to retrieve reviews. Please try again.',
    });
  }
});

// POST /api/reviews - Submit a new rating and review
reviewRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, rating, comment, location } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide your name.',
      });
    }

    const numRating = Number(rating);
    if (isNaN(numRating) || numRating < 1 || numRating > 5) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a valid rating between 1 and 5.',
      });
    }

    if (!comment || typeof comment !== 'string' || comment.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please provide a short review comment.',
      });
    }

    const newReview = await Review.create({
      name: name.trim(),
      rating: Math.round(numRating),
      comment: comment.trim(),
      location: location && typeof location === 'string' ? location.trim() : 'India',
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your review has been submitted.',
      review: newReview,
    });
  } catch (error: any) {
    console.error('Failed to submit review:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not submit your review. Please try again.',
    });
  }
});
