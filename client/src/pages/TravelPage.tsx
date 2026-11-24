import React, { useState, useEffect, useCallback } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { InteractiveRouteMap } from '../components/travel/InteractiveRouteMap';
import { RouteSearchForm } from '../components/travel/RouteSearchForm';
import { RouteComparisonTable } from '../components/travel/RouteComparisonTable';
import { TransportModeSelector } from '../components/travel/TransportModeSelector';
import { PersonalExposureCard } from '../components/travel/PersonalExposureCard';
import { DepartureTimeAdvisorCard } from '../components/travel/DepartureTimeAdvisorCard';
import { EmissionCalculatorCard } from '../components/travel/EmissionCalculatorCard';
import { CommutePlannerCard } from '../components/travel/CommutePlannerCard';
import { SavedPlacesModal } from '../components/travel/SavedPlacesModal';
import { TravelAIAdvisor } from '../components/travel/TravelAIAdvisor';
import { travelService } from '../services/travelService';
import {
  RouteAlternativeData,
  RouteComparisonData,
  SavedPlaceData,
  DepartureTimeAdviceData,
  TravelPriority,
} from '../types';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Navigation,
  MapPin,
  Clock,
  Gauge,
  ShieldAlert,
  Sparkles,
  Bookmark,
  RefreshCw,
  Compass,
  Layers,
  Leaf,
  Info,
} from 'lucide-react';
import { Badge } from '../components/common/Badge';

export const TravelPage: React.FC = () => {
  const { location, aqiData, refreshAQI, isLoading: aqiLoading } = useAQI();
  const { user } = useAuth();
  const { showToast } = useToast();

  // Search & Routing State
  const [originName, setOriginName] = useState('Connaught Place, Central Delhi');
  const [originCoords, setOriginCoords] = useState<{ lat: number; lon: number }>({
    lat: 28.6315,
    lon: 77.2167,
  });

  const [destinationName, setDestinationName] = useState('Cyber City, Gurugram');
  const [destinationCoords, setDestinationCoords] = useState<{ lat: number; lon: number }>({
    lat: 28.4986,
    lon: 77.0878,
  });

  const [priority, setPriority] = useState<TravelPriority>('balanced');
  const [preferredMode, setPreferredMode] = useState<string>('all');
  const [routes, setRoutes] = useState<RouteAlternativeData[]>([]);
  const [selectedRouteId, setSelectedRouteId] = useState<string>('');
  const [comparison, setComparison] = useState<RouteComparisonData | null>(null);
  const [departureAdvice, setDepartureAdvice] = useState<DepartureTimeAdviceData | null>(null);
  const [savedPlaces, setSavedPlaces] = useState<SavedPlaceData[]>([]);

  // UI States
  const [isSearching, setIsSearching] = useState(false);
  const [isDetectingLocation, setIsDetectingLocation] = useState(false);
  const [isPlacesModalOpen, setIsPlacesModalOpen] = useState(false);
  const [activeTab, setActiveTab] = useState<'routes' | 'modes' | 'commute' | 'ai'>('routes');

  const currentAqi = aqiData?.aqi || 280;

  // Load Saved Places & Initial Departure Times
  const loadSavedPlaces = useCallback(async () => {
    if (!user) return;
    try {
      const res = await travelService.getSavedPlaces();
      if (res.success && res.places) {
        setSavedPlaces(res.places);
      }
    } catch (err) {
      console.error('Failed to load saved places:', err);
    }
  }, [user]);

  const loadDepartureAdvice = useCallback(async () => {
    try {
      const res = await travelService.getDepartureTimeAdvice({
        currentAqi: currentAqi,
        origin: originCoords,
      });
      if (res.success && res.data) {
        setDepartureAdvice(res.data);
      }
    } catch (err) {
      console.error('Failed to load departure advice:', err);
    }
  }, [currentAqi, originCoords]);

  // Execute Route Search
  const handleSearchRoutes = useCallback(
    async (
      overrideOrigin?: { lat: number; lon: number; name: string },
      overrideDest?: { lat: number; lon: number; name: string },
      overridePriority?: TravelPriority
    ) => {
      const orig = overrideOrigin || {
        lat: originCoords.lat,
        lon: originCoords.lon,
        name: originName,
      };
      const dest = overrideDest || {
        lat: destinationCoords.lat,
        lon: destinationCoords.lon,
        name: destinationName,
      };
      const p = overridePriority || priority;

      setIsSearching(true);
      try {
        const res = await travelService.searchRoutes({
          origin: orig,
          destination: dest,
          priority: p,
          preferredMode: preferredMode === 'all' ? undefined : preferredMode,
          userCategory: 'professional',
        });

        if (res.success && res.routes && res.routes.length > 0) {
          setRoutes(res.routes);
          setComparison(res.comparison);
          // Auto-select recommended route or first route
          const rec = res.routes.find((r) => r.isRecommended) || res.routes[0];
          setSelectedRouteId(rec.routeId);
          showToast(`Generated ${res.routes.length} pollution-aware routes`, 'success');
        } else {
          showToast('Could not calculate routes for selected locations', 'error');
        }
      } catch (err: any) {
        console.error('Route search error:', err);
        showToast(err.message || 'Failed to search routes', 'error');
      } finally {
        setIsSearching(false);
      }
    },
    [originCoords, originName, destinationCoords, destinationName, priority, preferredMode, showToast]
  );

  // Initial Data Load
  useEffect(() => {
    loadSavedPlaces();
    loadDepartureAdvice();
    handleSearchRoutes();
  }, []);

  // Location Detection (GPS)
  const handleDetectLocation = () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser', 'error');
      return;
    }

    setIsDetectingLocation(true);
    navigator.geolocation.getCurrentPosition(
      (pos) => {
        const coords = { lat: pos.coords.latitude, lon: pos.coords.longitude };
        setOriginCoords(coords);
        setOriginName(`Current GPS Location (${coords.lat.toFixed(3)}, ${coords.lon.toFixed(3)})`);
        setIsDetectingLocation(false);
        showToast('Detected current GPS location', 'success');
        handleSearchRoutes({ ...coords, name: 'Current GPS Location' });
      },
      (err) => {
        console.warn('Geolocation error:', err);
        setIsDetectingLocation(false);
        showToast('Unable to retrieve GPS coordinates. Using current city.', 'info');
      },
      { timeout: 8000 }
    );
  };

  // Swap Origin and Destination
  const handleSwap = () => {
    const tempName = originName;
    const tempCoords = originCoords;
    setOriginName(destinationName);
    setOriginCoords(destinationCoords);
    setDestinationName(tempName);
    setDestinationCoords(tempCoords);
    handleSearchRoutes(
      { ...destinationCoords, name: destinationName },
      { ...tempCoords, name: tempName }
    );
  };

  // Saved Place CRUD Handlers
  const handleAddPlace = async (placeData: Partial<SavedPlaceData>) => {
    try {
      const res = await travelService.createSavedPlace(placeData);
      if (res.success && res.place) {
        setSavedPlaces((prev) => [...prev, res.place]);
        showToast('Saved new place successfully', 'success');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to save place', 'error');
    }
  };

  const handleDeletePlace = async (id: string) => {
    try {
      const res = await travelService.deleteSavedPlace(id);
      if (res.success) {
        setSavedPlaces((prev) => prev.filter((p) => p._id !== id));
        showToast('Place deleted', 'info');
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to delete place', 'error');
    }
  };

  const handleSaveRouteBookmark = async (route: RouteAlternativeData) => {
    if (!user) {
      showToast('Sign in to bookmark this route to your account', 'info');
      return;
    }
    try {
      await travelService.createSavedRoute({
        routeName: `${route.routeName} (${route.mode})`,
        origin: { name: originName, lat: originCoords.lat, lon: originCoords.lon },
        destination: { name: destinationName, lat: destinationCoords.lat, lon: destinationCoords.lon },
        preferredMode: route.mode,
        priority: priority,
        alertOnHighAqi: true,
        aqiThreshold: 300,
      });
      showToast('Route saved to your profile!', 'success');
    } catch (err: any) {
      showToast(err.message || 'Failed to bookmark route', 'error');
    }
  };

  const selectedRoute = routes.find((r) => r.routeId === selectedRouteId) || routes[0];

  return (
    <DashboardLayout>
      <div className="space-y-6 pb-12">
        {/* Page Top Header */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 border-b border-zinc-200 dark:border-zinc-800 pb-5">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
                <Navigation className="w-5 h-5" />
              </div>
              <h1 className="text-xl md:text-2xl font-bold text-zinc-900 dark:text-zinc-100 tracking-tight">
                Smart Travel Planner & Route Advisor
              </h1>
            </div>
            <p className="text-xs md:text-sm text-zinc-500 dark:text-zinc-400">
              Low-emission transit intelligence: Compare route speeds against real inhaled PM2.5 dose & carbon footprint.
            </p>
          </div>

          {/* Quick Stats & Saved Places Trigger */}
          <div className="flex items-center gap-2 flex-wrap">
            <div className="flex items-center gap-2 px-3 py-1.5 bg-zinc-100 dark:bg-zinc-900 rounded-xl border border-zinc-200 dark:border-zinc-800 text-xs">
              <span className="text-zinc-500 dark:text-zinc-400">Ambient AQI:</span>
              <span className="font-bold text-amber-500 font-mono">{currentAqi}</span>
              <span className="text-[10px] text-zinc-400">({location.name || 'Delhi NCR'})</span>
            </div>

            <button
              onClick={() => setIsPlacesModalOpen(true)}
              className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:bg-zinc-50 dark:hover:bg-zinc-900 text-xs font-semibold text-zinc-700 dark:text-zinc-300 flex items-center gap-1.5 transition-colors"
            >
              <Bookmark className="w-3.5 h-3.5 text-emerald-500" />
              <span>Saved Places ({savedPlaces.length})</span>
            </button>
          </div>
        </div>

        {/* Search & Configuration Bar */}
        <RouteSearchForm
          originName={originName}
          destinationName={destinationName}
          onOriginChange={(val, coords) => {
            setOriginName(val);
            if (coords) setOriginCoords(coords);
          }}
          onDestinationChange={(val, coords) => {
            setDestinationName(val);
            if (coords) setDestinationCoords(coords);
          }}
          onSwap={handleSwap}
          priority={priority}
          onPriorityChange={(p) => {
            setPriority(p);
            handleSearchRoutes(undefined, undefined, p);
          }}
          preferredMode={preferredMode}
          onModeChange={(m) => setPreferredMode(m)}
          savedPlaces={savedPlaces}
          onSearch={() => handleSearchRoutes()}
          isLoading={isSearching}
          onDetectLocation={handleDetectLocation}
          isDetectingLocation={isDetectingLocation}
        />

        {/* Tab Navigation */}
        <div className="flex items-center gap-2 border-b border-zinc-200 dark:border-zinc-800 pb-2 overflow-x-auto">
          <button
            onClick={() => setActiveTab('routes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'routes'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Compass className="w-3.5 h-3.5 text-emerald-500" />
            <span>Interactive Map & Routes</span>
          </button>

          <button
            onClick={() => setActiveTab('modes')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'modes'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Gauge className="w-3.5 h-3.5 text-emerald-500" />
            <span>Modes & Exposure Dynamics</span>
          </button>

          <button
            onClick={() => setActiveTab('commute')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'commute'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Leaf className="w-3.5 h-3.5 text-emerald-500" />
            <span>Commuter Playbooks & Carbon</span>
          </button>

          <button
            onClick={() => setActiveTab('ai')}
            className={`px-3.5 py-2 rounded-xl text-xs font-semibold flex items-center gap-2 transition-all whitespace-nowrap ${
              activeTab === 'ai'
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black shadow-sm'
                : 'text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-zinc-200'
            }`}
          >
            <Sparkles className="w-3.5 h-3.5 text-emerald-500" />
            <span>GenAI Travel Co-Pilot</span>
          </button>
        </div>

        {/* Tab 1: Routes & Map */}
        {activeTab === 'routes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Interactive Leaflet Route Map */}
            <InteractiveRouteMap
              origin={{ ...originCoords, name: originName }}
              destination={{ ...destinationCoords, name: destinationName }}
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
            />

            {/* Route Comparison Matrix Cards */}
            <RouteComparisonTable
              routes={routes}
              selectedRouteId={selectedRouteId}
              onSelectRoute={(id) => setSelectedRouteId(id)}
              onSaveRoute={handleSaveRouteBookmark}
              priority={priority}
            />

            {/* Diurnal Smog Dynamics & Optimal Departure Advisor */}
            <DepartureTimeAdvisorCard
              advice={departureAdvice || undefined}
              outdoorAqi={currentAqi}
            />
          </div>
        )}

        {/* Tab 2: Modes & Exposure Dynamics */}
        {activeTab === 'modes' && (
          <div className="space-y-6 animate-fadeIn">
            {/* 9 Modes Comparison Grid */}
            <TransportModeSelector
              distanceKm={selectedRoute?.distanceKm || 15}
              outdoorAqi={currentAqi}
              selectedMode={selectedRoute?.mode || 'metro'}
              onSelectMode={(m) => setPreferredMode(m)}
            />

            {/* Deep-dive Exposure Analysis & Recirculation */}
            <PersonalExposureCard outdoorAqi={currentAqi} />
          </div>
        )}

        {/* Tab 3: Commute & Carbon Solutions */}
        {activeTab === 'commute' && (
          <div className="space-y-6 animate-fadeIn">
            {/* Specialized Student, Corporate, and Family Playbooks */}
            <CommutePlannerCard />

            {/* Standalone Interactive Emissions Calculator */}
            <EmissionCalculatorCard />
          </div>
        )}

        {/* Tab 4: GenAI Smart Co-Pilot */}
        {activeTab === 'ai' && (
          <div className="space-y-6 animate-fadeIn">
            <TravelAIAdvisor
              outdoorAqi={currentAqi}
              originName={originName}
              destinationName={destinationName}
              selectedMode={selectedRoute?.mode}
            />
          </div>
        )}

        {/* Saved Places Management Modal */}
        <SavedPlacesModal
          isOpen={isPlacesModalOpen}
          onClose={() => setIsPlacesModalOpen(false)}
          places={savedPlaces}
          onAddPlace={handleAddPlace}
          onDeletePlace={handleDeletePlace}
          onSelectAsOrigin={(p) => {
            setOriginName(p.address || p.customName || p.label);
            setOriginCoords(p.coordinates);
            handleSearchRoutes({ ...p.coordinates, name: p.address || p.label });
          }}
          onSelectAsDestination={(p) => {
            setDestinationName(p.address || p.customName || p.label);
            setDestinationCoords(p.coordinates);
            handleSearchRoutes(undefined, { ...p.coordinates, name: p.address || p.label });
          }}
        />
      </div>
    </DashboardLayout>
  );
};
export default TravelPage;
