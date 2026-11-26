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
  { id: 101, name: 'Gandhinagar', latitude: 23.2156, longitude: 72.6369, country: 'India', admin1: 'Gujarat' },
  { id: 102, name: 'Ahmedabad', latitude: 23.0225, longitude: 72.5714, country: 'India', admin1: 'Gujarat' },
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

export interface ReverseGeocodeResult {
  name: string;
  city: string;
  state: string;
  country: string;
  latitude: number;
  longitude: number;
  source: string;
}

export const reverseGeocode = async (latitude: number, longitude: number): Promise<ReverseGeocodeResult> => {
  // 1. High precision boundary check for Gandhinagar vs Ahmedabad (Instant, zero-latency detection)
  // Gandhinagar (State Capital of Gujarat) strictly north: lat 23.10 to 23.40, lon 72.50 to 72.78
  if (latitude >= 23.10 && latitude <= 23.40 && longitude >= 72.50 && longitude <= 72.78) {
    return {
      name: 'Gandhinagar',
      city: 'Gandhinagar',
      state: 'Gujarat',
      country: 'India',
      latitude,
      longitude,
      source: 'High-Precision Geographic Coordinates',
    };
  }

  // Ahmedabad: lat 22.90 to 23.099, lon 72.45 to 72.68
  if (latitude >= 22.90 && latitude < 23.10 && longitude >= 72.45 && longitude <= 72.68) {
    return {
      name: 'Ahmedabad',
      city: 'Ahmedabad',
      state: 'Gujarat',
      country: 'India',
      latitude,
      longitude,
      source: 'High-Precision Geographic Coordinates',
    };
  }

  // 2. Google Maps Geocoding API if valid key configured (starts with AIzaSy)
  const googleMapsKey = process.env.GOOGLE_MAPS_API_KEY;
  if (googleMapsKey && googleMapsKey.trim().startsWith('AIzaSy')) {
    try {
      const gUrl = `https://maps.googleapis.com/maps/api/geocode/json?latlng=${latitude},${longitude}&key=${googleMapsKey.trim()}`;
      const gRes = await axios.get(gUrl, { timeout: 3500 });
      if (gRes.data && gRes.data.status === 'OK' && gRes.data.results && gRes.data.results.length > 0) {
        const topResult = gRes.data.results[0];
        let city = '';
        let locality = '';
        let state = '';
        let country = 'India';

        for (const comp of topResult.address_components || []) {
          const types: string[] = comp.types || [];
          if (types.includes('locality')) city = comp.long_name;
          else if (types.includes('sublocality') || types.includes('sublocality_level_1') || types.includes('neighborhood')) locality = comp.long_name;
          else if (types.includes('administrative_area_level_2') && !city) city = comp.long_name;
          else if (types.includes('administrative_area_level_1')) state = comp.long_name;
          else if (types.includes('country')) country = comp.long_name;
        }

        const name = locality && locality !== city ? `${locality}, ${city}` : city || topResult.formatted_address;
        if (city || locality) {
          return {
            name: name || 'Detected Area',
            city: city || locality || 'Current City',
            state,
            country,
            latitude,
            longitude,
            source: 'Google Maps Geocoding Platform',
          };
        }
      }
    } catch (gErr: any) {
      console.warn(`[Geocoding] Google Maps API reverse geocode failed: ${gErr.message}`);
    }
  }

  // 3. High accuracy reverse geocode via BigDataCloud client API
  try {
    const bdcUrl = `https://api.bigdatacloud.net/data/reverse-geocode-client?latitude=${latitude}&longitude=${longitude}&localityLanguage=en`;
    const response = await axios.get(bdcUrl, { timeout: 4000 });
    const data = response.data;
    if (data && (data.city || data.locality || data.principalSubdivision)) {
      const city = data.city || data.locality || data.principalSubdivision;
      const locality = data.locality && data.locality !== city ? data.locality : '';
      const name = locality ? `${locality}, ${city}` : city;
      return {
        name,
        city: data.city || city,
        state: data.principalSubdivision || '',
        country: data.countryName || 'India',
        latitude,
        longitude,
        source: 'BigDataCloud Geocoding',
      };
    }
  } catch (err: any) {
    // Continue to fallback
  }

  // 3. Fallback to OpenStreetMap Nominatim
  try {
    const nominatimUrl = `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}&zoom=14&addressdetails=1`;
    const response = await axios.get(nominatimUrl, {
      timeout: 4000,
      headers: { 'User-Agent': 'ClearAir-AirQualityApp/2.0' },
    });
    const addr = response.data?.address;
    if (addr) {
      const city = addr.city || addr.town || addr.village || addr.municipality || addr.state_district || addr.state || 'Local Area';
      const locality = addr.suburb || addr.neighbourhood || addr.city_district || addr.road || '';
      const name = locality && locality !== city ? `${locality}, ${city}` : city;
      return {
        name,
        city,
        state: addr.state || '',
        country: addr.country || 'India',
        latitude,
        longitude,
        source: 'OpenStreetMap Nominatim',
      };
    }
  } catch (err: any) {
    // Continue to default
  }

  // 4. Default fallback
  return {
    name: `Area (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`,
    city: 'Local Area',
    state: '',
    country: 'India',
    latitude,
    longitude,
    source: 'GPS Coordinates',
  };
};
