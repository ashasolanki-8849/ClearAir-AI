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
} from 'lucide-react';
import { useAuth } from '../../context/AuthContext';
import { useTheme } from '../../context/ThemeContext';
import { useAQI } from '../../context/AQIContext';

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

  const handleLogout = () => {
    logout();
    setProfileDropdownOpen(false);
    navigate('/');
  };

  return (
    <header className="sticky top-0 z-40 w-full border-b border-zinc-200/80 bg-white/95 backdrop-blur-md dark:border-zinc-800/80 dark:bg-black/95">
      <div className="mx-auto flex h-16 max-w-7xl items-center justify-between px-4 sm:px-6 lg:px-8">
        {/* Left: Brand Logo */}
        <div className="flex items-center gap-6">
          <Link to="/" className="flex items-center gap-2.5 group">
            <div className="flex h-9 w-9 items-center justify-center rounded-lg bg-zinc-900 text-white dark:bg-zinc-100 dark:text-black transition-transform group-hover:scale-105">
              <Wind className="h-5 w-5" />
            </div>
            <div className="flex flex-col">
              <span className="text-base font-bold tracking-tight text-zinc-900 dark:text-white">
                ClearAir <span className="text-emerald-500 font-mono text-sm">AI</span>
              </span>
              <span className="text-[10px] font-medium uppercase tracking-wider text-zinc-400">
                Smog Guardian
              </span>
            </div>
          </Link>

          {/* Location Selector Pill */}
          <button
            onClick={onOpenLocationModal}
            className="hidden sm:flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1.5 text-xs font-medium text-zinc-700 hover:border-zinc-300 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/80 dark:text-zinc-200 dark:hover:border-zinc-700 transition-colors"
            title="Change monitored city"
          >
            <MapPin className="h-3.5 w-3.5 text-emerald-500 shrink-0" />
            <span className="max-w-[140px] truncate">{location.name}</span>
            <ChevronDown className="h-3 w-3 text-zinc-400" />
          </button>
        </div>

        {/* Right Action Icons & Auth */}
        <div className="flex items-center gap-2 sm:gap-3">
          {/* Refresh Button */}
          <button
            onClick={refreshAQI}
            disabled={isLoading}
            className="flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900 dark:hover:text-zinc-200 transition-colors"
            title="Refresh live AQI"
          >
            <RefreshCw className={`h-4 w-4 ${isLoading ? 'animate-spin text-emerald-500' : ''}`} />
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
                <div className="flex h-6 w-6 items-center justify-center rounded-full bg-zinc-800 text-[11px] font-bold text-white dark:bg-zinc-200 dark:text-black">
                  {user.fullName.charAt(0).toUpperCase()}
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
                    <span className="mt-1.5 inline-block text-[10px] font-mono uppercase px-2 py-0.5 rounded bg-zinc-100 dark:bg-zinc-900 text-emerald-600 dark:text-emerald-400">
                      {user.userCategory}
                    </span>
                  </div>
                  <div className="py-1">
                    <Link
                      to="/dashboard"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Dashboard
                    </Link>
                    <Link
                      to="/assistant"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Smart Smog Assistant
                    </Link>
                    <Link
                      to="/planner"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      My Daily Planner
                    </Link>
                    <Link
                      to="/indoor"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      Indoor Air Guide
                    </Link>
                    <Link
                      to="/profile"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <UserIcon className="h-3.5 w-3.5" />
                      Profile & Settings
                    </Link>
                    <Link
                      to="/locations"
                      className="flex items-center gap-2 rounded-md px-3 py-2 text-xs text-zinc-700 hover:bg-zinc-100 dark:text-zinc-300 dark:hover:bg-zinc-900"
                    >
                      <MapPin className="h-3.5 w-3.5" />
                      Saved Locations
                    </Link>
                  </div>
                  <div className="pt-1 border-t border-zinc-100 dark:border-zinc-900">
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
                className="hidden sm:inline-flex items-center justify-center rounded-lg px-3 py-1.5 text-xs font-medium text-zinc-700 hover:text-zinc-900 dark:text-zinc-300 dark:hover:text-white"
              >
                Sign In
              </Link>
              <Link
                to="/register"
                className="inline-flex items-center justify-center rounded-lg bg-zinc-900 px-3.5 py-1.5 text-xs font-medium text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 transition-colors"
              >
                Get Started
              </Link>
            </div>
          )}

          {/* Mobile Menu Button */}
          <button
            onClick={() => setMobileMenuOpen((prev) => !prev)}
            className="sm:hidden flex h-9 w-9 items-center justify-center rounded-lg border border-zinc-200 text-zinc-600 hover:bg-zinc-100 dark:border-zinc-800 dark:text-zinc-400 dark:hover:bg-zinc-900"
          >
            {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
          </button>
        </div>
      </div>

      {/* Mobile Drawer */}
      {mobileMenuOpen && (
        <div className="sm:hidden border-b border-zinc-200 bg-white px-4 py-4 dark:border-zinc-800 dark:bg-[#080808]">
          <div className="mb-3 flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
            <button
              onClick={() => {
                onOpenLocationModal();
                setMobileMenuOpen(false);
              }}
              className="flex items-center gap-2 text-xs font-medium text-zinc-800 dark:text-zinc-200"
            >
              <MapPin className="h-4 w-4 text-emerald-500" />
              <span>Location: {location.name}</span>
            </button>
          </div>
          <nav className="flex flex-col space-y-2 text-sm">
            <Link
              to="/dashboard"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Dashboard
            </Link>
            <Link
              to="/assistant"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Smart Smog Assistant
            </Link>
            <Link
              to="/planner"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              My Daily Planner
            </Link>
            <Link
              to="/indoor"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Indoor Air Guide
            </Link>
            <Link
              to="/travel"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Smart Travel Planner
            </Link>
            <Link
              to="/forecast"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Pollution Forecast
            </Link>
            <Link
              to="/sustainability"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Sustainable Advisor
            </Link>
            <Link
              to="/community"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Community & Society
            </Link>
            <Link
              to="/pollutants"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Pollutant Breakdown
            </Link>
            <Link
              to="/alerts"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Alerts & Notifications
            </Link>
            <Link
              to="/locations"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900"
            >
              Saved Locations
            </Link>
            <Link
              to="/roadmap"
              onClick={() => setMobileMenuOpen(false)}
              className="rounded-lg px-3 py-2 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-emerald-600 dark:text-emerald-400 font-medium"
            >
              Future Modules (2–10)
            </Link>
          </nav>
        </div>
      )}
    </header>
  );
};
