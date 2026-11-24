import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { IndoorRoom } from '../models/IndoorRoom.js';
import { IndoorAssessment } from '../models/IndoorAssessment.js';
import { IndoorAlert } from '../models/IndoorAlert.js';
import { IndoorDevice } from '../models/IndoorDevice.js';
import { analyzeIndoorEnvironment } from '../services/indoorAssessmentService.js';
import { evaluateVentilationStrategy } from '../services/ventilationAdvisorService.js';
import { calculatePurifierRequirements } from '../services/purifierRecommendationService.js';
import { answerIndoorAIQuery } from '../services/indoorAIService.js';
import { fetchRealtimeAQI } from '../services/aqiService.js';

// ==========================================
// 1. ROOM MANAGEMENT (CRUD)
// ==========================================

export const getRooms = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let rooms = await IndoorRoom.find({ userId }).sort({ createdAt: 1 });

    // If new user has no rooms, seed standard Living Room and Bedroom defaults
    if (rooms.length === 0) {
      rooms = await IndoorRoom.create([
        {
          userId,
          roomName: 'Master Bedroom',
          roomType: 'bedroom',
          dimensions: { length: 4, width: 3.5, height: 2.8, unit: 'meters' },
          ventilation: {
            windowCount: 1,
            hasExhaustFan: false,
            hasAirPurifier: false,
            hasAC: true,
            ventilationType: 'natural',
          },
          occupancyCount: 2,
        },
        {
          userId,
          roomName: 'Main Living Area',
          roomType: 'living_room',
          dimensions: { length: 5.5, width: 4.2, height: 3.0, unit: 'meters' },
          ventilation: {
            windowCount: 2,
            hasExhaustFan: false,
            hasAirPurifier: false,
            hasAC: false,
            ventilationType: 'natural',
          },
          occupancyCount: 3,
        },
      ]);
    }

    res.status(200).json({ success: true, rooms });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { roomName, roomType, dimensions, ventilation, occupancyCount, hasSmokingExposure, hasPets, hasIncenseCandles } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!roomName || !roomName.trim()) {
      res.status(400).json({ success: false, message: 'Room name is required' });
      return;
    }

    const room = await IndoorRoom.create({
      userId,
      roomName: roomName.trim(),
      roomType: roomType || 'living_room',
      dimensions: dimensions || { length: 4, width: 3.5, height: 3, unit: 'meters' },
      ventilation: ventilation || {
        windowCount: 1,
        hasExhaustFan: false,
        hasAirPurifier: false,
        hasAC: false,
        ventilationType: 'natural',
      },
      occupancyCount: occupancyCount || 2,
      hasSmokingExposure: !!hasSmokingExposure,
      hasPets: !!hasPets,
      hasIncenseCandles: !!hasIncenseCandles,
    });

    res.status(201).json({ success: true, room, message: 'Indoor room profile created successfully.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const room = await IndoorRoom.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    res.status(200).json({ success: true, room, message: 'Room updated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteRoom = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const room = await IndoorRoom.findOneAndDelete({ _id: id, userId });
    if (!room) {
      res.status(404).json({ success: false, message: 'Room not found' });
      return;
    }

    // Clean up associated assessments
    await IndoorAssessment.deleteMany({ roomId: id, userId });

    res.status(200).json({ success: true, message: 'Room deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. ROOM-WISE INDOOR AIR ASSESSMENT
// ==========================================

export const createAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { roomId, responses, language = 'en', location } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!responses) {
      res.status(400).json({ success: false, message: 'Questionnaire responses are required' });
      return;
    }

    let room = null;
    if (roomId) {
      room = await IndoorRoom.findOne({ _id: roomId, userId });
    }

    // Fetch live ambient AQI for infiltration baseline
    const lat = location?.lat || 28.6139;
    const lon = location?.lon || 77.2090;
    const aqiData = await fetchRealtimeAQI(lat, lon, location?.name || 'New Delhi');
    const outdoorAqi = aqiData.aqi;

    const analysis = analyzeIndoorEnvironment(responses, outdoorAqi, language);

    const assessment = await IndoorAssessment.create({
      userId,
      roomId: room?._id,
      roomName: room?.roomName || responses.roomType?.replace('_', ' ') || 'Living Space',
      roomType: room?.roomType || responses.roomType || 'living_room',
      questionnaireResponses: responses,
      identifiedPollutionSources: analysis.identifiedSources,
      overallRiskLevel: analysis.overallRiskLevel,
      assessmentSummary: analysis.summary,
      recommendations: analysis.recommendations,
      isQuestionnaireBased: true,
      outdoorAqiAtAssessment: outdoorAqi,
    });

    res.status(201).json({
      success: true,
      assessment,
      outdoorAqi,
      message: 'Indoor room vulnerability assessment generated.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getRoomAssessment = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { roomId } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const assessment = await IndoorAssessment.findOne({ roomId, userId }).sort({ createdAt: -1 });

    res.status(200).json({ success: true, assessment });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. RECOMMENDATIONS & SPECIALIZED ADVISORS
// ==========================================

export const getVentilationAdvice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { location, roomId, isCookingActive, language = 'en' } = req.body;
    const userId = req.user?.id;

    const lat = location?.lat || 28.6139;
    const lon = location?.lon || 77.2090;
    const aqiData = await fetchRealtimeAQI(lat, lon, location?.name || 'Monitored City');

    let room = null;
    let indoorReadings = null;

    if (roomId && userId) {
      room = await IndoorRoom.findOne({ _id: roomId, userId });
      const device = await IndoorDevice.findOne({ roomId, userId });
      if (device?.latestReadings) {
        indoorReadings = device.latestReadings;
      }
    }

    const advice = evaluateVentilationStrategy({
      outdoorAqiData: aqiData,
      roomType: room?.roomType || 'living_room',
      roomVentilation: room?.ventilation,
      indoorReadings,
      isCookingActive: !!isCookingActive,
      occupancyCount: room?.occupancyCount || 2,
      language,
    });

    res.status(200).json({ success: true, advice, aqiData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getPurifierAdvice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { length, width, height, unit, budget, primaryConcern, language = 'en' } = req.body;

    const advice = calculatePurifierRequirements({
      length: Number(length) || 4,
      width: Number(width) || 3.5,
      height: Number(height) || 2.8,
      unit: unit || 'meters',
      budget: budget || 'mid_range',
      primaryConcern: primaryConcern || 'smog_pm25',
      language,
    });

    res.status(200).json({ success: true, advice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const askIndoorAdvisor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { question, location, roomId, budget, language = 'en' } = req.body;
    const userId = req.user?.id;

    if (!question || !question.trim()) {
      res.status(400).json({ success: false, message: 'Question prompt is required' });
      return;
    }

    const lat = location?.lat || 28.6139;
    const lon = location?.lon || 77.2090;
    const aqiData = await fetchRealtimeAQI(lat, lon, location?.name || 'New Delhi');

    let room = null;
    let indoorReadings = null;
    let latestAssessment = null;

    if (userId) {
      if (roomId) {
        room = await IndoorRoom.findOne({ _id: roomId, userId });
        const device = await IndoorDevice.findOne({ roomId, userId });
        if (device?.latestReadings) indoorReadings = device.latestReadings;
        latestAssessment = await IndoorAssessment.findOne({ roomId, userId }).sort({ createdAt: -1 });
      } else {
        const device = await IndoorDevice.findOne({ userId });
        if (device?.latestReadings) indoorReadings = device.latestReadings;
      }
    }

    const answer = await answerIndoorAIQuery({
      userQuestion: question.trim(),
      outdoorAqiData: aqiData,
      roomType: room?.roomType || 'general_indoor_space',
      roomDimensions: room?.dimensions || { length: 4, width: 3.5, height: 3, unit: 'meters' },
      questionnaireResponses: latestAssessment?.questionnaireResponses || null,
      indoorReadings,
      budget: budget || 'mid_range',
      language,
    });

    res.status(200).json({ success: true, answer, aqiData });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. SMART INDOOR ALERTS
// ==========================================

export const getIndoorAlerts = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let alerts = await IndoorAlert.find({ userId }).sort({ createdAt: -1 }).limit(20);

    // If user has zero alerts, generate a helpful initial guidance alert
    if (alerts.length === 0) {
      const defaultAlert = await IndoorAlert.create({
        userId,
        roomName: 'General Indoors',
        alertCategory: 'general_advisory',
        severity: 'info',
        message: 'Indoor Air Quality Guide Initialized',
        explanation: 'Your rooms have not detected physical sensor hardware yet. Guidance is being generated using room assessments and ambient CPCB telemetry.',
        recommendedAction: 'Complete the Room Assessment questionnaire or connect a compatible indoor sensor.',
        dataSource: 'estimated_assessment',
      });
      alerts = [defaultAlert];
    }

    res.status(200).json({ success: true, alerts });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const markAlertAsRead = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const alert = await IndoorAlert.findOneAndUpdate(
      { _id: id, userId },
      { $set: { read: true } },
      { new: true }
    );

    if (!alert) {
      res.status(404).json({ success: false, message: 'Alert not found' });
      return;
    }

    res.status(200).json({ success: true, alert });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
