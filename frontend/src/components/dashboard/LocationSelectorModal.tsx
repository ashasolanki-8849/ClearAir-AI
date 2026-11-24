import { useState, useEffect } from 'react';
import { Search, MapPin, Navigation, Check } from 'lucide-react';
import { Modal } from '../common/Modal';
import { Button } from '../common/Button';
import { useAQI } from '../../context/AQIContext';
import { apiClient } from '../../services/api';
import { GeocodingItem } from '../../types';

interface LocationSelectorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

const POPULAR_CITIES = [
  { name: 'New Delhi', city: 'Delhi', lat: 28.6139, lon: 77.2090, country: 'India' },
  { name: 'Mumbai', city: 'Mumbai', lat: 19.0760, lon: 72.8777, country: 'India' },
  { name: 'Kolkata', city: 'Kolkata', lat: 22.5726, lon: 88.3639, country: 'India' },
  { name: 'Bengaluru', city: 'Bengaluru', lat: 12.9716, lon: 77.5946, country: 'India' },
  { name: 'Lahore', city: 'Lahore', lat: 31.5204, lon: 74.3587, country: 'Pakistan' },
  { name: 'Beijing', city: 'Beijing', lat: 39.9042, lon: 116.4074, country: 'China' },
  { name: 'London', city: 'London', lat: 51.5074, lon: -0.1278, country: 'United Kingdom' },
  { name: 'New York', city: 'New York', lat: 40.7128, lon: -74.0060, country: 'United States' },
];

export const LocationSelectorModal = ({ isOpen, onClose }: LocationSelectorModalProps) => {
  const { location, setLocation, detectUserLocation, isLoading } = useAQI();
  const [query, setQuery] = useState('');
  const [results, setResults] = useState<GeocodingItem[]>([]);
  const [searching, setSearching] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    if (!query.trim() || query.trim().length < 2) {
      setResults([]);
      setSearching(false);
      return;
    }

    const timer = setTimeout(async () => {
      setSearching(true);
      try {
        const res = await apiClient<{ success: boolean; locations: GeocodingItem[] }>(
          `/locations/search?q=${encodeURIComponent(query)}`
        );
        if (res.success && res.locations) {
          setResults(res.locations);
        }
      } catch (e) {
        // ignore
      } finally {
        setSearching(false);
      }
    }, 300);

    return () => clearTimeout(timer);
  }, [query, isOpen]);

  const handleSelect = (loc: { name: string; city: string; lat: number; lon: number }) => {
    setLocation({
      name: loc.name,
      city: loc.city || loc.name,
      lat: loc.lat,
      lon: loc.lon,
    });
    onClose();
  };

  const handleDetectGPS = async () => {
    await detectUserLocation();
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={onClose}
      title="Select Air Quality Monitoring Location"
      description="Choose a city or use your device's GPS to view real-time smog and pollutant readings."
    >
      <div className="space-y-4">
        {/* Geolocation Trigger */}
        <Button
          variant="outline"
          className="w-full justify-center py-2.5"
          leftIcon={<Navigation className="w-4 h-4 text-emerald-500" />}
          onClick={handleDetectGPS}
          disabled={isLoading}
        >
          Detect My Current GPS Location
        </Button>

        {/* Search Bar */}
        <div className="relative">
          <Search className="absolute left-3 top-2.5 h-4 w-4 text-zinc-400" />
          <input
            type="text"
            placeholder="Search any global or regional city (e.g. Delhi, London, Tokyo)..."
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            className="w-full rounded-lg border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black py-2 pl-9 pr-3 text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
            autoFocus
          />
        </div>

        {/* Dynamic Search Results */}
        {searching ? (
          <div className="py-4 text-center text-xs text-zinc-500">Searching global cities...</div>
        ) : results.length > 0 ? (
          <div className="max-h-56 overflow-y-auto space-y-1">
            {results.map((item) => (
              <button
                key={item.id}
                onClick={() =>
                  handleSelect({
                    name: item.name,
                    city: item.name,
                    lat: item.latitude,
                    lon: item.longitude,
                  })
                }
                className="w-full flex items-center justify-between p-2.5 rounded-lg text-left hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs transition-colors"
              >
                <div className="flex items-center gap-2">
                  <MapPin className="w-3.5 h-3.5 text-zinc-400" />
                  <div>
                    <span className="font-medium text-zinc-900 dark:text-zinc-100">{item.name}</span>
                    <span className="text-zinc-500 text-[11px] ml-1.5">
                      {[item.admin1, item.country].filter(Boolean).join(', ')}
                    </span>
                  </div>
                </div>
                <span className="font-mono text-[10px] text-zinc-400">
                  {item.latitude.toFixed(2)}°, {item.longitude.toFixed(2)}°
                </span>
              </button>
            ))}
          </div>
        ) : query.length >= 2 ? (
          <div className="py-3 text-center text-xs text-zinc-500">
            No city matches found for "{query}". Try another search.
          </div>
        ) : null}

        {/* Popular Cities Grid */}
        <div className="pt-2 border-t border-zinc-100 dark:border-zinc-900">
          <p className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 mb-2">
            Smog Monitoring Benchmarks & Major Cities
          </p>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-2">
            {POPULAR_CITIES.map((c) => {
              const isSelected =
                Math.abs(location.lat - c.lat) < 0.1 && Math.abs(location.lon - c.lon) < 0.1;
              return (
                <button
                  key={c.name}
                  onClick={() => handleSelect(c)}
                  className={`flex items-center justify-between p-2 rounded-lg text-xs border transition-colors ${
                    isSelected
                      ? 'border-emerald-500 bg-emerald-500/10 text-emerald-500 font-semibold'
                      : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300'
                  }`}
                >
                  <span className="truncate">{c.name}</span>
                  {isSelected && <Check className="w-3.5 h-3.5 text-emerald-500 shrink-0" />}
                </button>
              );
            })}
          </div>
        </div>
      </div>
    </Modal>
  );
};
