import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import {
  Wind,
  MapPin,
  Bell,
  Sun,
  Moon,
  User as UserIcon,
  LogOut,
  Menu,
  X,
  ChevronDown,
  RefreshCw,
  Sparkles,
  CloudFog,
  Navigation,
  Calendar,
  CheckCircle2,
  Settings,
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAQI } from '../../context/AQIContext';
import { calculatePollutionMetrics } from '../../utils/pollutionScale';

interface NavbarProps {
  onOpenLocationModal: () => void;
}

export const Navbar = ({ onOpenLocationModal }: NavbarProps) => {
  const { user, isAuthenticated, logout } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { location, aqiData, refreshAQI, isLoading, unreadAlertCount } = useAQI();
  const [profileDropdownOpen, setProfileDropdownOpen] = useState(false);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const navigate = useNavigate();

  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200 bg-white/95 backdrop-blur-md dark:border-zinc-800 dark:bg-black/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-4 sm:gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400 transition-transform group-hover:scale-105">
              <Wind className="h-5 w-5" />
            </div>
            <span className="text-lg font-bold tracking-tight text-zinc-900 dark:text-white">
              ClearAir
            </span>
          </Link>

          {/* Location Selector Pill */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-700 transition-colors"
            title="Change monitored location"
          >
            <MapPin className="h-3.5 w-3.5 text-sky-500 shrink-0" />
            <span className="max-w-[130px] truncate">{location.name}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>

          {/* Quick Pollution Percentage Badge */}
          {metrics.isDataAvailable && (
            <div
              className={`hidden md:flex items-center gap-1.5 px-2.5 py-1 rounded-full text-xs font-semibold border ${metrics.badgeBg} ${metrics.borderColor} ${metrics.statusColor}`}
            >
              <span className={`w-2 h-2 rounded-full ${metrics.dotColor} animate-pulse`} />
              <span>{metrics.pollutionPercent}% • {metrics.status}</span>
            </div>
          )}
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={refreshAQI}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Refresh pollution readings"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
          </button>

          {/* Theme Switcher Toggle (Pure Black vs Clean White) */}
          <button
            onClick={toggleTheme}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title={`Switch to ${theme === 'dark' ? 'Light' : 'Pure-Black Dark'} theme`}
            aria-label="Toggle theme"
          >
            {theme === 'dark' ? (
              <Sun className="h-4 w-4 text-amber-400" />
            ) : (
              <Moon className="h-4 w-4 text-zinc-700" />
            )}
          </button>

          {/* Alerts Bell */}
          <Link
            to="/alerts"
            className="relative flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Pollution Alerts"
          >
            <Bell className="h-4 w-4" />
            {unreadAlertCount > 0 && (
              <span className="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-600 text-[10px] font-bold text-white ring-2 ring-white dark:ring-black">
                {unreadAlertCount > 9 ? '9+' : unreadAlertCount}
              </span>
            )}
          </Link>

          {/* User Profile or Login CTA */}
          {isAuthenticated && user ? (
            <div className="relative">
              <button
                onClick={() => setProfileDropdownOpen((prev) => !prev)}
                className="flex items-center gap-2 rounded-lg border border-zinc-200 bg-zinc-50 p-1.5 pr-2.5 text-xs font-medium text-zinc-800 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900 dark:text-zinc-200 dark:hover:bg-zinc-800/80 transition-colors"
              >
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-sky-500 text-[11px] font-bold text-white">
                  {user.fullName ? user.fullName.charAt(0).toUpperCase() : 'U'}
                </div>
                <span className="hidden md:inline max-w-[110px] truncate">{user.fullName}</span>
                <ChevronDown className="h-3 w-3 text-zinc-400" />
              </button>

              {profileDropdownOpen && (
                <div
                  className="absolute right-0 mt-2 w-56 rounded-xl border border-zinc-200 bg-white p-2 shadow-xl dark:border-zinc-800 dark:bg-[#0a0a0a] z-50 animate-in fade-in duration-100"
                  onClick={() => setProfileDropdownOpen(false)}
                >
                  <div className="px-3 py-2 border-b border-zinc-100 dark:border-zinc-900">
                    <p className="text-xs font-semibold text-zinc-900 dark:text-zinc-100">{user.fullName}</p>
                    <p className="text-[11px] text-zinc-500 truncate">{user.email}</p>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Profile & Settings
                    </Link>
                  </div>
                  <div className="border-t border-zinc-100 pt-1 dark:border-zinc-900">
                    <button
                      onClick={handleLogout}
                      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-xs text-red-600 hover:bg-red-50 dark:text-red-400 dark:hover:bg-red-950/30"
                    >
                      <LogOut className="h-3.5 w-3.5" />
                      Sign Out
                    </button>
                  </div>
                </div>
              )}
            </div>
          ) : (
            <div className="flex items-center gap-2">
              <Link
                to="/login"
                className="text-xs font-semibold text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white px-3 py-2"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="rounded-lg bg-sky-500 hover:bg-sky-600 text-white px-3.5 py-1.5 text-xs font-semibold shadow-sm transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="lg:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
            aria-label="Open mobile menu"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="lg:hidden border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-black">
          <div className="mb-3 flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200"
            >
              <MapPin className="h-4 w-4 text-sky-500" />
              <span>Location: {location.name}</span>
            </button>
            <span className={`text-xs font-bold ${metrics.statusColor}`}>
              {metrics.pollutionPercent}% {metrics.status}
            </span>
          </div>

          <nav className="flex flex-col space-y-1 text-sm font-medium">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-zinc-100 font-semibold"
            >
              Dashboard
            </Link>
            <Link
              to="/pollution"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <CloudFog className="w-4 h-4 text-sky-500" />
              <span>Air Pollution</span>
            </Link>
            <Link
              to="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-sky-600 dark:text-sky-400 font-semibold"
            >
              <Sparkles className="w-4 h-4 text-sky-500" />
              <span>AI Assistant</span>
            </Link>
            <Link
              to="/alerts"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <Bell className="w-4 h-4" />
              <span>Alerts</span>
            </Link>
            <Link
              to="/travel"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <Navigation className="w-4 h-4" />
              <span>Smart Travel</span>
            </Link>
            <Link
              to="/forecast"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <Calendar className="w-4 h-4" />
              <span>Pollution Forecast</span>
            </Link>
            <Link
              to="/what-to-do"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <CheckCircle2 className="w-4 h-4" />
              <span>What To Do</span>
            </Link>
            <Link
              to="/profile"
              onClick={() => setMobileMenuOpen(false)}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-700 dark:text-zinc-300"
            >
              <Settings className="w-4 h-4" />
              <span>Profile & Settings</span>
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
