import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { SavedPlace } from '../models/SavedPlace.js';
import { SavedRoute } from '../models/SavedRoute.js';
import { TravelHistory } from '../models/TravelHistory.js';
import { TravelPreference, TravelPriority } from '../models/TravelPreference.js';
import { RouteComparison } from '../models/RouteComparison.js';
import { generateRouteAlternatives } from '../services/routeService.js';
import { calculateTravelEmissions, EMISSION_FACTORS } from '../services/travelEmissionService.js';
import { evaluateTravelExposure } from '../services/travelExposureService.js';
import { evaluateDepartureTimeWindows } from '../services/travelTimeAdvisorService.js';
import { analyzeAndRankRoutes } from '../services/travelRecommendationService.js';
import { fetchRealtimeAQI } from '../services/aqiService.js';
import axios from 'axios';

// ==========================================
// 1. ROUTE SEARCH & COMPARISON
// ==========================================

export const searchRoutes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { origin, destination, preferredMode, priority = 'balanced', userCategory } = req.body;

    if (!origin || !destination || origin.lat == null || destination.lat == null) {
      res.status(400).json({ success: false, message: 'Origin and destination coordinates are required' });
      return;
    }

    // Fetch live ambient AQI for origin/city
    const aqiData = await fetchRealtimeAQI(origin.lat, origin.lon, origin.name || 'Current City');
    const outdoorAqi = aqiData.aqi;
    const pm25 = aqiData.pollutants.pm25;

    // Generate 3 real route alternatives (OSRM highway, bypass, metro corridor)
    const routes = await generateRouteAlternatives({
      origin,
      destination,
      preferredMode,
      outdoorAqi,
      pm25,
      priority,
    });

    // Rank routes by user priority
    const ranking = analyzeAndRankRoutes(routes, priority as TravelPriority, userCategory || 'professional', outdoorAqi);

    // Save comparison to database
    let savedComparison = null;
    try {
      savedComparison = await RouteComparison.create({
        userId: userId || undefined,
        origin,
        destination,
        routes: ranking.routes,
        environmentalContext: {
          cityAqi: outdoorAqi,
          aqiCategory: aqiData.aqiCategory,
          pm25,
          temperature: aqiData.weather.temperature,
          isRouteSensorAvailable: false,
        },
        recommendedRouteId: ranking.recommendedRoute.routeId,
        recommendationReason: ranking.recommendationReason,
      });
    } catch (saveErr) {
      // Non-fatal if DB save fails for anonymous queries
    }

    // Format routes with rich visual metadata for UI and tests
    const formattedRoutes = ranking.routes.map((r: any) => {
      const isRecommended = r.routeId === ranking.recommendedRoute.routeId;
      const routeType =
        r.routeTag === 'fastest'
          ? 'arterial_fastest'
          : r.routeTag === 'cleanest_corridor'
          ? 'clean_bypass'
          : 'metro_transit';

      const streetAqi = Math.round(
        outdoorAqi * (routeType === 'clean_bypass' ? 0.72 : routeType === 'metro_transit' ? 0.45 : 1.25)
      );

      const speedScore = Math.max(30, Math.min(100, Math.round(100 - (r.durationMinutes - 20) * 1.5)));
      const cleanAirScore = Math.max(25, Math.min(100, Math.round(100 - (streetAqi / 400) * 80)));
      const emissionScore = Math.max(20, Math.min(100, Math.round(100 - (r.estimatedEmissionsGrams / 3000) * 80)));
      const overallScore = Math.round((speedScore * 0.35) + (cleanAirScore * 0.35) + (emissionScore * 0.3));

      const baselineCarEmissions = Math.round(r.distanceKm * 145);
      const avoidedEmissions = Math.max(0, baselineCarEmissions - r.estimatedEmissionsGrams);

      const exposureRiskLevel =
        r.exposureLevel === 'low'
          ? 'Low'
          : r.exposureLevel === 'moderate'
          ? 'Moderate'
          : r.exposureLevel === 'high'
          ? 'High'
          : 'Severe';

      return {
        ...r,
        routeType,
        routeTag: r.routeTag,
        geometry: r.geometryCoordinates || [],
        geometryCoordinates: r.geometryCoordinates || [],
        streetAqiEstimated: streetAqi,
        overallScore,
        scoreBreakdown: {
          speedScore,
          cleanAirScore,
          emissionScore,
          costScore: 85,
        },
        emissions: {
          totalGramsCo2: r.estimatedEmissionsGrams,
          gramsCo2PerPassenger: r.estimatedEmissionsGrams,
          avoidedGramsCo2: avoidedEmissions,
          carEquivalenceFactor: 145,
          isZeroEmission: r.estimatedEmissionsGrams === 0,
          methodology: 'IPCC & Central Pollution Control Board (CPCB) road transport factors',
        },
        exposure: {
          exposureScore: Math.round(streetAqi / 5),
          riskLevel: exposureRiskLevel,
          doseIndex: Math.round(streetAqi * (r.durationMinutes / 60)),
          modeMultiplier: routeType === 'clean_bypass' ? 0.65 : routeType === 'metro_transit' ? 0.35 : 1.2,
          openAirExposure: routeType === 'arterial_fastest' && r.mode === 'two_wheeler',
          cabinRecirculationRecommended: true,
          maskRecommendation: streetAqi > 200 ? 'N95 / FFP2 respirator recommended' : 'Standard surgical mask',
          vulnerableGroupWarning: streetAqi > 250 ? 'Severe particulate density: asthmatics and elderly should avoid open-air transit' : undefined,
        },
        isRecommended,
        recommendationReason: isRecommended ? ranking.recommendationReason : `Viable alternative: ${r.routeName}`,
        healthSafetyDisclaimer: 'Estimated exposure based on CPCB ambient stations calibrated with road congestion proximity models.',
      };
    });

    res.status(200).json({
      success: true,
      routes: formattedRoutes,
      recommendedRoute: formattedRoutes.find((r) => r.isRecommended) || formattedRoutes[0],
      recommendationReason: ranking.recommendationReason,
      rankedRouteIds: ranking.rankedRouteIds,
      userPriorityApplied: ranking.userPriorityApplied,
      personaConsideration: ranking.personaConsideration,
      dataNotice: ranking.dataNotice,
      environmentalContext: {
        cityAqi: outdoorAqi,
        aqiCategory: aqiData.aqiCategory,
        pm25,
        temperature: aqiData.weather.temperature,
      },
      comparisonId: savedComparison?._id,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const compareRoutes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { routes, priority = 'balanced', userCategory, outdoorAqi = 150 } = req.body;

    if (!routes || !Array.isArray(routes) || routes.length === 0) {
      res.status(400).json({ success: false, message: 'Routes array is required for comparison' });
      return;
    }

    const ranking = analyzeAndRankRoutes(routes, priority as TravelPriority, userCategory || 'professional', outdoorAqi);

    res.status(200).json({
      success: true,
      routes: ranking.routes,
      recommendedRoute: ranking.recommendedRoute,
      recommendationReason: ranking.recommendationReason,
      rankedRouteIds: ranking.rankedRouteIds,
      userPriorityApplied: ranking.userPriorityApplied,
      personaConsideration: ranking.personaConsideration,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getModeAlternatives = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const distanceKm = Number(req.query.distanceKm) || 12;
    const outdoorAqi = Number(req.query.outdoorAqi) || Number(req.query.aqi) || 150;

    const modes = [
      { id: 'walking', name: 'Walking', avgSpeedKmh: 4.5, fuel: 'none', isExposed: true },
      { id: 'cycling', name: 'Cycling', avgSpeedKmh: 14, fuel: 'none', isExposed: true },
      { id: 'metro', name: 'Metro Rail', avgSpeedKmh: 35, fuel: 'electric', isExposed: false },
      { id: 'bus', name: 'City Bus', avgSpeedKmh: 20, fuel: 'cng', isExposed: false },
      { id: 'carpool', name: 'Carpool (Shared)', avgSpeedKmh: 30, fuel: 'petrol', isExposed: false },
      { id: 'electric_vehicle', name: 'Electric Car (EV)', avgSpeedKmh: 32, fuel: 'electric', isExposed: false },
      { id: 'two_wheeler', name: 'Two-Wheeler (Scooter)', avgSpeedKmh: 28, fuel: 'petrol', isExposed: true },
      { id: 'private_car', name: 'Private Petrol Car', avgSpeedKmh: 30, fuel: 'petrol', isExposed: false },
    ];

    const results = modes.map((m) => {
      const durationMins = Math.round((distanceKm / m.avgSpeedKmh) * 60);
      const emissions = calculateTravelEmissions({ distanceKm, mode: m.id, passengerCount: m.id === 'carpool' ? 3 : 1 });
      const exposure = evaluateTravelExposure({ outdoorAqi, pm25: 65, mode: m.id, durationMinutes: durationMins });

      return {
        mode: m.id,
        modeId: m.id,
        modeName: m.name,
        estimatedDurationMins: durationMins,
        distanceKm,
        emissionsGrams: emissions.perPassengerEmissionsGrams,
        gramsCo2PerPassenger: emissions.perPassengerEmissionsGrams,
        avoidedEmissionsGrams: emissions.avoidedEmissionsGrams,
        exposureLevel: exposure.exposureLevel,
        exposureMultiplier: m.id === 'cycling' ? 1.5 : m.id === 'walking' ? 1.25 : m.id === 'two_wheeler' ? 1.35 : m.id === 'metro' ? 0.35 : 0.45,
        cabinAirFiltration: !m.isExposed,
        smogHazardWarning: outdoorAqi > 250 && m.isExposed ? 'Unfiltered breathing at high AQI causes deep lung deposition' : undefined,
        cabinRecirculationAdvice: !m.isExposed ? 'Turn on internal recirculation button' : undefined,
        maskRecommendation: exposure.maskRecommendation,
        isSuitableUnderAqi: outdoorAqi > 250 && m.isExposed ? false : true,
      };
    });

    res.status(200).json({ success: true, distanceKm, outdoorAqi, modeComparisons: results, modes: results });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 2. SAVED PLACES (CRUD)
// ==========================================

export const getSavedPlaces = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let places = await SavedPlace.find({ userId }).sort({ createdAt: 1 });

    // Seed helpful defaults (Home and Office) if empty
    if (places.length === 0) {
      places = await SavedPlace.create([
        {
          userId,
          placeName: 'Home',
          address: 'Connaught Place, New Delhi',
          coordinates: { lat: 28.6315, lon: 77.2167 },
          placeCategory: 'home',
          isDefaultOrigin: true,
        },
        {
          userId,
          placeName: 'Workplace / Office',
          address: 'Cyber City, Gurugram',
          coordinates: { lat: 28.4950, lon: 77.0895 },
          placeCategory: 'office',
          isDefaultOrigin: false,
        },
      ]);
    }

    res.status(200).json({ success: true, places });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSavedPlace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { placeName, address, coordinates, placeCategory, isDefaultOrigin, customName, label } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const resolvedName = placeName || customName || label || 'Saved Location';
    const resolvedCategory = placeCategory || label || 'other';

    if (!coordinates || coordinates.lat == null || coordinates.lon == null) {
      res.status(400).json({ success: false, message: 'Coordinates are required' });
      return;
    }

    if (isDefaultOrigin) {
      await SavedPlace.updateMany({ userId }, { $set: { isDefaultOrigin: false } });
    }

    const place = await SavedPlace.create({
      userId,
      placeName: resolvedName.trim(),
      address: address?.trim() || resolvedName.trim(),
      coordinates,
      placeCategory: resolvedCategory,
      isDefaultOrigin: !!isDefaultOrigin,
    });

    res.status(201).json({ success: true, place, message: 'Saved place created.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateSavedPlace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const place = await SavedPlace.findOneAndUpdate(
      { _id: id, userId },
      { $set: req.body },
      { new: true }
    );

    if (!place) {
      res.status(404).json({ success: false, message: 'Saved place not found' });
      return;
    }

    res.status(200).json({ success: true, place, message: 'Place updated.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSavedPlace = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const place = await SavedPlace.findOneAndDelete({ _id: id, userId });
    if (!place) {
      res.status(404).json({ success: false, message: 'Place not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Saved place deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 3. SAVED ROUTES (CRUD)
// ==========================================

export const getSavedRoutes = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const routes = await SavedRoute.find({ userId }).sort({ createdAt: -1 });
    res.status(200).json({ success: true, routes });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const createSavedRoute = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { routeName, origin, destination, preferredMode, alertThresholdAqi } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    if (!routeName || !origin || !destination) {
      res.status(400).json({ success: false, message: 'Route name, origin and destination are required' });
      return;
    }

    const route = await SavedRoute.create({
      userId,
      routeName: routeName.trim(),
      origin,
      destination,
      preferredMode: preferredMode || 'metro',
      alertThresholdAqi: Number(alertThresholdAqi) || 200,
    });

    res.status(201).json({ success: true, route, message: 'Favorite route saved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteSavedRoute = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const { id } = req.params;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const route = await SavedRoute.findOneAndDelete({ _id: id, userId });
    if (!route) {
      res.status(404).json({ success: false, message: 'Route not found' });
      return;
    }

    res.status(200).json({ success: true, message: 'Saved route deleted.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 4. EMISSIONS CALCULATOR & ADVISORS
// ==========================================

export const calculateEmissions = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { distanceKm, mode, fuelType, passengerCount } = req.body;

    if (!distanceKm || distanceKm <= 0) {
      res.status(400).json({ success: false, message: 'Valid travel distance in kilometers is required' });
      return;
    }

    const calculation = calculateTravelEmissions({
      distanceKm: Number(distanceKm),
      mode: mode || 'private_car',
      fuelType,
      passengerCount: Number(passengerCount) || 1,
    });

    res.status(200).json({ success: true, calculation });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getDepartureTimeAdvice = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { aqi, currentAqi, baseDurationMins = 35 } = req.body;
    const resolvedAqi = Number(currentAqi) || Number(aqi) || 150;

    const advice = evaluateDepartureTimeWindows(Number(resolvedAqi), Number(baseDurationMins));
    res.status(200).json({ success: true, advice, data: advice });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 5. TRAVEL HISTORY & PREFERENCES
// ==========================================

export const getTravelHistory = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const limit = Number(req.query.limit) || 30;
    const history = await TravelHistory.find({ userId }).sort({ timestamp: -1 }).limit(limit);

    const totalTrips = history.length;
    const totalDistanceKm = Math.round(history.reduce((sum, t) => sum + (t.distanceKm || 0), 0) * 10) / 10;
    const totalEmissionsGrams = Math.round(history.reduce((sum, t) => sum + (t.estimatedEmissionsGrams || 0), 0));
    const totalEmissionsAvoidedGramsCo2 = Math.round(
      history.reduce((sum, t) => sum + (t.emissionsAvoidedGrams || 0), 0)
    );

    res.status(200).json({
      success: true,
      history,
      trips: history,
      summary: {
        totalTrips,
        totalDistanceKm,
        totalEmissionsGrams,
        totalEmissionsAvoidedGramsCo2,
      },
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const recordTrip = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const {
      origin,
      destination,
      originName,
      destinationName,
      transportMode,
      modeUsed,
      distanceKm,
      durationMinutes,
      estimatedEmissionsGrams,
      emissionsGramsCo2,
      emissionsAvoidedGrams,
      emissionsAvoidedGramsCo2,
      exposureScore,
      notes,
    } = req.body;

    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const resolvedOriginName = typeof origin === 'string' ? origin : origin?.name || originName || 'Origin';
    const resolvedOriginLat = typeof origin === 'object' && origin?.lat != null ? Number(origin.lat) : 28.6139;
    const resolvedOriginLon = typeof origin === 'object' && origin?.lon != null ? Number(origin.lon) : 77.2090;

    const resolvedDestName = typeof destination === 'string' ? destination : destination?.name || destinationName || 'Destination';
    const resolvedDestLat = typeof destination === 'object' && destination?.lat != null ? Number(destination.lat) : 28.4986;
    const resolvedDestLon = typeof destination === 'object' && destination?.lon != null ? Number(destination.lon) : 77.0878;

    const resolvedMode = transportMode || modeUsed || 'metro';
    const resolvedEmissions = Number(estimatedEmissionsGrams) || Number(emissionsGramsCo2) || 0;
    const resolvedAvoided = Number(emissionsAvoidedGrams) || Number(emissionsAvoidedGramsCo2) || 0;

    let resolvedExposureRating: 'low' | 'moderate' | 'high' | 'severe' = 'moderate';
    if (typeof exposureScore === 'number') {
      resolvedExposureRating = exposureScore < 30 ? 'low' : exposureScore < 60 ? 'moderate' : exposureScore < 80 ? 'high' : 'severe';
    } else if (['low', 'moderate', 'high', 'severe'].includes(exposureScore)) {
      resolvedExposureRating = exposureScore;
    }

    const trip = await TravelHistory.create({
      userId,
      origin: {
        name: resolvedOriginName,
        lat: resolvedOriginLat,
        lon: resolvedOriginLon,
      },
      destination: {
        name: resolvedDestName,
        lat: resolvedDestLat,
        lon: resolvedDestLon,
      },
      transportMode: resolvedMode,
      distanceKm: Number(distanceKm) || 0,
      durationMinutes: Number(durationMinutes) || 0,
      estimatedEmissionsGrams: resolvedEmissions,
      emissionsAvoidedGrams: resolvedAvoided,
      exposureScore: resolvedExposureRating,
      notes,
      timestamp: new Date(),
    });

    res.status(201).json({ success: true, trip, message: 'Trip recorded to history.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getTravelPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    let pref = await TravelPreference.findOne({ userId });
    if (!pref) {
      pref = await TravelPreference.create({
        userId,
        preferredModes: ['metro', 'public_transit', 'carpool'],
        priority: 'balanced',
      });
    }

    res.status(200).json({ success: true, preferences: pref });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const updateTravelPreferences = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required' });
      return;
    }

    const pref = await TravelPreference.findOneAndUpdate(
      { userId },
      { $set: req.body },
      { new: true, upsert: true }
    );

    res.status(200).json({ success: true, preferences: pref, message: 'Travel preferences saved.' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

// ==========================================
// 6. GENAI SMART TRAVEL ASSISTANT
// ==========================================

export const askTravelAdvisor = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { question, origin, destination, outdoorAqi = 150, language = 'en' } = req.body;

    if (!question || !question.trim()) {
      res.status(400).json({ success: false, message: 'Question is required' });
      return;
    }

    const apiKey = process.env.GEMINI_API_KEY;

    if (apiKey) {
      try {
        const prompt = `You are ClearAir AI's "Smart Travel & Route Advisor".
Evaluate this user transportation inquiry based on ground-truth environmental physics:
- Origin: ${origin?.name || 'Home'}
- Destination: ${destination?.name || 'Destination'}
- Current Outdoor AQI: ${outdoorAqi}
- Language: ${language}

User Inquiry: "${question}"

Respond strictly in valid JSON matching this schema:
{
  "recommendedMode": "string",
  "routeAdvice": "string",
  "exposureMitigation": "string",
  "emissionImpact": "string",
  "departureTimeTip": "string"
}`;

        const url = `https://generativelanguage.googleapis.com/v1beta/models/gemini-1.5-flash:generateContent?key=${apiKey}`;
        const response = await axios.post(
          url,
          {
            contents: [{ role: 'user', parts: [{ text: prompt }] }],
            generationConfig: { responseMimeType: 'application/json', temperature: 0.3 },
          },
          { timeout: 8000 }
        );

        const rawText = response.data?.candidates?.[0]?.content?.parts?.[0]?.text;
        if (rawText) {
          const cleanJson = rawText.replace(/```json/g, '').replace(/```/g, '').trim();
          res.status(200).json({
            success: true,
            answer: JSON.parse(cleanJson),
            source: 'Gemini Generative Engine',
          });
          return;
        }
      } catch (genErr) {
        // Fall through to deterministic engine
      }
    }

    // Deterministic Expert Fallback
    const isSevere = outdoorAqi >= 250;
    const answer = {
      recommendedMode: isSevere ? 'Metro Rail or Filtered Carpool' : 'Public Bus or Metro Rail',
      routeAdvice: isSevere
        ? 'Avoid open-air walking or cycling along arterial diesel roads. Use grade-separated mass transit (Metro) or vehicle with cabin air recirculation.'
        : 'Metro and public bus provide the lowest per-passenger carbon footprint while keeping travel time predictable.',
      exposureMitigation: isSevere
        ? 'Wear an N95 respirator if walking between transit stations. Keep car windows rolled up with AC internal recirculation active.'
        : 'Choose secondary transit greenways rather than multi-lane highways during peak traffic hours.',
      emissionImpact:
        'Choosing Metro or bus reduces transit CO2 emissions by up to 80% compared to a single-occupancy petrol vehicle.',
      departureTimeTip:
        'Midday departure (12:00–15:30) offers the lowest roadside particulate exposure due to active solar boundary layer dispersion.',
      timingAdvice:
        'Midday departure (12:00–15:30) offers the lowest roadside particulate exposure due to active solar boundary layer dispersion.',
      familyOrStudentSpecificAdvice:
        'Students should prioritize metro corridors and campus shuttles; families with seniors should strictly avoid open three-wheelers in high AQI.',
      healthDisclaimer:
        'Advisories are based on atmospheric mixing models and CPCB ambient air standards. Route-level sensor readings are indicated where available.',
    };

    res.status(200).json({ success: true, answer, source: 'Environmental Rule Engine' });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
