import { useState } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { useAuth } from '../context/AuthContext';
import { useTheme } from '../context/ThemeContext';
import { useAQI } from '../context/AQIContext';
import { useToast } from '../context/ToastContext';
import { LocationSelectorModal } from '../components/dashboard/LocationSelectorModal';
import {
  User,
  Sun,
  Moon,
  MapPin,
  Mail,
  Bell,
  Globe,
  LogOut,
  Save,
  CheckCircle2,
  Compass,
} from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';

export const ProfilePage = () => {
  const { user, isAuthenticated, logout, updateUserProfile } = useAuth();
  const { theme, toggleTheme } = useTheme();
  const { location, detectUserLocation } = useAQI();
  const { showToast } = useToast();
  const navigate = useNavigate();

  const [fullName, setFullName] = useState(user?.fullName || '');
  const [ageGroup, setAgeGroup] = useState(user?.ageGroup || '18_35');
  const [notificationsEnabled, setNotificationsEnabled] = useState(true);
  const [language, setLanguage] = useState(() => {
    return localStorage.getItem('clearair_language') || 'en';
  });
  const [saving, setSaving] = useState(false);
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  const handleUpdate = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!fullName.trim()) return;

    setSaving(true);
    try {
      await updateUserProfile({
        fullName: fullName.trim(),
        ageGroup: ageGroup as any,
      });
      showToast('Profile settings saved successfully.', 'success');
    } catch (e: any) {
      showToast(e.message || 'Could not save profile.', 'error');
    } finally {
      setSaving(false);
    }
  };

  const handleLanguageChange = (lang: string) => {
    setLanguage(lang);
    localStorage.setItem('clearair_language', lang);
    showToast(`Language updated to ${lang === 'hi' ? 'Hindi' : lang === 'gu' ? 'Gujarati' : 'English'}.`, 'info');
  };

  const handleLogout = () => {
    logout();
    navigate('/');
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-3xl mx-auto">
        {/* Header */}
        <div className="pb-4 border-b border-zinc-200 dark:border-zinc-800">
          <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white flex items-center gap-2.5">
            <User className="w-7 h-7 text-sky-500" />
            <span>Profile & Settings</span>
          </h1>
          <p className="mt-1 text-xs sm:text-sm text-zinc-500 dark:text-zinc-400">
            Manage your personal preferences, selected location, and notification settings.
          </p>
        </div>

        {/* 1. Account Details Form */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-5">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Personal Information
          </h2>

          <form onSubmit={handleUpdate} className="space-y-4 text-xs">
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Full Name
                </label>
                <input
                  type="text"
                  required
                  value={fullName}
                  onChange={(e) => setFullName(e.target.value)}
                  className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
                />
              </div>

              <div>
                <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                  Email Address (Read-only)
                </label>
                <div className="relative">
                  <input
                    type="email"
                    disabled
                    value={user?.email || 'guest@clearair.org'}
                    className="w-full px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-100 dark:bg-zinc-900/60 text-zinc-500 dark:text-zinc-400 cursor-not-allowed"
                  />
                </div>
              </div>
            </div>

            <div>
              <label className="block font-medium text-zinc-700 dark:text-zinc-300 mb-1">
                Age Group
              </label>
              <select
                value={ageGroup}
                onChange={(e) => setAgeGroup(e.target.value as any)}
                className="w-full sm:w-1/2 px-3.5 py-2.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white focus:outline-none focus:ring-2 focus:ring-sky-500"
              >
                <option value="under_18">Under 18 (Student)</option>
                <option value="18_35">18 - 35 (Young Adult)</option>
                <option value="36_60">36 - 60 (Adult / Parent)</option>
                <option value="above_60">Above 60 (Senior Citizen)</option>
              </select>
            </div>

            <button
              type="submit"
              disabled={saving}
              className="inline-flex items-center gap-2 px-5 py-2.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors shadow-sm disabled:opacity-50"
            >
              <Save className="w-3.5 h-3.5" />
              <span>{saving ? 'Saving...' : 'Save Changes'}</span>
            </button>
          </form>
        </div>

        {/* 2. Selected Location & Permissions */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-4 text-xs">
          <div className="flex items-center justify-between">
            <div>
              <h2 className="text-base font-bold text-zinc-900 dark:text-white">
                Selected Location
              </h2>
              <p className="text-zinc-500 dark:text-zinc-400 mt-0.5">
                The city or area used to fetch nearby pollution levels and routes.
              </p>
            </div>

            <button
              onClick={() => setLocationModalOpen(true)}
              className="px-3.5 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-xs font-semibold text-sky-600 dark:text-sky-400"
            >
              Change Location
            </button>
          </div>

          <div className="p-4 rounded-2xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-100 dark:border-zinc-900 flex items-center justify-between">
            <div className="flex items-center gap-2.5">
              <MapPin className="w-4 h-4 text-sky-500" />
              <span className="font-semibold text-zinc-900 dark:text-white">{location.name}</span>
            </div>

            <button
              onClick={detectUserLocation}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-sky-500"
            >
              <Compass className="w-3.5 h-3.5" />
              <span>Re-detect GPS</span>
            </button>
          </div>
        </div>

        {/* 3. Preferences: Theme, Notifications, Language */}
        <div className="p-6 rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-5 text-xs">
          <h2 className="text-base font-bold text-zinc-900 dark:text-white">
            Preferences
          </h2>

          <div className="space-y-4 divide-y divide-zinc-100 dark:divide-zinc-900">
            {/* Dark Mode Toggle */}
            <div className="pt-3 first:pt-0 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">Theme Mode</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Switch between pure black dark mode and clean white light mode.
                </p>
              </div>

              <button
                onClick={toggleTheme}
                className="inline-flex items-center gap-2 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 font-medium"
              >
                {theme === 'dark' ? (
                  <>
                    <Moon className="w-4 h-4 text-sky-400" />
                    <span>Pure Black</span>
                  </>
                ) : (
                  <>
                    <Sun className="w-4 h-4 text-amber-500" />
                    <span>Clean White</span>
                  </>
                )}
              </button>
            </div>

            {/* Notification Alerts */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">Pollution Alerts</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Receive warnings when pollution reaches High or Very High levels.
                </p>
              </div>

              <button
                onClick={() => setNotificationsEnabled((prev) => !prev)}
                className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                  notificationsEnabled ? 'bg-sky-500' : 'bg-zinc-300 dark:bg-zinc-700'
                }`}
              >
                <span
                  className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                    notificationsEnabled ? 'translate-x-6' : 'translate-x-1'
                  }`}
                />
              </button>
            </div>

            {/* Language Selector */}
            <div className="pt-3 flex items-center justify-between">
              <div>
                <p className="font-semibold text-zinc-900 dark:text-white">Language</p>
                <p className="text-zinc-500 dark:text-zinc-400">
                  Display language for tips and AI Assistant advice.
                </p>
              </div>

              <select
                value={language}
                onChange={(e) => handleLanguageChange(e.target.value)}
                className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white"
              >
                <option value="en">English</option>
                <option value="hi">Hindi (हिन्दी)</option>
                <option value="gu">Gujarati (ગુજરાતી)</option>
              </select>
            </div>
          </div>
        </div>

        {/* 4. Logout Card */}
        {isAuthenticated && (
          <div className="p-6 rounded-3xl border border-red-500/20 bg-red-50/20 dark:bg-red-950/10 flex items-center justify-between">
            <div>
              <p className="font-bold text-xs text-red-600 dark:text-red-400">Sign Out</p>
              <p className="text-[11px] text-zinc-500 dark:text-zinc-400">
                Sign out of your account on this browser.
              </p>
            </div>

            <button
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-red-600 hover:bg-red-700 text-white font-semibold text-xs transition-colors shadow-sm"
            >
              <LogOut className="w-3.5 h-3.5" />
              <span>Sign Out</span>
            </button>
          </div>
        )}
      </div>

      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </DashboardLayout>
  );
};
