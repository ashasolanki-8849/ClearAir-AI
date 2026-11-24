import axios from 'axios';

export interface GeocodingResult {
  id: number;
  name: string;
  latitude: number;
  longitude: number;
  country: string;
  admin1?: string; // State or province
  timezone?: string;
}

// Built-in list of prominent smog-prone and major global/Indian cities for instant search & offline reliability
const POPULAR_CITIES: GeocodingResult[] = [
  { id: 1, name: 'New Delhi', latitude: 28.6139, longitude: 77.2090, country: 'India', admin1: 'Delhi' },
  { id: 2, name: 'Mumbai', latitude: 19.0760, longitude: 72.8777, country: 'India', admin1: 'Maharashtra' },
  { id: 3, name: 'Kolkata', latitude: 22.5726, longitude: 88.3639, country: 'India', admin1: 'West Bengal' },
  { id: 4, name: 'Bengaluru', latitude: 12.9716, longitude: 77.5946, country: 'India', admin1: 'Karnataka' },
  { id: 5, name: 'Chennai', latitude: 13.0827, longitude: 80.2707, country: 'India', admin1: 'Tamil Nadu' },
  { id: 6, name: 'Hyderabad', latitude: 17.3850, longitude: 78.4867, country: 'India', admin1: 'Telangana' },
  { id: 7, name: 'Noida', latitude: 28.5355, longitude: 77.3910, country: 'India', admin1: 'Uttar Pradesh' },
  { id: 8, name: 'Gurugram', latitude: 28.4595, longitude: 77.0266, country: 'India', admin1: 'Haryana' },
  { id: 9, name: 'Lahore', latitude: 31.5204, longitude: 74.3587, country: 'Pakistan', admin1: 'Punjab' },
  { id: 10, name: 'Beijing', latitude: 39.9042, longitude: 116.4074, country: 'China', admin1: 'Beijing' },
  { id: 11, name: 'London', latitude: 51.5074, longitude: -0.1278, country: 'United Kingdom', admin1: 'England' },
  { id: 12, name: 'New York', latitude: 40.7128, longitude: -74.0060, country: 'United States', admin1: 'New York' },
  { id: 13, name: 'Tokyo', latitude: 35.6762, longitude: 139.6503, country: 'Japan', admin1: 'Tokyo' },
];

export const searchLocations = async (query: string): Promise<GeocodingResult[]> => {
  if (!query || query.trim().length < 2) {
    return POPULAR_CITIES.slice(0, 6);
  }

  const cleanQuery = query.trim().toLowerCase();

  try {
    const url = `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(
      cleanQuery
    )}&count=10&language=en&format=json`;

    const response = await axios.get(url, { timeout: 5000 });
    if (response.data && response.data.results && response.data.results.length > 0) {
      return response.data.results.map((r: any) => ({
        id: r.id,
        name: r.name,
        latitude: r.latitude,
        longitude: r.longitude,
        country: r.country || '',
        admin1: r.admin1 || '',
        timezone: r.timezone || '',
      }));
    }
  } catch (error: any) {
    console.warn(`Geocoding search API failed for "${query}": ${error.message}. Using offline matches.`);
  }

  // Fallback to internal match if API fails or yields no results
  const matches = POPULAR_CITIES.filter(
    (c) =>
      c.name.toLowerCase().includes(cleanQuery) ||
      (c.admin1 && c.admin1.toLowerCase().includes(cleanQuery)) ||
      c.country.toLowerCase().includes(cleanQuery)
  );

  return matches.length > 0 ? matches : POPULAR_CITIES.slice(0, 5);
};
