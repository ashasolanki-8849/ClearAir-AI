import { ReactNode, createContext, useContext, useEffect, useState, useCallback } from 'react';
import { AQIData } from '../types';
import { apiClient } from '../services/api';
import { useAuth } from './AuthContext';
import { useToast } from './ToastContext';

export interface LocationCoordinates {
  name: string;
  city: string;
  lat: number;
  lon: number;
}

interface AQIContextType {
  location: LocationCoordinates;
  aqiData: AQIData | null;
  isLoading: boolean;
  error: string | null;
  unreadAlertCount: number;
  setLocation: (loc: LocationCoordinates) => void;
  refreshAQI: () => Promise<void>;
  detectUserLocation: () => Promise<void>;
  refreshAlertCount: () => Promise<void>;
}

const DEFAULT_LOCATION: LocationCoordinates = {
  name: 'New Delhi',
  city: 'Delhi',
  lat: 28.6139,
  lon: 77.2090,
};

const AQIContext = createContext<AQIContextType | undefined>(undefined);

export const AQIProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [location, setLocationState] = useState<LocationCoordinates>(() => {
    const saved = localStorage.getItem('clearair_active_location');
    if (saved) {
      try {
        return JSON.parse(saved);
      } catch (e) {
        // ignore
      }
    }
    return DEFAULT_LOCATION;
  });

  const [aqiData, setAqiData] = useState<AQIData | null>(null);
  const [isLoading, setIsLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [unreadAlertCount, setUnreadAlertCount] = useState<number>(0);

  // Sync with user's preferred location on login
  useEffect(() => {
    if (user?.preferredLocation && user.preferredLocation.lat && user.preferredLocation.lon) {
      const userLoc: LocationCoordinates = {
        name: user.preferredLocation.name || user.city || 'Home City',
        city: user.city || 'Home City',
        lat: user.preferredLocation.lat,
        lon: user.preferredLocation.lon,
      };
      setLocationState(userLoc);
      localStorage.setItem('clearair_active_location', JSON.stringify(userLoc));
    }
  }, [user]);

  const fetchAQIData = useCallback(async (loc: LocationCoordinates, silent: boolean = false) => {
    if (!silent) setIsLoading(true);
    setError(null);

    try {
      const queryParams = new URLSearchParams({
        lat: loc.lat.toString(),
        lon: loc.lon.toString(),
        name: loc.name,
        city: loc.city,
      });

      const response = await apiClient<{ success: boolean; data: AQIData }>(`/air-quality/current?${queryParams.toString()}`);
      if (response.success && response.data) {
        setAqiData(response.data);
      }
    } catch (err: any) {
      console.error('AQI fetch error:', err);
      setError(err.message || 'Unable to fetch air quality data');
      showToast('Could not fetch real-time air quality data. Please check network connection.', 'error');
    } finally {
      setIsLoading(false);
    }
  }, [showToast]);

  const refreshAlertCount = useCallback(async () => {
    try {
      const res = await apiClient<{ success: boolean; unreadCount: number }>('/alerts');
      if (res.success && typeof res.unreadCount === 'number') {
        setUnreadAlertCount(res.unreadCount);
      }
    } catch (e) {
      // ignore
    }
  }, []);

  // Fetch AQI when location changes
  useEffect(() => {
    fetchAQIData(location);
    refreshAlertCount();
  }, [location, fetchAQIData, refreshAlertCount]);

  // Periodic refresh every 5 minutes
  useEffect(() => {
    const timer = setInterval(() => {
      fetchAQIData(location, true);
      refreshAlertCount();
    }, 1000 * 60 * 5);
    return () => clearInterval(timer);
  }, [location, fetchAQIData, refreshAlertCount]);

  const setLocation = (newLoc: LocationCoordinates) => {
    setLocationState(newLoc);
    localStorage.setItem('clearair_active_location', JSON.stringify(newLoc));
    showToast(`Monitoring switched to ${newLoc.name}`, 'info');
  };

  const refreshAQI = async () => {
    showToast('Refreshing real-time AQI readings...', 'info');
    await fetchAQIData(location);
    await refreshAlertCount();
    showToast('Air quality readings updated.', 'success');
  };

  const detectUserLocation = async () => {
    if (!navigator.geolocation) {
      showToast('Geolocation is not supported by your browser.', 'warning');
      return;
    }

    showToast('Detecting your GPS location...', 'info');
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedName = 'Your GPS Location';

        try {
          // Attempt reverse geocoding via Open-Meteo
          const geoRes = await fetch(
            `https://geocoding-api.open-meteo.com/v1/search?name=${latitude.toFixed(2)},${longitude.toFixed(2)}&count=1`
          );
          const geoData = await geoRes.json();
          if (geoData?.results?.[0]?.name) {
            detectedName = geoData.results[0].name;
          }
        } catch (e) {
          // Fallback to coordinates label
          detectedName = `Local (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
        }

        const newLoc: LocationCoordinates = {
          name: detectedName,
          city: detectedName,
          lat: latitude,
          lon: longitude,
        };

        setLocation(newLoc);
        showToast(`GPS location detected: ${detectedName}`, 'success');
      },
      (geoError) => {
        setIsLoading(false);
        let errorMsg = 'Could not access GPS location.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMsg = 'Location permission was denied. You can select your city manually.';
        }
        showToast(errorMsg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  return (
    <AQIContext.Provider
      value={{
        location,
        aqiData,
        isLoading,
        error,
        unreadAlertCount,
        setLocation,
        refreshAQI,
        detectUserLocation,
        refreshAlertCount,
      }}
    >
      {children}
    </AQIContext.Provider>
  );
};

export const useAQI = (): AQIContextType => {
  const context = useContext(AQIContext);
  if (!context) {
    throw new Error('useAQI must be used within an AQIProvider');
  }
  return context;
};
