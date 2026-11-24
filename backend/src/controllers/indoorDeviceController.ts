import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { IndoorDevice } from '../models/IndoorDevice.js';
import { IndoorReading } from '../models/IndoorReading.js';
import { IndoorRoom } from '../models/IndoorRoom.js';
import {
  ingestSensorReading,
  createDemoSensorDevice,
} from '../services/sensorIntegrationService.js';

export const getDevices = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const devices = await IndoorDevice.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, devices });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { deviceName, deviceType, deviceIdentifier, roomId, supportedMetrics } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!deviceName || !deviceIdentifier) {
      res.status(400).json({ success: false, message: 'Device name and identifier are required' });
      return;
    }

    let roomName = 'Unassigned Room';
    if (roomId) {
      const room = await IndoorRoom.findOne({ _id: roomId, userId });
      if (room) roomName = room.roomName;
    }

    const device = await IndoorDevice.create({
      userId,
      deviceName: deviceName.trim(),
      deviceType: deviceType || 'physical_sensor',
      deviceIdentifier: deviceIdentifier.trim(),
      roomId: roomId || undefined,
      roomName,
      connectionStatus: 'online',
      supportedMetrics: supportedMetrics || ['pm25', 'pm10', 'temperature', 'humidity', 'co2'],
      isDemo: false,
    });

    res.status(201).json({ success: true, device, message: 'Indoor air device registered successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const device = await IndoorDevice.findOneAndDelete({ _id: id, userId });
    if (!device) {
      res.status(404).json({ success: false, message: 'Device not found' });
      return;
    }

    // Clean up reading logs
    await IndoorReading.deleteMany({ deviceId: id });

    res.status(200).json({ success: true, message: 'Device deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const ingestReading = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: deviceId } = req.params;
    const { pm25, pm10, co2, humidity, temperature, voc, co, isSimulated } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const device = await IndoorDevice.findOne({ _id: deviceId, userId });
    if (!device) {
      res.status(404).json({ success: false, message: 'Device not found' });
      return;
    }

    const result = await ingestSensorReading({
      deviceId,
      userId,
      roomId: device.roomId?.toString(),
      pm25: Number(pm25),
      pm10: Number(pm10),
      co2: co2 != null ? Number(co2) : undefined,
      humidity: Number(humidity),
      temperature: Number(temperature),
      voc: voc != null ? Number(voc) : undefined,
      co: co != null ? Number(co) : undefined,
      isSimulated: !!isSimulated,
    });

    res.status(201).json({
      success: true,
      reading: result.reading,
      triggeredAlerts: result.triggeredAlerts,
      message: 'Telemetry reading ingested successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDeviceReadings = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id: deviceId } = req.params;
    const limit = Number(req.query.limit) || 24;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const readings = await IndoorReading.find({ deviceId, userId })
      .sort({ timestamp: -1 })
      .limit(limit);

    res.status(200).json({ success: true, readings: readings.reverse() });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const enableDemoDevice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { roomId, roomName } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const demo = await createDemoSensorDevice(userId, roomId, roomName || 'Living Room');
    res.status(200).json({
      success: true,
      device: demo,
      message: 'Simulated demo sensor activated. Note: These values are simulated for interface preview.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
