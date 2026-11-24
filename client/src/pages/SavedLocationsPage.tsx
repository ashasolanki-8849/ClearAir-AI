import { useEffect, useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { Card } from '../components/common/Card';
import { Button } from '../components/common/Button';
import { Input } from '../components/common/Input';
import { EmptyState } from '../components/common/EmptyState';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { SavedLocation } from '../types';
import { apiClient } from '../services/api';
import { useAuth } from '../context/AuthContext';
import { useAQI } from '../context/AQIContext';
import { useToast } from '../context/ToastContext';
import { MapPin, Trash2, Check, Plus, Navigation } from 'lucide-react';
import { Link } from 'react-router-dom';

export const SavedLocationsPage = () => {
  const { isAuthenticated } = useAuth();
  const { setLocation, location: activeLocation } = useAQI();
  const { showToast } = useToast();

  const [locations, setLocations] = useState<SavedLocation[]>([]);
  const [loading, setLoading] = useState(true);
  const [newCityName, setNewCityName] = useState('');
  const [adding, setAdding] = useState(false);

  const fetchLocations = async () => {
    if (!isAuthenticated) {
      setLoading(false);
      return;
    }
    setLoading(true);
    try {
      const res = await apiClient<{ success: boolean; locations: SavedLocation[] }>('/locations/saved');
      if (res.success && res.locations) {
        setLocations(res.locations);
      }
    } catch (e: any) {
      showToast(e.message || 'Failed to fetch saved locations', 'error');
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchLocations();
  }, [isAuthenticated]);

  const handleSelectLocation = (loc: SavedLocation) => {
    setLocation({
      name: loc.name,
      city: loc.city,
      lat: loc.lat,
      lon: loc.lon,
    });
    showToast(`Switched active monitoring to ${loc.name}.`, 'success');
  };

  const handleDelete = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await apiClient(`/locations/${id}`, { method: 'DELETE' });
      setLocations((prev) => prev.filter((l) => l._id !== id));
      showToast('Location removed from saved list.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not delete location', 'error');
    }
  };

  const handleAddLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!newCityName.trim()) return;

    setAdding(true);
    try {
      // 1. Search coordinates via geocoding
      const searchRes = await apiClient<{ success: boolean; locations: any[] }>(
        `/locations/search?q=${encodeURIComponent(newCityName)}`
      );

      if (!searchRes.locations || searchRes.locations.length === 0) {
        showToast(`Could not find coordinates for "${newCityName}". Try another city.`, 'error');
        return;
      }

      const match = searchRes.locations[0];

      // 2. Save location
      const saveRes = await apiClient<{ success: boolean; location: SavedLocation }>('/locations/save', {
        method: 'POST',
        bodyData: {
          name: match.name,
          city: match.name,
          country: match.country,
          lat: match.latitude,
          lon: match.longitude,
        },
      });

      if (saveRes.success && saveRes.location) {
        setLocations((prev) => [saveRes.location, ...prev]);
        setNewCityName('');
        showToast(`Saved ${match.name} to your monitoring places.`, 'success');
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to add location', 'error');
    } finally {
      setAdding(false);
    }
  };

  if (!isAuthenticated) {
    return (
      <DashboardLayout>
        <EmptyState
          title="Account Required"
          description="Sign in or register to save your home, office, children's school, or family locations for fast single-click air monitoring."
          icon={<MapPin className="w-8 h-8 text-zinc-400" />}
          action={
            <Link to="/login">
              <Button size="sm">Sign In to Save Locations</Button>
            </Link>
          }
        />
      </DashboardLayout>
    );
  }

  return (
    <DashboardLayout>
      <div className="mb-6 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
          Saved Monitoring Locations
        </h1>
        <p className="text-xs text-zinc-500 dark:text-zinc-400">
          Bookmark home, workplace, parents' residences, or school locations to track differential winter smog exposure.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
        {/* Add Location Form */}
        <div className="lg:col-span-5">
          <Card className="p-5 space-y-4">
            <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
              <Plus className="w-4 h-4 text-emerald-500" />
              Add Monitored Location
            </h3>

            <form onSubmit={handleAddLocation} className="space-y-3">
              <Input
                label="City / Urban Zone"
                placeholder="e.g. Noida, Gurgaon, Pune, Lahore, London"
                value={newCityName}
                onChange={(e) => setNewCityName(e.target.value)}
                leftIcon={<MapPin className="w-4 h-4 text-zinc-400" />}
              />
              <Button type="submit" size="sm" className="w-full justify-center" isLoading={adding}>
                Save Location
              </Button>
            </form>
          </Card>
        </div>

        {/* Saved List */}
        <div className="lg:col-span-7 space-y-3">
          {loading ? (
            <LoadingSpinner label="Fetching saved places..." />
          ) : locations.length === 0 ? (
            <EmptyState
              title="No Saved Locations"
              description="You have not saved any custom locations yet. Use the form on the left to add your primary monitoring cities."
            />
          ) : (
            locations.map((loc) => {
              const isActive =
                Math.abs(activeLocation.lat - loc.lat) < 0.05 &&
                Math.abs(activeLocation.lon - loc.lon) < 0.05;

              return (
                <div
                  key={loc._id}
                  onClick={() => handleSelectLocation(loc)}
                  className={`flex items-center justify-between p-4 rounded-xl border cursor-pointer transition-all ${
                    isActive
                      ? 'border-emerald-500 bg-emerald-500/5 shadow-sm'
                      : 'border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] hover:border-zinc-300 dark:hover:border-zinc-700'
                  }`}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={`p-2 rounded-lg ${
                        isActive
                          ? 'bg-emerald-500 text-white'
                          : 'bg-zinc-100 text-zinc-500 dark:bg-zinc-900 dark:text-zinc-400'
                      }`}
                    >
                      <MapPin className="w-4 h-4" />
                    </div>
                    <div>
                      <div className="flex items-center gap-2">
                        <span className="font-semibold text-sm text-zinc-900 dark:text-zinc-100">
                          {loc.name}
                        </span>
                        {isActive && (
                          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-emerald-500/10 text-emerald-500 font-bold">
                            CURRENTLY MONITORING
                          </span>
                        )}
                      </div>
                      <p className="text-xs text-zinc-400 font-mono">
                        {loc.lat.toFixed(2)}°, {loc.lon.toFixed(2)}°
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <button
                      onClick={(e) => handleDelete(loc._id, e)}
                      className="p-1.5 rounded-lg text-zinc-400 hover:text-red-500 hover:bg-zinc-100 dark:hover:bg-zinc-900 transition-colors"
                      title="Remove location"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>
    </DashboardLayout>
  );
};
