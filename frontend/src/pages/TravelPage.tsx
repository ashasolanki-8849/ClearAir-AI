import React, { useState, useEffect } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { InteractiveRouteMap } from '../components/travel/InteractiveRouteMap';
import { travelService } from '../services/travelService';
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
} from 'lucide-react';
import { RouteAlternativeData } from '../types';

export const TravelPage: React.FC = () => {
  const { location, aqiData } = useAQI();
  const metrics = calculatePollutionMetrics(aqiData?.aqi);

  const [startLocation, setStartLocation] = useState(location.name || 'Connaught Place, New Delhi');
  const [destination, setDestination] = useState('Noida Sector 62, Uttar Pradesh');

  const [originCoords, setOriginCoords] = useState({ lat: location.lat || 28.6139, lon: location.lon || 77.2090, name: location.name });
  const [destCoords, setDestCoords] = useState({ lat: 28.6280, lon: 77.3649, name: 'Noida Sector 62' });

  const [routes, setRoutes] = useState<RouteAlternativeData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [searching, setSearching] = useState(false);
  const [hasSearched, setHasSearched] = useState(false);

  // Initial Route Search
  useEffect(() => {
    handleSearchRoutes();
  }, []);

  const handleSearchRoutes = async (e?: React.FormEvent) => {
    if (e) e.preventDefault();
    if (!startLocation.trim() || !destination.trim()) return;

    try {
      setSearching(true);
      setHasSearched(true);

      const res = await travelService.searchRoutes({
        origin: { lat: originCoords.lat, lon: originCoords.lon, name: startLocation },
        destination: { lat: destCoords.lat, lon: destCoords.lon, name: destination },
        preferredMode: 'car',
        priority: 'balanced',
      });

      if (res.success && res.routes && res.routes.length > 0) {
        setRoutes(res.routes);
        setSelectedRouteId(res.routes[0].routeId);
      }
    } catch (err) {
      console.error('Route search error:', err);
    } finally {
      setSearching(false);
    }
  };

  const bestRoute = routes.length > 0 ? routes[0] : null;
  // Lower pollution alternative route if available and cleaner
  const lowerPollutionRoute = routes.length > 1 && routes[1].streetAqiEstimated < (bestRoute?.streetAqiEstimated || 0)
    ? routes[1]
    : null;

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-5xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <Navigation className="w-7 h-7 text-sky-500" />
            <span>Smart Travel</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Find simple, safer travel routes to avoid breathing heavy traffic exhaust and smog.
          </p>
        </div>

        {/* Simple Input Form */}
        <div className="p-5 sm:p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm">
          <form onSubmit={handleSearchRoutes} className="space-y-4">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-xs">
              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Starting Location
                </label>
                <div className="relative">
                  <MapPin className="absolute left-3.5 top-3 w-4 h-4 text-sky-500" />
                  <input
                    type="text"
                    required
                    value={startLocation}
                    onChange={(e) => setStartLocation(e.target.value)}
                    placeholder="Enter starting point..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-semibold text-zinc-700 dark:text-zinc-300 mb-1">
                  Destination
                </label>
                <div className="relative">
                  <Navigation className="absolute left-3.5 top-3 w-4 h-4 text-sky-500" />
                  <input
                    type="text"
                    required
                    value={destination}
                    onChange={(e) => setDestination(e.target.value)}
                    placeholder="Enter destination..."
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>
            </div>

            <button
              type="submit"
              disabled={searching}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Search className="w-3.5 h-3.5" />
              <span>{searching ? 'Finding Routes...' : 'Find Routes'}</span>
            </button>
          </form>
        </div>

        {/* Route Results & Map */}
        {routes.length > 0 && (
          <div className="space-y-5">
            {/* 2 Route Choice Cards: Best Route & Lower Pollution Route */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {/* Card 1: Best Route */}
              {bestRoute && (
                <div
                  onClick={() => setSelectedRouteId(bestRoute.routeId)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRouteId === bestRoute.routeId
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-500 text-white">
                      Best Route
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {bestRoute.distanceKm} km
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                    {bestRoute.routeName}
                  </h3>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-900 mt-3">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{bestRoute.durationMinutes} mins travel time</span>
                    </div>

                    <div className="font-semibold text-zinc-800 dark:text-zinc-200">
                      Pollution Level: {Math.min(100, Math.round(bestRoute.streetAqiEstimated / 4))}%
                    </div>
                  </div>
                </div>
              )}

              {/* Card 2: Lower Pollution Route */}
              {lowerPollutionRoute ? (
                <div
                  onClick={() => setSelectedRouteId(lowerPollutionRoute.routeId)}
                  className={`p-5 rounded-2xl border cursor-pointer transition-all ${
                    selectedRouteId === lowerPollutionRoute.routeId
                      ? 'border-sky-500 ring-2 ring-sky-500/20 bg-sky-50/20 dark:bg-sky-950/20'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center justify-between mb-2">
                    <span className="px-2.5 py-0.5 rounded-full text-[11px] font-bold bg-sky-100 dark:bg-sky-900 text-sky-700 dark:text-sky-300">
                      Lower Pollution Route
                    </span>
                    <span className="text-xs font-semibold text-zinc-500 dark:text-zinc-400">
                      {lowerPollutionRoute.distanceKm} km
                    </span>
                  </div>

                  <h3 className="font-bold text-sm text-zinc-900 dark:text-white mb-1">
                    {lowerPollutionRoute.routeName}
                  </h3>

                  <div className="flex items-center justify-between text-xs pt-2 border-t border-zinc-100 dark:border-zinc-900 mt-3">
                    <div className="flex items-center gap-1.5 text-zinc-600 dark:text-zinc-400">
                      <Clock className="w-3.5 h-3.5 text-sky-500" />
                      <span>{lowerPollutionRoute.durationMinutes} mins</span>
                    </div>

                    <div className="font-semibold text-sky-600 dark:text-sky-400">
                      Pollution Level: {Math.min(100, Math.round(lowerPollutionRoute.streetAqiEstimated / 4))}% (Cleaner)
                    </div>
                  </div>
                </div>
              ) : (
                /* Clear statement when cleaner route is unavailable */
                <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/50 flex flex-col justify-center text-xs space-y-1.5">
                  <div className="flex items-center gap-2 text-zinc-700 dark:text-zinc-300 font-bold">
                    <Info className="w-4 h-4 text-sky-500" />
                    <span>Lower Pollution Route</span>
                  </div>
                  <p className="text-zinc-500 dark:text-zinc-400">
                    No lower-pollution route is available right now. Traffic and smog levels are uniform across available corridors.
                  </p>
                </div>
              )}
            </div>

            {/* Route Map */}
            <div className="rounded-3xl border border-zinc-200 dark:border-zinc-800 overflow-hidden shadow-sm h-[400px]">
              <InteractiveRouteMap
                origin={{ lat: originCoords.lat, lon: originCoords.lon, name: startLocation }}
                destination={{ lat: destCoords.lat, lon: destCoords.lon, name: destination }}
                routes={routes}
                selectedRouteId={selectedRouteId}
                onSelectRoute={(id) => setSelectedRouteId(id)}
              />
            </div>
          </div>
        )}
      </div>
    </DashboardLayout>
  );
};
