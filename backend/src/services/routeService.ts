import axios from 'axios';
import { IRouteAlternative } from '../models/RouteComparison.js';
import { calculateTravelEmissions } from './travelEmissionService.js';
import { evaluateTravelExposure } from './travelExposureService.js';

export interface RouteSearchInput {
  origin: { name: string; lat: number; lon: number; address?: string };
  destination: { name: string; lat: number; lon: number; address?: string };
  preferredMode?: string;
  outdoorAqi?: number;
  pm25?: number;
  priority?: 'balanced' | 'fastest' | 'lowest_emissions' | 'lowest_exposure' | 'lowest_cost';
}

export const generateRouteAlternatives = async (
  input: RouteSearchInput
): Promise<IRouteAlternative[]> => {
  const {
    origin,
    destination,
    preferredMode = 'metro',
    outdoorAqi = 150,
    pm25 = 65,
    priority = 'balanced',
  } = input;

  // 1. Calculate base straight-line distance via Haversine formula
  const dLat = ((destination.lat - origin.lat) * Math.PI) / 180;
  const dLon = ((destination.lon - origin.lon) * Math.PI) / 180;
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos((origin.lat * Math.PI) / 180) *
      Math.cos((destination.lat * Math.PI) / 180) *
      Math.sin(dLon / 2) *
      Math.sin(dLon / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  const haversineDistKm = 6371 * c;

  // Road distance is typically 1.25x to 1.35x straight-line distance in cities
  const baseRoadDistKm = Math.max(1.5, Math.round(haversineDistKm * 1.28 * 10) / 10);

  // 2. Attempt fetching actual OSRM geometry and distance
  let realGeometry: [number, number][] = [];
  let osrmDurationMins = Math.round((baseRoadDistKm / 28) * 60); // 28 km/h city average
  let osrmDistanceKm = baseRoadDistKm;

  try {
    const osrmUrl = `https://router.project-osrm.org/route/v1/driving/${origin.lon},${origin.lat};${destination.lon},${destination.lat}?overview=full&geometries=geojson&steps=false`;
    const res = await axios.get(osrmUrl, { timeout: 4500 });
    if (res.data?.routes?.[0]) {
      const r = res.data.routes[0];
      osrmDistanceKm = Math.round((r.distance / 1000) * 10) / 10;
      osrmDurationMins = Math.max(5, Math.round(r.duration / 60));
      // Convert GeoJSON [lon, lat] to Leaflet [lat, lon]
      if (Array.isArray(r.geometry?.coordinates) && r.geometry.coordinates.length > 1) {
        realGeometry = r.geometry.coordinates.map((coord: [number, number]) => [coord[1], coord[0]]);
        // Ensure start and end strictly anchor to origin and destination markers
        realGeometry[0] = [origin.lat, origin.lon];
        realGeometry[realGeometry.length - 1] = [destination.lat, destination.lon];
      }
    }
  } catch (e) {
    // If OSRM times out, generate realistic geometric interpolated waypoints between origin & destination
  }

  // Fallback geometry if OSRM was unavailable or returned empty coordinates
  if (realGeometry.length === 0) {
    realGeometry = generateInterpolatedPath(
      [origin.lat, origin.lon],
      [destination.lat, destination.lon],
      14,
      0.003
    );
  }

  // Generate Secondary Bypass Geometry with slight curvature offset
  const bypassGeometry = generateInterpolatedPath(
    [origin.lat, origin.lon],
    [destination.lat, destination.lon],
    16,
    0.012 // wider detour avoiding main highway
  );

  // Generate Transit Corridor Geometry (bus & metro line)
  const busGeometry = generateInterpolatedPath(
    [origin.lat, origin.lon],
    [destination.lat, destination.lon],
    14,
    -0.005 // arterial bus lane
  );

  const transitGeometry = generateInterpolatedPath(
    [origin.lat, origin.lon],
    [destination.lat, destination.lon],
    12,
    -0.008 // dedicated rail alignment
  );

  const bikeGeometry = generateInterpolatedPath(
    [origin.lat, origin.lon],
    [destination.lat, destination.lon],
    14,
    0.002
  );

  // ==========================================
  // ROUTE 1: FASTEST ARTERIAL (Main Highway)
  // ==========================================
  const distR1 = osrmDistanceKm;
  const durR1 = Math.round(osrmDurationMins * 1.15); // traffic penalty
  const emissR1 = calculateTravelEmissions({ distanceKm: distR1, mode: 'private_car', passengerCount: 1 });
  const exposR1 = evaluateTravelExposure({
    outdoorAqi,
    pm25,
    mode: 'private_car',
    durationMinutes: durR1,
    trafficStatus: 'heavy',
    roadType: 'arterial_highway',
  });

  const route1: IRouteAlternative = {
    routeId: 'route_arterial_1',
    routeName: 'Main Arterial Highway Corridor',
    routeTag: 'fastest',
    mode: 'private_car',
    distanceKm: distR1,
    durationMinutes: durR1,
    trafficStatus: 'heavy',
    estimatedEmissionsGrams: emissR1.totalTripEmissionsGrams,
    estimatedCostInr: Math.round(distR1 * 10.5), // petrol cost
    exposureLevel: exposR1.exposureLevel,
    exposureExplanation:
      'High vehicle density and stop-and-go idling along arterial signals concentrates street-level nitrogen dioxide and particulate soot.',
    advantages: ['Direct, shortest driving distance', 'Well-lit with high speed limit outside peak rush hours'],
    disadvantages: ['Severe idling traffic during peak hours', 'Highest total CO2 emissions of all options'],
    geometryCoordinates: realGeometry,
  };

  // ==========================================
  // ROUTE 2: CLEAN AIR BYPASS / SECONDARY
  // ==========================================
  const distR2 = Math.round((osrmDistanceKm * 1.14) * 10) / 10; // 14% longer detour
  const durR2 = Math.round(osrmDurationMins * 0.98); // smoother flow, no traffic gridlock
  const emissR2 = calculateTravelEmissions({ distanceKm: distR2, mode: 'carpool', passengerCount: 3 });
  const exposR2 = evaluateTravelExposure({
    outdoorAqi,
    pm25,
    mode: 'carpool',
    durationMinutes: durR2,
    trafficStatus: 'low',
    roadType: 'interior_corridor',
  });

  const route2: IRouteAlternative = {
    routeId: 'route_bypass_2',
    routeName: 'Clean Air Outer Bypass / Secondary Corridor',
    routeTag: 'cleanest_corridor',
    mode: 'carpool',
    distanceKm: distR2,
    durationMinutes: durR2,
    trafficStatus: 'low',
    estimatedEmissionsGrams: emissR2.perPassengerEmissionsGrams,
    estimatedCostInr: Math.round((distR2 * 10.5) / 3), // shared cost
    exposureLevel: exposR2.exposureLevel,
    exposureExplanation:
      'Bypasses major diesel freight choke points. Smooth continuous driving speeds lower cumulative tailpipe plume exposure.',
    advantages: ['Lowest roadside diesel exhaust density', 'Continuous cruising reduces passenger stress', 'Shared carpool emissions'],
    disadvantages: ['1.5 km to 3 km longer physical distance'],
    geometryCoordinates: bypassGeometry,
  };

  // ==========================================
  // ROUTE 3: METRO / RAIL TRANSIT ECO-CORRIDOR
  // ==========================================
  const distR3 = Math.round((osrmDistanceKm * 1.05) * 10) / 10;
  const durR3 = Math.round(distR3 * 2.3 + 8); // rail travel + 8 min station wait
  const emissR3 = calculateTravelEmissions({ distanceKm: distR3, mode: 'metro', passengerCount: 1 });
  const exposR3 = evaluateTravelExposure({
    outdoorAqi,
    pm25,
    mode: 'metro',
    durationMinutes: durR3,
    trafficStatus: 'low',
    roadType: 'dedicated_transit_way',
  });

  const route3: IRouteAlternative = {
    routeId: 'route_metro_3',
    routeName: 'Metro Rail & Electric Mass Transit',
    routeTag: 'transit_eco',
    mode: 'metro',
    distanceKm: distR3,
    durationMinutes: durR3,
    trafficStatus: 'low',
    estimatedEmissionsGrams: emissR3.perPassengerEmissionsGrams,
    estimatedCostInr: Math.min(60, Math.max(20, Math.round(distR3 * 3.5))), // public fare
    exposureLevel: exposR3.exposureLevel,
    exposureExplanation:
      'Air-conditioned rolling stock with sealed cabin recirculation and mechanical air filtration shields passengers from street-level smog.',
    advantages: ['85% lower carbon footprint per passenger-km', 'Zero traffic delay risk', 'Lowest personal respiratory exposure'],
    disadvantages: ['Requires short walk or feeder e-rickshaw to station'],
    geometryCoordinates: transitGeometry,
  };

  // ==========================================
  // ROUTE 4: PUBLIC BUS TRANSIT (AC / Electric Bus)
  // ==========================================
  const distR4 = Math.round((osrmDistanceKm * 1.08) * 10) / 10;
  const durR4 = Math.round(osrmDurationMins * 1.35 + 5);
  const emissR4 = calculateTravelEmissions({ distanceKm: distR4, mode: 'public_bus', passengerCount: 1 });
  const exposR4 = evaluateTravelExposure({
    outdoorAqi,
    pm25,
    mode: 'public_bus',
    durationMinutes: durR4,
    trafficStatus: 'moderate',
    roadType: 'arterial_highway',
  });

  const route4: IRouteAlternative = {
    routeId: 'route_bus_4',
    routeName: 'City Bus Public Transit (AC / Electric)',
    routeTag: 'transit_bus',
    mode: 'bus',
    distanceKm: distR4,
    durationMinutes: durR4,
    trafficStatus: 'moderate',
    estimatedEmissionsGrams: emissR4.perPassengerEmissionsGrams || 180,
    estimatedCostInr: Math.min(35, Math.max(10, Math.round(distR4 * 2))),
    exposureLevel: exposR4.exposureLevel,
    exposureExplanation:
      'AC city buses reduce direct exhaust inhalation by 60% compared to open road traffic. Prefer travel during non-peak hours.',
    advantages: ['Economical public transit fare', 'Lower individual carbon footprint', 'Regular urban connections'],
    disadvantages: ['Scheduled station stops increase total journey duration'],
    geometryCoordinates: busGeometry,
  };

  // ==========================================
  // ROUTE 5: TWO-WHEELER / BIKE
  // ==========================================
  const distR5 = distR1;
  const durR5 = Math.max(5, Math.round(osrmDurationMins * 0.9));
  const emissR5 = calculateTravelEmissions({ distanceKm: distR5, mode: 'two_wheeler', passengerCount: 1 });

  const route5: IRouteAlternative = {
    routeId: 'route_bike_5',
    routeName: 'Two-Wheeler / Scooter Road Transit',
    routeTag: 'two_wheeler',
    mode: 'two_wheeler',
    distanceKm: distR5,
    durationMinutes: durR5,
    trafficStatus: 'moderate',
    estimatedEmissionsGrams: emissR5.perPassengerEmissionsGrams || 290,
    estimatedCostInr: Math.round(distR5 * 3.5),
    exposureLevel: 'high',
    exposureExplanation:
      'Direct, unshielded exposure to vehicular diesel particulate matter and exhaust plumes. Tight-fitting N95 mask is strongly advised.',
    advantages: ['Faster maneuverability in dense traffic', 'Low fuel expense'],
    disadvantages: ['Highest personal respiratory exposure', 'Direct exposure to street-level soot and dust'],
    geometryCoordinates: bikeGeometry,
  };

  return [route1, route2, route3, route4, route5];
};

// Helper: Generates realistic curved road coordinates between points
const generateInterpolatedPath = (
  start: [number, number],
  end: [number, number],
  steps: number,
  curvatureOffset: number
): [number, number][] => {
  const points: [number, number][] = [];
  points.push([start[0], start[1]]);
  for (let i = 1; i < steps; i++) {
    const t = i / steps;
    // Linear interpolation
    const lat = start[0] + (end[0] - start[0]) * t;
    const lon = start[1] + (end[1] - start[1]) * t;

    // Perpendicular curve arc
    const arc = Math.sin(t * Math.PI) * curvatureOffset;
    points.push([
      Math.round((lat + arc) * 100000) / 100000,
      Math.round((lon - arc) * 100000) / 100000,
    ]);
  }
  points.push([end[0], end[1]]);
  return points;
};
