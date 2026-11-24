import { Link } from 'react-router-dom';
import {
  Wind,
  Shield,
  Activity,
  ArrowRight,
  TrendingDown,
  Sparkles,
  MapPin,
  CheckCircle2,
  Award,
} from 'lucide-react';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { getAQIConfig } from '../utils/aqiHelper';
import { Button } from '../components/common/Button';
import { Footer } from '../components/layout/Footer';
import { Navbar } from '../components/layout/Navbar';
import { useState } from 'react';
import { LocationSelectorModal } from '../components/dashboard/LocationSelectorModal';

export const Home = () => {
  const { aqiData, location } = useAQI();
  const { isAuthenticated } = useAuth();
  const [modalOpen, setModalOpen] = useState(false);

  const config = aqiData ? getAQIConfig(aqiData.aqiCategory) : null;

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100">
      <Navbar onOpenLocationModal={() => setModalOpen(true)} />

      {/* Hero Section */}
      <section className="relative overflow-hidden py-16 sm:py-24 border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 items-center">
            {/* Left Copy */}
            <div className="lg:col-span-7 space-y-6">
              <div className="inline-flex items-center gap-2 rounded-full border border-zinc-200 bg-zinc-50 px-3 py-1 text-xs font-medium text-zinc-700 dark:border-zinc-800 dark:bg-[#090909] dark:text-zinc-300">
                <span className="h-2 w-2 rounded-full bg-emerald-500 animate-pulse" />
                <span>Module 1 Active: Live Smog & Particulate Intelligence</span>
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.1]">
                Navigate severe smog with{' '}
                <span className="text-emerald-500 font-mono">real-time</span> environmental telemetry.
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-2xl leading-relaxed">
                ClearAir AI empowers families, students, working professionals, and vulnerable communities to understand ambient toxicity, monitor real-time particulates, and make safer daily decisions during peak winter pollution.
              </p>

              <div className="flex flex-wrap items-center gap-3 pt-2">
                <Link to="/dashboard">
                  <Button size="lg" rightIcon={<ArrowRight className="w-4 h-4" />}>
                    Open Live Dashboard
                  </Button>
                </Link>
                {!isAuthenticated && (
                  <Link to="/register">
                    <Button variant="outline" size="lg">
                      Create Protected Account
                    </Button>
                  </Link>
                )}
                <Link to="/roadmap">
                  <Button variant="ghost" size="lg">
                    Platform Roadmap (M2–M10)
                  </Button>
                </Link>
              </div>

              {/* Verified Sources Badges */}
              <div className="pt-4 flex flex-wrap items-center gap-6 text-xs text-zinc-500 dark:text-zinc-400">
                <div className="flex items-center gap-1.5">
                  <Award className="w-4 h-4 text-emerald-500" />
                  <span>Indian CPCB Standards</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                  <span>Copernicus CAMS Satellites</span>
                </div>
                <div className="flex items-center gap-1.5">
                  <Activity className="w-4 h-4 text-emerald-500" />
                  <span>Zero Fabricated Data</span>
                </div>
              </div>
            </div>

            {/* Right: Live Snapshot Preview Card */}
            <div className="lg:col-span-5">
              <div className="rounded-2xl border border-zinc-200 bg-zinc-50/50 p-6 shadow-xl dark:border-zinc-800 dark:bg-[#070707]">
                <div className="flex items-center justify-between pb-3 border-b border-zinc-200 dark:border-zinc-800">
                  <div className="flex items-center gap-2">
                    <MapPin className="w-4 h-4 text-emerald-500" />
                    <span className="font-semibold text-sm">{location.name} Live Telemetry</span>
                  </div>
                  <span className="text-[10px] font-mono px-2 py-0.5 rounded bg-emerald-500/10 text-emerald-500 font-bold">
                    REAL-TIME
                  </span>
                </div>

                {aqiData ? (
                  <div className="mt-4 space-y-4">
                    <div className="flex items-baseline justify-between">
                      <div>
                        <span
                          className="text-6xl font-extrabold font-mono"
                          style={{ color: config?.color }}
                        >
                          {aqiData.aqi}
                        </span>
                        <p className="text-xs font-mono uppercase text-zinc-400 font-semibold mt-1">
                          Air Quality Index
                        </p>
                      </div>
                      <div className="text-right">
                        <span
                          className="inline-block px-3 py-1 rounded-full text-xs font-bold border"
                          style={{
                            backgroundColor: config?.bgColor,
                            borderColor: config?.borderColor,
                            color: config?.textColor,
                          }}
                        >
                          {config?.label}
                        </span>
                        <p className="text-[11px] text-zinc-400 mt-1 font-mono">
                          Temp: {aqiData.weather.temperature}°C • {aqiData.weather.condition}
                        </p>
                      </div>
                    </div>

                    {/* Pollutant snapshot row */}
                    <div className="grid grid-cols-3 gap-2 pt-2 border-t border-zinc-200 dark:border-zinc-800 text-center">
                      <div className="p-2 rounded bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900">
                        <span className="text-[10px] text-zinc-400 font-mono">PM2.5</span>
                        <p className="text-sm font-bold font-mono">{aqiData.pollutants.pm25} µg</p>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900">
                        <span className="text-[10px] text-zinc-400 font-mono">PM10</span>
                        <p className="text-sm font-bold font-mono">{aqiData.pollutants.pm10} µg</p>
                      </div>
                      <div className="p-2 rounded bg-white dark:bg-black border border-zinc-100 dark:border-zinc-900">
                        <span className="text-[10px] text-zinc-400 font-mono">NO2</span>
                        <p className="text-sm font-bold font-mono">{aqiData.pollutants.no2} µg</p>
                      </div>
                    </div>

                    <Link to="/dashboard" className="block pt-2">
                      <Button variant="secondary" className="w-full justify-center text-xs">
                        View Complete Analysis & Hourly Curves →
                      </Button>
                    </Link>
                  </div>
                ) : (
                  <div className="py-12 text-center text-xs text-zinc-500">
                    Loading live satellite feed...
                  </div>
                )}
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Pillars Section */}
      <section className="py-16 bg-zinc-50/50 dark:bg-black border-b border-zinc-200 dark:border-zinc-800">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="text-center max-w-2xl mx-auto mb-12">
            <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              Designed for Severe Urban Air Pollution
            </h2>
            <p className="mt-2 text-sm text-zinc-500 dark:text-zinc-400">
              Winter smog is driven by particulate matter trapping, thermal inversions, and agricultural biomass burning. ClearAir AI provides scientific clarity without alarmism.
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div className="p-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707] space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-emerald-500">
                <Activity className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Multi-Pollutant Telemetry
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Monitor PM2.5, PM10, NO2, SO2, CO, and O3 simultaneously against standard health thresholds rather than relying on ambiguous single scores.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707] space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-amber-500">
                <Shield className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Demographic Risk Profiling
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                Health guidelines adapted for students, children, working commuters, elderly citizens, and individuals managing respiratory conditions.
              </p>
            </div>

            <div className="p-6 rounded-xl border border-zinc-200 bg-white dark:border-zinc-800 dark:bg-[#070707] space-y-3">
              <div className="h-10 w-10 flex items-center justify-center rounded-lg bg-zinc-100 dark:bg-zinc-900 text-cyan-500">
                <Sparkles className="w-5 h-5" />
              </div>
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Modular AI-Ready Architecture
              </h3>
              <p className="text-xs text-zinc-600 dark:text-zinc-400 leading-relaxed">
                A robust Node.js, Express, MongoDB Atlas, and React foundation ready for upcoming GenAI Smog Assistants, Route Planners, and Forecasting engines.
              </p>
            </div>
          </div>
        </div>
      </section>

      <Footer />

      <LocationSelectorModal isOpen={modalOpen} onClose={() => setModalOpen(false)} />
    </div>
  );
};
