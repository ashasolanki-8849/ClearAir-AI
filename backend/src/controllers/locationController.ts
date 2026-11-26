import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { searchLocations, reverseGeocode } from '../services/geocodingService.js';
import { Location } from '../models/Location.js';

export const reverse = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const lat = parseFloat(req.query.lat as string);
    const lon = parseFloat(req.query.lon as string);

    if (isNaN(lat) || isNaN(lon)) {
      res.status(400).json({ success: false, message: 'Valid latitude and longitude are required.' });
      return;
    }

    const result = await reverseGeocode(lat, lon);
    res.status(200).json({
      success: true,
      location: result,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const search = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const query = (req.query.q as string) || '';
    const results = await searchLocations(query);

    res.status(200).json({
      success: true,
      count: results.length,
      locations: results,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const saveLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { name, city, country, lat, lon, isDefault } = req.body;

    if (!name || lat == null || lon == null) {
      res.status(400).json({ success: false, message: 'Location name, latitude and longitude are required.' });
      return;
    }

    // Check if location already saved
    const existing = await Location.findOne({
      userId: req.user.id,
      name,
    });

    if (existing) {
      existing.lat = lat;
      existing.lon = lon;
      if (city) existing.city = city;
      if (isDefault) existing.isDefault = isDefault;
      await existing.save();

      res.status(200).json({
        success: true,
        message: 'Location updated in saved list.',
        location: existing,
      });
      return;
    }

    // If default, unset previous default
    if (isDefault) {
      await Location.updateMany({ userId: req.user.id }, { isDefault: false });
    }

    const saved = await Location.create({
      userId: req.user.id,
      name: name.trim(),
      city: (city || name).trim(),
      country: (country || '').trim(),
      lat: Number(lat),
      lon: Number(lon),
      isDefault: Boolean(isDefault),
    });

    res.status(201).json({
      success: true,
      message: 'Location saved successfully.',
      location: saved,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getSavedLocations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const locations = await Location.find({ userId: req.user.id }).sort({ isDefault: -1, createdAt: -1 });

    res.status(200).json({
      success: true,
      locations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSavedLocation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    if (!req.user) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const { id } = req.params;
    await Location.findOneAndDelete({ _id: id, userId: req.user.id });

    res.status(200).json({
      success: true,
      message: 'Saved location deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
