import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';
import { useAQI } from '../context/AQIContext';
import { Wind, Lock, Mail, User, MapPin, CheckCircle2, Search, ArrowRight, AlertCircle, Compass } from 'lucide-react';

const POPULAR_CITIES = [
  { name: 'New Delhi', city: 'Delhi', lat: 28.6139, lon: 77.2090 },
  { name: 'Mumbai', city: 'Mumbai', lat: 19.0760, lon: 72.8777 },
  { name: 'Bengaluru', city: 'Bengaluru', lat: 12.9716, lon: 77.5946 },
  { name: 'Kolkata', city: 'Kolkata', lat: 22.5726, lon: 88.3639 },
  { name: 'Chennai', city: 'Chennai', lat: 13.0827, lon: 80.2707 },
  { name: 'Hyderabad', city: 'Hyderabad', lat: 17.3850, lon: 78.4867 },
  { name: 'Ahmedabad', city: 'Ahmedabad', lat: 23.0225, lon: 72.5714 },
  { name: 'Pune', city: 'Pune', lat: 18.5204, lon: 73.8567 },
  { name: 'Lucknow', city: 'Lucknow', lat: 26.8467, lon: 80.9462 },
  { name: 'Jaipur', city: 'Jaipur', lat: 26.9124, lon: 75.7873 },
];

export const Register = () => {
  const [fullName, setFullName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [ageGroup, setAgeGroup] = useState('18_35');
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Post-registration step
  const [accountReady, setAccountReady] = useState(false);
  const [detectingLocation, setDetectingLocation] = useState(false);
  const [locationError, setLocationError] = useState<string | null>(null);
  const [manualMode, setManualMode] = useState(false);
  const [manualSearch, setManualSearch] = useState('');
  const [searchResults, setSearchResults] = useState<Array<{ name: string; city: string; lat: number; lon: number }>>([]);
  const [searching, setSearching] = useState(false);

  const { register } = useAuth();
  const { setLocation } = useAQI();
  const navigate = useNavigate();

  const handleRegisterSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError(null);

    if (!fullName.trim() || !email.trim() || !password.trim()) {
      setError('Please fill in all required fields.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    setLoading(true);
    try {
      await register({
        fullName: fullName.trim(),
        email: email.trim(),
        password,
        ageGroup,
        userCategory: 'family',
        city: 'New Delhi',
      });
      // Show explicit "Your account is ready!" screen
      setAccountReady(true);
    } catch (err: any) {
      setError(err.message || 'Registration failed. Please check your details.');
    } finally {
      setLoading(false);
    }
  };

  // Browser Geolocation Permission handler
  const handleAllowLocation = () => {
    if (!navigator.geolocation) {
      setLocationError('Location not found. Please select your location.');
      setManualMode(true);
      return;
    }

    setDetectingLocation(true);
    setLocationError(null);

    navigator.geolocation.getCurrentPosition(
      async (position) => {
        const { latitude, longitude } = position.coords;
        let detectedCity = 'Current Area';
        let detectedName = 'Your Location';

        try {
          // Reverse geocode using Open-Meteo geocoding search
          const geoRes = await fetch(
            `https://nominatim.openstreetmap.org/reverse?format=json&lat=${latitude}&lon=${longitude}`
          );
          if (geoRes.ok) {
            const data = await geoRes.json();
            const addr = data.address;
            const area = addr.suburb || addr.neighbourhood || addr.city_district || addr.road;
            const city = addr.city || addr.town || addr.state_district || addr.state;
            if (area && city) {
              detectedName = `${area}, ${city}`;
              detectedCity = city;
            } else if (city) {
              detectedName = city;
              detectedCity = city;
            }
          }
        } catch (e) {
          detectedName = `Area (${latitude.toFixed(2)}°, ${longitude.toFixed(2)}°)`;
        }

        setLocation({
          name: detectedName,
          city: detectedCity,
          lat: latitude,
          lon: longitude,
        });

        setDetectingLocation(false);
        navigate('/dashboard');
      },
      (geoError) => {
        setDetectingLocation(false);
        setLocationError('Location not found. Please select your location.');
        setManualMode(true);
      },
      { timeout: 10000, enableHighAccuracy: true }
    );
  };

  const handleSelectCity = (cityObj: { name: string; city: string; lat: number; lon: number }) => {
    setLocation(cityObj);
    navigate('/dashboard');
  };

  const handleSearchLocation = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!manualSearch.trim()) return;

    try {
      setSearching(true);
      setLocationError(null);
      const res = await fetch(
        `https://geocoding-api.open-meteo.com/v1/search?name=${encodeURIComponent(manualSearch.trim())}&count=5&language=en&format=json`
      );
      const data = await res.json();
      if (data?.results && data.results.length > 0) {
        setSearchResults(
          data.results.map((r: any) => ({
            name: `${r.name}${r.admin1 ? `, ${r.admin1}` : ''}`,
            city: r.name,
            lat: r.latitude,
            lon: r.longitude,
          }))
        );
      } else {
        setSearchResults([]);
        setLocationError('Location not found. Please select your location.');
      }
    } catch (e) {
      setLocationError('Could not search location. Please pick from popular cities below.');
    } finally {
      setSearching(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center p-4 bg-white dark:bg-black py-12 transition-colors">
      <div className="w-full max-w-md space-y-6">
        {/* Brand header */}
        <div className="text-center space-y-2">
          <Link to="/" className="inline-flex items-center gap-2 group">
            <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400">
              <Wind className="h-5 w-5" />
            </div>
            <span className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
              ClearAir
            </span>
          </Link>
        </div>

        {/* Post-Signup Location Step */}
        {accountReady ? (
          <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-lg space-y-6 text-center">
            <div className="inline-flex p-3 rounded-full bg-sky-50 dark:bg-sky-950/30 text-sky-500">
              <CheckCircle2 className="w-10 h-10" />
            </div>

            <div className="space-y-1.5">
              <h2 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Your account is ready!
              </h2>
              <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 leading-relaxed max-w-xs mx-auto">
                Allow location access to check pollution near you and find safer routes.
              </p>
            </div>

            {locationError && (
              <div className="p-3.5 rounded-xl border border-amber-500/30 bg-amber-50 dark:bg-amber-950/20 text-amber-700 dark:text-amber-400 text-xs flex items-center gap-2 text-left">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{locationError}</span>
              </div>
            )}

            {!manualMode ? (
              <div className="space-y-3 pt-2">
                <button
                  onClick={handleAllowLocation}
                  disabled={detectingLocation}
                  className="w-full inline-flex items-center justify-center gap-2 py-3.5 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm transition-colors shadow-sm disabled:opacity-50"
                >
                  <MapPin className="w-4 h-4" />
                  <span>{detectingLocation ? 'Detecting Location...' : 'Allow Location'}</span>
                </button>

                <button
                  onClick={() => setManualMode(true)}
                  className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300 font-semibold text-xs transition-colors"
                >
                  <Search className="w-3.5 h-3.5" />
                  <span>Enter Location Manually</span>
                </button>
              </div>
            ) : (
              <div className="space-y-4 pt-2 text-left">
                <form onSubmit={handleSearchLocation} className="flex gap-2">
                  <input
                    type="text"
                    value={manualSearch}
                    onChange={(e) => setManualSearch(e.target.value)}
                    placeholder="Search your city or neighborhood..."
                    className="flex-1 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white text-xs focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                  <button
                    type="submit"
                    disabled={searching}
                    className="px-4 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs"
                  >
                    {searching ? '...' : 'Search'}
                  </button>
                </form>

                {searchResults.length > 0 && (
                  <div className="space-y-1.5 max-h-40 overflow-y-auto">
                    {searchResults.map((r, i) => (
                      <button
                        key={i}
                        onClick={() => handleSelectCity(r)}
                        className="w-full p-2.5 rounded-xl text-left text-xs bg-zinc-50 dark:bg-zinc-900 hover:bg-sky-50 dark:hover:bg-sky-950/30 flex items-center justify-between"
                      >
                        <span className="font-medium text-zinc-800 dark:text-zinc-200 truncate">{r.name}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400" />
                      </button>
                    ))}
                  </div>
                )}

                <div>
                  <p className="text-[11px] font-semibold text-zinc-400 uppercase tracking-wider mb-2">
                    Or pick a major city:
                  </p>
                  <div className="grid grid-cols-2 gap-2 max-h-36 overflow-y-auto">
                    {POPULAR_CITIES.map((c) => (
                      <button
                        key={c.name}
                        onClick={() => handleSelectCity(c)}
                        className="p-2 rounded-xl text-left text-xs bg-zinc-50 dark:bg-zinc-900 hover:border-sky-500 border border-transparent text-zinc-700 dark:text-zinc-300"
                      >
                        {c.name}
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            )}
          </div>
        ) : (
          /* Initial Signup Form */
          <div className="p-6 sm:p-8 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-lg space-y-5">
            <div>
              <h2 className="text-xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Create Free Account
              </h2>
              <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
                Stay updated with pollution near you and protect your family.
              </p>
            </div>

            {error && (
              <div className="p-3.5 rounded-xl border border-red-500/20 bg-red-50 dark:bg-red-950/20 text-red-600 dark:text-red-400 text-xs flex items-center gap-2">
                <AlertCircle className="w-4 h-4 shrink-0" />
                <span>{error}</span>
              </div>
            )}

            <form onSubmit={handleRegisterSubmit} className="space-y-4 text-xs">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <div className="relative">
                  <User className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="text"
                    required
                    value={fullName}
                    onChange={(e) => setFullName(e.target.value)}
                    placeholder="e.g. Ramesh Kumar"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address
                </label>
                <div className="relative">
                  <Mail className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="email"
                    required
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    placeholder="you@domain.com"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Password (minimum 6 characters)
                </label>
                <div className="relative">
                  <Lock className="absolute left-3.5 top-3 w-4 h-4 text-zinc-400" />
                  <input
                    type="password"
                    required
                    minLength={6}
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    placeholder="••••••••"
                    className="w-full pl-10 pr-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                  />
                </div>
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Age Group (Optional)
                </label>
                <select
                  value={ageGroup}
                  onChange={(e) => setAgeGroup(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                >
                  <option value="under_18">Under 18 (Student)</option>
                  <option value="18_35">18 - 35 (Young Adult)</option>
                  <option value="36_60">36 - 60 (Adult / Parent)</option>
                  <option value="above_60">Above 60 (Senior Citizen)</option>
                </select>
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full inline-flex items-center justify-center gap-2 py-3 px-4 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
              >
                <span>{loading ? 'Creating account...' : 'Create Account'}</span>
                <ArrowRight className="w-3.5 h-3.5" />
              </button>
            </form>

            <div className="pt-2 text-center text-xs text-zinc-500">
              Already have an account?{' '}
              <Link to="/login" className="text-sky-500 font-semibold hover:underline">
                Sign in
              </Link>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};
