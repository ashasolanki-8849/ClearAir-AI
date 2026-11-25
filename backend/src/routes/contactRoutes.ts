import { Router, Request, Response } from 'express';
import { ContactMessage } from '../models/ContactMessage.js';

export const contactRoutes = Router();

// POST /api/contact - Submit a contact message
contactRoutes.post('/', async (req: Request, res: Response) => {
  try {
    const { name, email, message } = req.body;

    if (!name || typeof name !== 'string' || name.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your name.',
      });
    }

    if (!email || typeof email !== 'string' || !/^\S+@\S+\.\S+$/.test(email.trim())) {
      return res.status(400).json({
        success: false,
        message: 'Please enter a valid email address.',
      });
    }

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      return res.status(400).json({
        success: false,
        message: 'Please enter your message.',
      });
    }

    await ContactMessage.create({
      name: name.trim(),
      email: email.trim().toLowerCase(),
      message: message.trim(),
    });

    return res.status(201).json({
      success: true,
      message: 'Thank you! Your message has been sent. We will get back to you shortly.',
    });
  } catch (error: any) {
    console.error('Failed to submit contact message:', error);
    return res.status(500).json({
      success: false,
      message: 'Could not send your message. Please try again later.',
    });
  }
});
