import { useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Sparkles,
  CloudFog,
  Bell,
  Navigation,
  Calendar,
  CheckCircle2,
  Settings,
  MapPin,
  ArrowRight,
  Send,
  User,
  ShieldCheck,
  RefreshCw,
  Users,
  Home,
  MessageSquare,
  Map,
} from 'lucide-react';

export const Dashboard = () => {
  const { aqiData, location, isLoading, refreshAQI } = useAQI();
  const { user } = useAuth();
  const [quickQuestion, setQuickQuestion] = useState('');
  const navigate = useNavigate();

  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const samplePrompts = [
    'Is it safe to go outside today?',
    'What should I do in high pollution?',
    'How can I protect my family from smog?',
    'Should I exercise outside today?',
    'How can I reduce pollution inside my home?',
  ];

  const handleAskAssistant = (promptText?: string) => {
    const q = promptText || quickQuestion;
    if (!q.trim()) return;
    navigate('/assistant', { state: { initialQuery: q } });
  };

  return (
    <DashboardLayout>
      <div className="space-y-8 max-w-6xl mx-auto">
        {/* Top Header Bar as strictly specified */}
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-200 dark:border-zinc-800">
          <div>
            <div className="flex items-center gap-3">
              <h1 className="text-2xl sm:text-3xl font-extrabold tracking-tight text-zinc-900 dark:text-white">
                Hello{user?.fullName ? `, ${user.fullName.split(' ')[0]}` : '!'}
              </h1>
              {metrics.isDataAvailable && (
                <span
                  className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full text-xs font-bold border ${metrics.badgeBg} ${metrics.borderColor} ${metrics.statusColor}`}
                >
                  <span className={`w-2 h-2 rounded-full ${metrics.dotColor}`} />
                  <span>Pollution: {metrics.pollutionPercent}% • {metrics.status}</span>
                </span>
              )}
            </div>

            {/* Current Location */}
            <div className="flex items-center gap-2 mt-1.5 text-xs text-zinc-500 dark:text-zinc-400">
              <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
              <span>Current location:</span>
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">
                {location.name}
              </span>
            </div>
          </div>

          {/* Quick Icons: Refresh, Alerts, Profile */}
          <div className="flex items-center gap-2 self-start sm:self-auto">
            <button
              onClick={refreshAQI}
              disabled={isLoading}
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Refresh readings"
            >
              <RefreshCw className={`w-4 h-4 ${isLoading ? 'animate-spin text-sky-500' : ''}`} />
            </button>

            <Link
              to="/alerts"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Pollution Alerts"
            >
              <Bell className="w-4 h-4" />
            </Link>

            <Link
              to="/profile"
              className="p-2 rounded-xl border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-400 transition-colors"
              title="Profile & Settings"
            >
              <User className="w-4 h-4" />
            </Link>
          </div>
        </div>

        {/* QUICK ACTION BUTTONS */}
        <div className="flex flex-wrap items-center gap-2.5 pt-1">
          <Link
            to="/pollution"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white text-xs font-semibold shadow-sm transition-colors"
          >
            <CloudFog className="w-3.5 h-3.5" />
            <span>Check Pollution</span>
          </Link>
          <Link
            to="/assistant"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Sparkles className="w-3.5 h-3.5 text-sky-500" />
            <span>Ask AI</span>
          </Link>
          <Link
            to="/pollution"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Map className="w-3.5 h-3.5 text-sky-500" />
            <span>View Map</span>
          </Link>
          <Link
            to="/travel"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Navigation className="w-3.5 h-3.5 text-sky-500" />
            <span>Find Route</span>
          </Link>
          <Link
            to="/forecast"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Calendar className="w-3.5 h-3.5 text-sky-500" />
            <span>See Forecast</span>
          </Link>
          <Link
            to="/family"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Users className="w-3.5 h-3.5 text-sky-500" />
            <span>Protect My Family</span>
          </Link>
          <Link
            to="/indoor"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <Home className="w-3.5 h-3.5 text-sky-500" />
            <span>Improve Indoor Air</span>
          </Link>
          <Link
            to="/community"
            className="inline-flex items-center gap-1.5 px-3.5 py-2 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-500 text-zinc-800 dark:text-zinc-200 text-xs font-semibold shadow-2xs transition-colors"
          >
            <MessageSquare className="w-3.5 h-3.5 text-sky-500" />
            <span>Community Hub</span>
          </Link>
        </div>

        {/* FEATURE 2: LARGE, PROMINENT AI ASSISTANT SECTION NEAR TOP */}
        <div className="p-6 sm:p-8 rounded-3xl border border-sky-200 dark:border-zinc-800 bg-sky-50/60 dark:bg-zinc-950 shadow-sm space-y-5">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3">
            <div className="flex items-center gap-3">
              <div className="p-3 rounded-2xl bg-sky-500 text-white shadow-md shadow-sky-500/20">
                <Sparkles className="w-6 h-6" />
              </div>
              <div>
                <h2 className="text-lg sm:text-xl font-bold text-zinc-900 dark:text-white">
                  AI Assistant
                </h2>
                <p className="text-xs text-zinc-600 dark:text-zinc-400">
                  Ask any question about smog, outdoor safety, and protecting your family today.
                </p>
              </div>
            </div>

            <Link
              to="/assistant"
              className="inline-flex items-center gap-1.5 text-xs font-semibold text-sky-600 dark:text-sky-400 hover:underline"
            >
              <span>Open Full Chat</span>
              <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>

          {/* Quick Input Box */}
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleAskAssistant();
            }}
            className="flex gap-2"
          >
            <input
              type="text"
              value={quickQuestion}
              onChange={(e) => setQuickQuestion(e.target.value)}
              placeholder="e.g. Is it safe to go for a run this morning in my area?"
              className="flex-1 px-4 py-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black text-zinc-900 dark:text-white text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 shadow-sm"
            />
            <button
              type="submit"
              className="px-5 py-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs sm:text-sm inline-flex items-center gap-2 shadow-sm transition-colors"
            >
              <span>Ask</span>
              <Send className="w-4 h-4" />
            </button>
          </form>

          {/* Sample Prompts */}
          <div>
            <span className="text-[11px] font-semibold text-zinc-500 dark:text-zinc-400 block mb-2">
              Common questions you can ask:
            </span>
            <div className="flex flex-wrap gap-2">
              {samplePrompts.map((p, idx) => (
                <button
                  key={idx}
                  type="button"
                  onClick={() => handleAskAssistant(p)}
                  className="px-3 py-1.5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 text-[11px] font-medium text-zinc-700 dark:text-zinc-300 transition-colors shadow-2xs"
                >
                  {p}
                </button>
              ))}
            </div>
          </div>
        </div>

        {/* ALL MAIN FEATURES IN A SIMPLE, CLEAN GRID */}
        <div>
          <h2 className="text-base font-bold text-zinc-900 dark:text-white mb-4">
            Main Features
          </h2>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-5">
            {/* 1. Air Pollution */}
            <Link
              to="/pollution"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <CloudFog className="w-5 h-5" />
                </div>
                <span className={`text-xs font-bold ${metrics.statusColor}`}>
                  {metrics.pollutionPercent}% • {metrics.status}
                </span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Air Pollution
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Check current pollution and smog levels in percentage with an interactive zoom area map.
                </p>
              </div>
            </Link>

            {/* 2. Family Protection */}
            <Link
              to="/family"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Users className="w-5 h-5" />
                </div>
                <span className="text-xs text-sky-500 font-semibold">Family Care</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Family Protection
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Easy and practical advice to protect children, adults, and elderly family members.
                </p>
              </div>
            </Link>

            {/* 3. Indoor Air Guide */}
            <Link
              to="/indoor"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Home className="w-5 h-5" />
                </div>
                <span className="text-xs text-sky-500 font-semibold">Home Safety</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Indoor Air Quality Guide
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Simple questions and steps to keep indoor spaces, bedrooms, and kitchens clean and safe.
                </p>
              </div>
            </Link>

            {/* 4. Community Hub */}
            <Link
              to="/community"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <MessageSquare className="w-5 h-5" />
                </div>
                <span className="text-xs text-zinc-400">Neighborhood</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Community Hub
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Share helpful tips with neighbors, read local updates, and view area activities.
                </p>
              </div>
            </Link>

            {/* 5. Smart Travel */}
            <Link
              to="/travel"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Navigation className="w-5 h-5" />
                </div>
                <span className="text-xs text-sky-500 font-medium">Route Planner</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Smart Travel
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Find cleaner routes between your start location and destination to reduce exposure.
                </p>
              </div>
            </Link>

            {/* 6. Pollution Forecast */}
            <Link
              to="/forecast"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Calendar className="w-5 h-5" />
                </div>
                <span className="text-xs text-zinc-400">Next 7 Days</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Pollution Forecast
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  View simple day-by-day pollution percentages and a clean trend graph.
                </p>
              </div>
            </Link>

            {/* 7. What To Do */}
            <Link
              to="/what-to-do"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <CheckCircle2 className="w-5 h-5" />
                </div>
                <span className="text-xs text-zinc-400">Daily Steps</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  What To Do
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Learn how to protect yourself indoors and outside, and how to reduce pollution.
                </p>
              </div>
            </Link>

            {/* 8. Alerts */}
            <Link
              to="/alerts"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Bell className="w-5 h-5" />
                </div>
                <span className="text-xs text-zinc-400">Live Notice</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Alerts
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Receive alerts when pollution reaches dangerous or unhealthy thresholds near you.
                </p>
              </div>
            </Link>

            {/* 9. Profile & Settings */}
            <Link
              to="/profile"
              className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group space-y-3"
            >
              <div className="flex items-center justify-between">
                <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
                  <Settings className="w-5 h-5" />
                </div>
                <span className="text-xs text-zinc-400">Settings</span>
              </div>
              <div>
                <h3 className="font-bold text-sm text-zinc-900 dark:text-white group-hover:text-sky-500 transition-colors">
                  Profile & Settings
                </h3>
                <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-1 line-clamp-2">
                  Update your home location, notification settings, and switch between dark & light mode.
                </p>
              </div>
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
