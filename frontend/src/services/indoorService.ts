import { apiClient } from './api';
import {
  IndoorRoomData,
  IndoorAssessmentData,
  QuestionnaireResponsesData,
  IndoorDeviceData,
  IndoorReadingData,
  IndoorAlertData,
  VentilationAdviceData,
  PurifierGuidanceData,
  IndoorAIAnswerData,
  AQIData,
} from '../types';

export const indoorService = {
  // Rooms
  getRooms: async (): Promise<{ success: boolean; rooms: IndoorRoomData[] }> => {
    return apiClient('/indoor/rooms');
  },

  createRoom: async (
    roomData: Partial<IndoorRoomData>
  ): Promise<{ success: boolean; room: IndoorRoomData; message: string }> => {
    return apiClient('/indoor/rooms', {
      method: 'POST',
      bodyData: roomData,
    });
  },

  updateRoom: async (
    id: string,
    roomData: Partial<IndoorRoomData>
  ): Promise<{ success: boolean; room: IndoorRoomData; message: string }> => {
    return apiClient(`/indoor/rooms/${id}`, {
      method: 'PUT',
      bodyData: roomData,
    });
  },

  deleteRoom: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/indoor/rooms/${id}`, {
      method: 'DELETE',
    });
  },

  // Assessments
  createAssessment: async (data: {
    roomId?: string;
    responses: QuestionnaireResponsesData;
    language?: string;
    location?: { lat: number; lon: number; name: string };
  }): Promise<{
    success: boolean;
    assessment: IndoorAssessmentData;
    outdoorAqi: number;
    message: string;
  }> => {
    return apiClient('/indoor/assessment', {
      method: 'POST',
      bodyData: data,
    });
  },

  getRoomAssessment: async (
    roomId: string
  ): Promise<{ success: boolean; assessment: IndoorAssessmentData | null }> => {
    return apiClient(`/indoor/assessment/${roomId}`);
  },

  // Specialized Advisors
  getVentilationAdvice: async (data: {
    location?: { lat: number; lon: number; name: string };
    roomId?: string;
    isCookingActive?: boolean;
    language?: string;
  }): Promise<{
    success: boolean;
    advice: VentilationAdviceData;
    aqiData: AQIData;
  }> => {
    return apiClient('/indoor/ventilation-advice', {
      method: 'POST',
      bodyData: data,
    });
  },

  getPurifierAdvice: async (data: {
    length: number;
    width: number;
    height: number;
    unit?: 'meters' | 'feet';
    budget?: 'low_cost' | 'mid_range' | 'premium';
    primaryConcern?: string;
    language?: string;
  }): Promise<{ success: boolean; advice: PurifierGuidanceData }> => {
    return apiClient('/indoor/purifier-advice', {
      method: 'POST',
      bodyData: data,
    });
  },

  askIndoorAdvisor: async (data: {
    question: string;
    location?: { lat: number; lon: number; name: string };
    roomId?: string;
    budget?: string;
    language?: string;
  }): Promise<{
    success: boolean;
    answer: IndoorAIAnswerData;
    aqiData: AQIData;
  }> => {
    return apiClient('/indoor/ask-advisor', {
      method: 'POST',
      bodyData: data,
    });
  },

  // Devices
  getDevices: async (): Promise<{ success: boolean; devices: IndoorDeviceData[] }> => {
    return apiClient('/indoor/devices');
  },

  createDevice: async (deviceData: {
    deviceName: string;
    deviceType?: string;
    deviceIdentifier: string;
    roomId?: string;
    supportedMetrics?: string[];
  }): Promise<{ success: boolean; device: IndoorDeviceData; message: string }> => {
    return apiClient('/indoor/devices', {
      method: 'POST',
      bodyData: deviceData,
    });
  },

  deleteDevice: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/indoor/devices/${id}`, {
      method: 'DELETE',
    });
  },

  getDeviceReadings: async (
    id: string,
    limit: number = 24
  ): Promise<{ success: boolean; readings: IndoorReadingData[] }> => {
    return apiClient(`/indoor/devices/${id}/readings?limit=${limit}`);
  },

  enableDemoDevice: async (data?: {
    roomId?: string;
    roomName?: string;
  }): Promise<{ success: boolean; device: IndoorDeviceData; message: string }> => {
    return apiClient('/indoor/devices/demo', {
      method: 'POST',
      bodyData: data || {},
    });
  },

  // Alerts
  getAlerts: async (): Promise<{ success: boolean; alerts: IndoorAlertData[] }> => {
    return apiClient('/indoor/alerts');
  },

  markAlertRead: async (
    id: string
  ): Promise<{ success: boolean; alert: IndoorAlertData }> => {
    return apiClient(`/indoor/alerts/${id}/read`, {
      method: 'PATCH',
    });
  },
};
