import { apiClient } from './api';
import {
  SavedPlaceData,
  SavedRouteData,
  TravelHistoryData,
  TravelPreferenceData,
  RouteComparisonData,
  RouteAlternativeData,
  DepartureTimeAdviceData,
  EmissionCalculationResult,
  TravelAIAnswerData,
  TravelPriority,
} from '../types';

export interface RouteSearchParams {
  origin: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  destination: {
    name: string;
    address?: string;
    lat: number;
    lon: number;
  };
  preferredMode?: string;
  priority?: TravelPriority;
  userCategory?: string;
}

export interface EmissionCalculationParams {
  distanceKm: number;
  mode: string;
  vehicleType?: string;
  fuelType?: string;
  passengerCount?: number;
}

export const travelService = {
  // 1. Route Search & Comparison
  searchRoutes: async (
    params: RouteSearchParams
  ): Promise<{
    success: boolean;
    comparison: RouteComparisonData;
    routes: RouteAlternativeData[];
    outdoorAqi: number;
    message?: string;
  }> => {
    return apiClient('/travel/search', {
      method: 'POST',
      bodyData: params,
    });
  },

  compareRoutes: async (
    routeIds: string[]
  ): Promise<{
    success: boolean;
    routes: RouteAlternativeData[];
  }> => {
    return apiClient('/travel/compare', {
      method: 'POST',
      bodyData: { routeIds },
    });
  },

  getModeAlternatives: async (
    distanceKm: number,
    outdoorAqi?: number
  ): Promise<{
    success: boolean;
    modes: any[];
  }> => {
    return apiClient(`/travel/alternatives?distanceKm=${distanceKm}&outdoorAqi=${outdoorAqi || 200}`);
  },

  // 2. Saved Places
  getSavedPlaces: async (): Promise<{
    success: boolean;
    places: SavedPlaceData[];
  }> => {
    return apiClient('/travel/places');
  },

  createSavedPlace: async (
    data: Partial<SavedPlaceData>
  ): Promise<{
    success: boolean;
    place: SavedPlaceData;
    message: string;
  }> => {
    return apiClient('/travel/places', {
      method: 'POST',
      bodyData: data,
    });
  },

  updateSavedPlace: async (
    id: string,
    data: Partial<SavedPlaceData>
  ): Promise<{
    success: boolean;
    place: SavedPlaceData;
    message: string;
  }> => {
    return apiClient(`/travel/places/${id}`, {
      method: 'PUT',
      bodyData: data,
    });
  },

  deleteSavedPlace: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient(`/travel/places/${id}`, {
      method: 'DELETE',
    });
  },

  // 3. Saved Routes
  getSavedRoutes: async (): Promise<{
    success: boolean;
    routes: SavedRouteData[];
  }> => {
    return apiClient('/travel/routes');
  },

  createSavedRoute: async (
    data: Partial<SavedRouteData>
  ): Promise<{
    success: boolean;
    route: SavedRouteData;
    message: string;
  }> => {
    return apiClient('/travel/routes', {
      method: 'POST',
      bodyData: data,
    });
  },

  deleteSavedRoute: async (
    id: string
  ): Promise<{
    success: boolean;
    message: string;
  }> => {
    return apiClient(`/travel/routes/${id}`, {
      method: 'DELETE',
    });
  },

  // 4. Departure Time Advisor
  getDepartureTimeAdvice: async (data: {
    currentAqi?: number;
    origin?: { lat: number; lon: number };
  }): Promise<{
    success: boolean;
    data: DepartureTimeAdviceData;
  }> => {
    return apiClient('/travel/departure-times', {
      method: 'POST',
      bodyData: data,
    });
  },

  // 5. Emissions Calculator
  calculateEmissions: async (
    params: EmissionCalculationParams
  ): Promise<{
    success: boolean;
    calculation: EmissionCalculationResult;
  }> => {
    return apiClient('/travel/emissions/calculate', {
      method: 'POST',
      bodyData: params,
    });
  },

  // 6. Travel History & Trips
  getTravelHistory: async (
    limit: number = 20
  ): Promise<{
    success: boolean;
    trips: TravelHistoryData[];
    summary: {
      totalTrips: number;
      totalDistanceKm: number;
      totalEmissionsAvoidedGramsCo2: number;
      totalEmissionsGramsCo2: number;
    };
  }> => {
    return apiClient(`/travel/history?limit=${limit}`);
  },

  recordTrip: async (
    tripData: Partial<TravelHistoryData>
  ): Promise<{
    success: boolean;
    trip: TravelHistoryData;
    message: string;
  }> => {
    return apiClient('/travel/history', {
      method: 'POST',
      bodyData: tripData,
    });
  },

  // 7. Travel Preferences
  getTravelPreferences: async (): Promise<{
    success: boolean;
    preferences: TravelPreferenceData;
  }> => {
    return apiClient('/travel/preferences');
  },

  updateTravelPreferences: async (
    preferences: Partial<TravelPreferenceData>
  ): Promise<{
    success: boolean;
    preferences: TravelPreferenceData;
    message: string;
  }> => {
    return apiClient('/travel/preferences', {
      method: 'PUT',
      bodyData: preferences,
    });
  },

  // 8. GenAI Smart Travel Co-Pilot
  askTravelAdvisor: async (data: {
    question: string;
    outdoorAqi: number;
    originName?: string;
    destinationName?: string;
    distanceKm?: number;
    userCategory?: string;
    currentMode?: string;
  }): Promise<{
    success: boolean;
    answer: TravelAIAnswerData;
    source: string;
  }> => {
    return apiClient('/travel/ask-advisor', {
      method: 'POST',
      bodyData: data,
    });
  },
};
