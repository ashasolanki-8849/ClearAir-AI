import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { InteractiveRouteMap } from '../components/travel/InteractiveRouteMap';
import { travelService } from '../services/travelService';
import { apiClient } from '../services/api';
import { useAQI } from '../context/AQIContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Navigation,
  MapPin,
  Clock,
  ArrowRight,
  ShieldCheck,
  Search,
  CheckCircle2,
  Info,
  AlertCircle,
  Car,
  Bus,
  Train,
  Bike,
  Sparkles,
  Wind,
  ShieldAlert,
} from 'lucide-react';
import { RouteAlternativeData } from '../types';

export interface GeminiTravelPlan {
  bestMode: string;
  planSummary: string;
  optimalDepartureTime: string;
  modesAnalysis?: {
    car?: { recommended: boolean; tip: string; estimatedDuration: string };
    bus?: { recommended: boolean; tip: string; estimatedDuration: string };
    metro?: { recommended: boolean; tip: string; estimatedDuration: string };
    twoWheeler?: { recommended: boolean; tip: string; estimatedDuration: string };
  };
  safetyPrecautions?: string[];
  trafficSmogHotspots?: string;
}

export const TravelPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const metrics = calculatePollutionMetrics(aqiData?.aqi);

  const [startLocation, setStartLocation] = useState(location.name || 'Gandhinagar, Gujarat');
  const [destination, setDestination] = useState('Ahmedabad Airport, Gujarat');

  const [originCoords, setOriginCoords] = useState({
    lat: location.lat || 23.2156,
    lon: location.lon || 72.6369,
    name: location.name || 'Gandhinagar',
  });
  const [destCoords, setDestCoords] = useState({
    lat: 23.0734,
    lon: 72.6266,
    name: 'Ahmedabad Airport',
  });

  const [routes, setRoutes] = useState<RouteAlternativeData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [selectedModeFilter, setSelectedModeFilter] = useState<'all' | 'car' | 'bus' | 'metro' | 'two_wheeler'>('all');
  const [geminiPlan, setGeminiPlan] = useState<GeminiTravelPlan | null>(null);

  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);
  const [searchError, setSearchError] = useState<string | null>(null);

  // Sync initial location when GPS/context updates
  useEffect(() => {
    if (location.name) {
      setStartLocation(location.name);
      setOriginCoords({ lat: location.lat, lon: location.lon, name: location.name });
    }
  }, [location]);

  // Initial Route Search on page load
  useEffect(() => {
    handleSearchRoutes();
  }, []);

  const handleSearchRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startLocation.trim() || !destination.trim()) return;

    setSearchError(null);
    setSearching(true);
    setHasSearched(true);

    try {
      // 1. Dynamically Geocode Destination via Map Model / Geocoding Service
      let currentDest = destCoords;
      try {
        const destRes = await apiClient<{
          success: boolean;
          locations: Array<{ name: string; latitude: number; longitude: number }>;
        }>(`/locations/search?q=${encodeURIComponent(destination.trim())}`);

        if (destRes.success && destRes.locations && destRes.locations.length > 0) {
          const match = destRes.locations[0];
          currentDest = { lat: match.latitude, lon: match.longitude, name: match.name };
          setDestCoords(currentDest);
        } else {
          setSearchError(`Could not find destination "${destination}". Please enter a valid destination in the map (e.g. city, landmark, or street address).`);
          setSearching(false);
          return;
        }
      } catch (destErr) {
        setSearchError(`Unable to locate "${destination}". Please enter a valid destination in the map.`);
        setSearching(false);
        return;
      }

      // 2. Dynamically Geocode Start Location if modified
      let currentOrigin = originCoords;
      if (startLocation.trim().toLowerCase() !== (originCoords.name || '').toLowerCase()) {
        try {
          const origRes = await apiClient<{
            success: boolean;
            locations: Array<{ name: string; latitude: number; longitude: number }>;
          }>(`/locations/search?q=${encodeURIComponent(startLocation.trim())}`);

          if (origRes.success && origRes.locations && origRes.locations.length > 0) {
            const match = origRes.locations[0];
            currentOrigin = { lat: match.latitude, lon: match.longitude, name: match.name };
            setOriginCoords(currentOrigin);
          }
        } catch (origErr) {
          // Keep current originCoords if lookup falls through
        }
      }

      // 3. Search routes with real dynamic coordinates and fetch Gemini Plan
      const res = await travelService.searchRoutes({
        origin: { lat: currentOrigin.lat, lon: currentOrigin.lon, name: startLocation },
        destination: { lat: currentDest.lat, lon: currentDest.lon, name: currentDest.name || destination },
        preferredMode: selectedModeFilter === 'all' ? 'car' : selectedModeFilter,
        priority: 'balanced',
      });

      if (res.success && res.routes && res.routes.length > 0) {
        setRoutes(res.routes);
        setSelectedRouteId(res.routes[0].routeId);
        if ((res as any).geminiPlan) {
          setGeminiPlan((res as any).geminiPlan);
        }
      } else {
        setSearchError('No valid routes could be computed between these points. Please verify destination.');
      }
    } catch (err: any) {
      console.error('Route search error:', err);
      setSearchError(err.message || 'Route search failed. Please verify your destination.');
    } finally {
      setSearching(false);
    }
  };

  // Filter routes based on selected transit mode
  const filteredRoutes = routes.filter((r) => {
    if (selectedModeFilter === 'all') return true;
    if (selectedModeFilter === 'car') return r.mode === 'car';
    if (selectedModeFilter === 'bus') return r.mode === 'bus';
    if (selectedModeFilter === 'metro') return r.mode === 'metro' || r.routeType === 'metro_transit';
    if (selectedModeFilter === 'two_wheeler') return r.mode === 'two_wheeler';
    return true;
  });

  const activeRoutes = filteredRoutes.length > 0 ? filteredRoutes : routes;
  const activeSelectedRoute = activeRoutes.find((r) => r.routeId === selectedRouteId) || activeRoutes[0];

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Navigation className="w-7 h-7 text-sky-500" />
            <span>Smart Travel & AI Route Planner</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Powered by Gemini AI and real-time map models: find the cleanest transit routes across Car, Bus, Metro, and Two-Wheeler.
          </p>
        </div>

        {/* Input Form with Destination Validation */}
        <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4">
          {searchError && (
            <div className="p-3.5 rounded-2xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2.5 animate-in fade-in">
              <AlertCircle className="w-4 h-4 shrink-0" />
              <span className="font-semibold">{searchError}</span>
            </div>
          )}

          <form onSubmit={handleSearchRoutes} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Starting Point (Pin A)
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-emerald-500" />
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Enter starting city or location..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Destination (Pin B)
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-3 w-4 h-4 text-red-500" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination (e.g. Ahmedabad Airport, Connaught Place)..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            {/* Transit Mode Filters */}
            <div className="flex flex-wrap items-center justify-between gap-3 pt-2">
              <div className="flex flex-wrap items-center gap-1.5 text-xs">
                <span className="text-zinc-500 dark:text-zinc-400 font-semibold mr-1">Transit Modes:</span>
                <button
                  type="button"
                  onClick={() => setSelectedModeFilter('all')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all ${
                    selectedModeFilter === 'all'
                      ? 'bg-sky-500 text-white border-sky-500 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  All Modes
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModeFilter('car')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    selectedModeFilter === 'car'
                      ? 'bg-amber-500 text-white border-amber-500 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <Car className="w-3.5 h-3.5" />
                  <span>Car</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModeFilter('bus')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    selectedModeFilter === 'bus'
                      ? 'bg-purple-500 text-white border-purple-500 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <Bus className="w-3.5 h-3.5" />
                  <span>City Bus</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModeFilter('metro')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    selectedModeFilter === 'metro'
                      ? 'bg-sky-600 text-white border-sky-600 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <Train className="w-3.5 h-3.5" />
                  <span>Metro</span>
                </button>
                <button
                  type="button"
                  onClick={() => setSelectedModeFilter('two_wheeler')}
                  className={`px-3 py-1.5 rounded-lg border font-medium transition-all flex items-center gap-1.5 ${
                    selectedModeFilter === 'two_wheeler'
                      ? 'bg-pink-500 text-white border-pink-500 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:border-zinc-400'
                  }`}
                >
                  <Bike className="w-3.5 h-3.5" />
                  <span>Two-Wheeler</span>
                </button>
              </div>

              <button
                type="submit"
                disabled={searching}
                className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <Search className="w-3.5 h-3.5" />
                <span>{searching ? 'Computing Map Routes...' : 'Plan Journey'}</span>
              </button>
            </div>
          </form>
        </div>

        {/* Gemini AI Smart Travel Co-Pilot Card */}
        {geminiPlan && (
          <div className="p-5 sm:p-6 rounded-3xl border border-sky-500/30 bg-gradient-to-br from-sky-500/5 via-transparent to-emerald-500/5 shadow-sm space-y-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex items-center gap-2.5">
                <div className="p-2 rounded-xl bg-sky-500/10 text-sky-500">
                  <Sparkles className="w-5 h-5" />
                </div>
                <div>
                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white flex items-center gap-2">
                    <span>Gemini AI Smart Travel Advisory</span>
                    <span className="text-[10px] px-2 py-0.5 rounded-full font-bold bg-sky-500 text-white">
                      Best Mode: {geminiPlan.bestMode}
                    </span>
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400">
                    {geminiPlan.planSummary}
                  </p>
                </div>
              </div>

              <div className="text-right text-xs bg-white/70 dark:bg-zinc-900/70 px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800">
                <span className="text-zinc-400 block text-[10px] font-semibold uppercase">Optimal Departure</span>
                <span className="font-bold text-emerald-600 dark:text-emerald-400">{geminiPlan.optimalDepartureTime}</span>
              </div>
            </div>

            {/* Mode-by-mode comparison grid */}
            {geminiPlan.modesAnalysis && (
              <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-3 pt-2">
                {geminiPlan.modesAnalysis.car && (
                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                      <span className="flex items-center gap-1.5 text-amber-500">
                        <Car className="w-4 h-4" /> Car
                      </span>
                      <span className="text-zinc-500">{geminiPlan.modesAnalysis.car.estimatedDuration}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{geminiPlan.modesAnalysis.car.tip}</p>
                  </div>
                )}

                {geminiPlan.modesAnalysis.bus && (
                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                      <span className="flex items-center gap-1.5 text-purple-500">
                        <Bus className="w-4 h-4" /> City Bus
                      </span>
                      <span className="text-zinc-500">{geminiPlan.modesAnalysis.bus.estimatedDuration}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{geminiPlan.modesAnalysis.bus.tip}</p>
                  </div>
                )}

                {geminiPlan.modesAnalysis.metro && (
                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                      <span className="flex items-center gap-1.5 text-sky-500">
                        <Train className="w-4 h-4" /> Metro
                      </span>
                      <span className="text-zinc-500">{geminiPlan.modesAnalysis.metro.estimatedDuration}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{geminiPlan.modesAnalysis.metro.tip}</p>
                  </div>
                )}

                {geminiPlan.modesAnalysis.twoWheeler && (
                  <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white/60 dark:bg-zinc-950/60 text-xs space-y-1">
                    <div className="flex items-center justify-between font-bold text-zinc-900 dark:text-white">
                      <span className="flex items-center gap-1.5 text-pink-500">
                        <Bike className="w-4 h-4" /> Two-Wheeler
                      </span>
                      <span className="text-zinc-500">{geminiPlan.modesAnalysis.twoWheeler.estimatedDuration}</span>
                    </div>
                    <p className="text-[11px] text-zinc-500 dark:text-zinc-400">{geminiPlan.modesAnalysis.twoWheeler.tip}</p>
                  </div>
                )}
              </div>
            )}

            {/* Safety Tips Banner */}
            {geminiPlan.safetyPrecautions && geminiPlan.safetyPrecautions.length > 0 && (
              <div className="p-3 rounded-2xl bg-sky-500/10 border border-sky-500/20 text-xs flex flex-wrap items-center gap-3">
                <ShieldCheck className="w-4 h-4 text-sky-500 shrink-0" />
                <span className="font-semibold text-zinc-800 dark:text-zinc-200">Safety Advisory:</span>
                <span className="text-zinc-600 dark:text-zinc-300">
                  {geminiPlan.safetyPrecautions.join(' • ')}
                </span>
              </div>
            )}
          </div>
        )}

        {/* Route Cards */}
        {activeRoutes.length > 0 && (
          <div className="space-y-5">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {activeRoutes.map((r) => {
                const isSelected = r.routeId === (activeSelectedRoute?.routeId || selectedRouteId);
                const isCleaner = r.routeType === 'clean_bypass' || r.routeType === 'metro_transit';

                return (
                  <div
                    key={r.routeId}
                    onClick={() => setSelectedRouteId(r.routeId)}
                    className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                      isSelected
                        ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20'
                        : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                    }`}
                  >
                    <div className="flex items-center justify-between mb-2">
                      <span
                        className={`px-2.5 py-0.5 rounded-full text-[11px] font-bold ${
                          r.isRecommended
                            ? 'bg-sky-500 text-white'
                            : isCleaner
                            ? 'bg-emerald-500 text-white'
                            : 'bg-zinc-200 dark:bg-zinc-800 text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        {r.isRecommended ? 'Recommended' : r.routeName}
                      </span>
                      <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                        {r.distanceKm} km
                      </span>
                    </div>

                    <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                      {r.routeName}
                    </h3>

                    <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-900 mt-3">
                      <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                        <Clock className="w-3.5 h-3.5 text-sky-500" />
                        <span>{r.durationMinutes} mins</span>
                      </div>

                      <div
                        className={`font-semibold ${
                          isCleaner ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-700 dark:text-zinc-300'
                        }`}
                      >
                        Est. AQI ~{r.streetAqiEstimated}
                      </div>
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Interactive Leaflet Route Map */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm">
              <InteractiveRouteMap
                origin={{
                  lat: originCoords.lat,
                  lon: originCoords.lon,
                  name: originCoords.name || startLocation,
                }}
                destination={{
                  lat: destCoords.lat,
                  lon: destCoords.lon,
                  name: destCoords.name || destination,
                }}
                routes={activeRoutes}
                selectedRouteId={activeSelectedRoute?.routeId || selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
