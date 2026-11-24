import { Router } from 'express';
import { authenticateToken } from '../middleware/authMiddleware.js';
import {
  getDevices,
  createDevice,
  deleteDevice,
  ingestReading,
  getDeviceReadings,
  enableDemoDevice,
} from '../controllers/indoorDeviceController.js';

const router = Router();

router.use(authenticateToken);

router.get('/', getDevices);
router.post('/', createDevice);
router.delete('/:id', deleteDevice);
router.post('/:id/readings', ingestReading);
router.get('/:id/readings', getDeviceReadings);
router.post('/demo', enableDemoDevice);

export default router;
