import { Router } from 'express';
import { search, saveLocation, getSavedLocations, deleteSavedLocation } from '../controllers/locationController.js';
import { authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.get('/search', search);
router.post('/save', authenticateToken, saveLocation);
router.get('/saved', authenticateToken, getSavedLocations);
router.delete('/:id', authenticateToken, deleteSavedLocation);

export default router;
