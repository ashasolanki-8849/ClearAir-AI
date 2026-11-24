import mongoose from 'mongoose';
import { IndoorDevice, IIndoorDevice, IDeviceLatestReadings } from '../models/IndoorDevice.js';
import { IndoorReading, IIndoorReading } from '../models/IndoorReading.js';
import { IndoorAlert, IIndoorAlert } from '../models/IndoorAlert.js';

export interface IngestReadingInput {
  deviceId: string;
  userId: string;
  roomId?: string;
  pm25: number;
  pm10: number;
  co2?: number;
  humidity: number;
  temperature: number;
  voc?: number;
  co?: number;
  isSimulated?: boolean;
}

export const ingestSensorReading = async (
  input: IngestReadingInput
): Promise<{ reading: IIndoorReading; triggeredAlerts: IIndoorAlert[] }> => {
  const {
    deviceId,
    userId,
    roomId,
    pm25,
    pm10,
    co2 = 500,
    humidity,
    temperature,
    voc,
    co,
    isSimulated = false,
  } = input;

  const reading = await IndoorReading.create({
    deviceId: new mongoose.Types.ObjectId(deviceId),
    userId: new mongoose.Types.ObjectId(userId),
    roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
    pm25,
    pm10,
    co2,
    humidity,
    temperature,
    voc,
    co,
    isSimulated,
    timestamp: new Date(),
  });

  // Update device's latestReadings snapshot
  await IndoorDevice.findByIdAndUpdate(deviceId, {
    latestReadings: {
      pm25,
      pm10,
      co2,
      humidity,
      temperature,
      voc,
      co,
      timestamp: new Date(),
    },
    connectionStatus: isSimulated ? 'simulated' : 'online',
  });

  // Evaluate alerts
  const triggeredAlerts: IIndoorAlert[] = [];

  // 1. Indoor PM2.5 Spike
  if (pm25 >= 120) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'pm25_spike',
      severity: 'alert',
      message: `Severe indoor PM2.5 spike detected: ${pm25} µg/m³.`,
      explanation: 'Indoor particulate levels exceed safe respiratory thresholds. Possible active cooking, incense smolder, or severe outdoor infiltration.',
      recommendedAction: 'Check for indoor burning sources. Turn your HEPA air purifier to Turbo speed and ensure windows are tightly latched.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  } else if (pm25 >= 60) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'pm25_spike',
      severity: 'warning',
      message: `Elevated indoor PM2.5 level: ${pm25} µg/m³.`,
      explanation: 'Air quality is sub-optimal for sensitive individuals, infants, and seniors.',
      recommendedAction: 'Switch air purifier to medium or high mode and damp-mop room surfaces.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  }

  // 2. High Carbon Dioxide (Stuffiness & Inadequate Air Exchange)
  if (co2 >= 1800) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'co2_stuffiness',
      severity: 'alert',
      message: `Critical CO2 accumulation: ${co2} ppm.`,
      explanation: 'Stagnant indoor air is saturated with exhaled breath. Causes drowsiness, headaches, and significant cognitive drop.',
      recommendedAction: 'Perform a 5–8 minute rapid cross-ventilation pulse immediately to refresh room oxygen.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  } else if (co2 >= 1200) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'co2_stuffiness',
      severity: 'warning',
      message: `Elevated CO2 detected: ${co2} ppm.`,
      explanation: 'Room is becoming stuffy due to human occupancy and sealed doors.',
      recommendedAction: 'Crack the bedroom door slightly open or schedule a short midday window pulse.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  }

  // 3. Moisture / Humidity Extremes
  if (humidity >= 72) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'high_humidity',
      severity: 'warning',
      message: `Excessive indoor humidity: ${humidity}%.`,
      explanation: 'Persistent relative humidity above 70% accelerates fungal spore proliferation, black mold growth, and dust mite colonies.',
      recommendedAction: 'Inspect walls for plumbing seepage, use bathroom exhaust fans post-shower, or run an air conditioner in dehumidify mode.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  }

  // 4. Carbon Monoxide Emergency (ONLY if dedicated sensor reported CO > 0)
  if (co && co >= 35) {
    const alert = await IndoorAlert.create({
      userId: new mongoose.Types.ObjectId(userId),
      roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
      deviceId: new mongoose.Types.ObjectId(deviceId),
      alertCategory: 'co_warning',
      severity: 'emergency',
      message: `EMERGENCY: High Carbon Monoxide (CO) concentration: ${co} ppm!`,
      explanation: 'Potentially lethal odorless gas detected from combustion appliances or unvented heating.',
      recommendedAction: 'EVACUATE ROOM IMMEDIATELY to fresh air. Turn off gas cylinders and fuel heaters. Call emergency services if anyone experiences dizziness, nausea, or confusion.',
      dataSource: isSimulated ? 'estimated_assessment' : 'connected_sensor',
    });
    triggeredAlerts.push(alert);
  }

  return { reading, triggeredAlerts };
};

export const createDemoSensorDevice = async (
  userId: string,
  roomId?: string,
  roomName: string = 'Living Room'
): Promise<IIndoorDevice> => {
  const existingDemo = await IndoorDevice.findOne({
    userId,
    isDemo: true,
  });

  if (existingDemo) {
    // Generate fresh demo reading
    await ingestSensorReading({
      deviceId: existingDemo._id.toString(),
      userId,
      roomId: roomId || existingDemo.roomId?.toString(),
      pm25: 38,
      pm10: 64,
      co2: 780,
      humidity: 52,
      temperature: 22.5,
      voc: 180,
      isSimulated: true,
    });
    return existingDemo;
  }

  const demoDevice = await IndoorDevice.create({
    userId: new mongoose.Types.ObjectId(userId),
    deviceName: 'ClearAir Indoor Sense (Demo Simulator)',
    deviceType: 'demo_sensor',
    deviceIdentifier: `DEMO-IAQ-${Date.now().toString(36).toUpperCase()}`,
    roomId: roomId ? new mongoose.Types.ObjectId(roomId) : undefined,
    roomName,
    connectionStatus: 'simulated',
    supportedMetrics: ['pm25', 'pm10', 'co2', 'humidity', 'temperature', 'voc'],
    latestReadings: {
      pm25: 38,
      pm10: 64,
      co2: 780,
      humidity: 52,
      temperature: 22.5,
      voc: 180,
      timestamp: new Date(),
    },
    isDemo: true,
    filterLifePercentage: 88,
  });

  return demoDevice;
};
