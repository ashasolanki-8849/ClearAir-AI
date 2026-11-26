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
  lastUpdatedTime: string;
  setLocation: (loc: LocationCoordinates) => void;
  refreshAQI: () => Promise<void>;
  detectUserLocation: () => Promise<void>;
  refreshAlertCount: () => Promise<void>;
}

const DEFAULT_LOCATION: LocationCoordinates = {
  name: 'Gandhinagar',
  city: 'Gandhinagar',
  lat: 23.2156,
  lon: 72.6369,
};

const AQIContext = createContext<AQIContextType | undefined>(undefined);

export const AQIProvider = ({ children }: { children: ReactNode }) => {
  const { user } = useAuth();
  const { showToast } = useToast();

  const [location, setLocationState] = useState<LocationCoordinates>(() => {
    const saved = localStorage.getItem('clearair_active_location');
    if (saved) {
      try {
        const parsed = JSON.parse(saved);
        // Migration: If cached location was Gandhinagar with Delhi coordinates (28.6139), fix to Gandhinagar (23.2156, 72.6369)
        if (parsed.name === 'Gandhinagar' && Math.abs(parsed.lat - 28.6139) < 0.1) {
          parsed.lat = 23.2156;
          parsed.lon = 72.6369;
          localStorage.setItem('clearair_active_location', JSON.stringify(parsed));
        }
        return parsed;
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
  const [lastUpdatedTime, setLastUpdatedTime] = useState<string>(() =>
    new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
  );

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
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
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

    showToast('Detecting your accurate location...', 'info');
    setIsLoading(true);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedName = 'Current Location';
        let detectedCity = 'Current Area';

        try {
          // Attempt high-precision reverse geocode from backend
          const res = await apiClient<{ success: boolean; location: { name: string; city: string } }>(
            `/locations/reverse?lat=${latitude}&lon=${longitude}`
          );
          if (res.success && res.location) {
            detectedName = res.location.name;
            detectedCity = res.location.city;
          }
        } catch (e) {
          try {
            // Client-side fallback to BigDataCloud
            const bdcRes = await fetch(
              `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`
            );
            const data = await bdcRes.json();
            if (data?.city || data?.locality) {
              detectedCity = data.city || data.locality;
              detectedName = data.locality && data.locality !== data.city ? `${data.locality}, ${detectedCity}` : detectedCity;
            }
          } catch (err) {
            detectedName = `Area (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
          }
        }

        const newLoc: LocationCoordinates = {
          name: detectedName,
          city: detectedCity,
          lat: latitude,
          lon: longitude,
        };

        setLocation(newLoc);
        setLastUpdatedTime(new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' }));
        showToast(`Location confirmed: ${detectedName}`, 'success');

        // Save selected location in MongoDB in background
        apiClient('/locations/save', {
          method: 'POST',
          bodyData: {
            name: detectedName,
            city: detectedCity,
            lat: latitude,
            lon: longitude,
            isDefault: true,
          },
        }).catch(() => {});
      },
      (geoError) => {
        setIsLoading(false);
        let errorMsg = 'We could not find your location. Please select it manually.';
        if (geoError.code === geoError.PERMISSION_DENIED) {
          errorMsg = 'Location access is off. Select your location manually.';
        }
        showToast(errorMsg, 'warning');
      },
      { timeout: 10000, enableHighAccuracy: true, maximumAge: 0 }
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
        lastUpdatedTime,
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
