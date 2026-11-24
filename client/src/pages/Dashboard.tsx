import { useState } from 'react';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { AQIOverviewCard } from '../components/dashboard/AQIOverviewCard';
import { PollutantCardGrid } from '../components/dashboard/PollutantCardGrid';
import { WeatherCard } from '../components/dashboard/WeatherCard';
import { AQITrendChart } from '../components/dashboard/AQITrendChart';
import { PollutantComparisonChart } from '../components/dashboard/PollutantComparisonChart';
import { HealthRiskCard } from '../components/dashboard/HealthRiskCard';
import { AlertsWidget } from '../components/dashboard/AlertsWidget';
import { LoadingSpinner } from '../components/common/LoadingSpinner';
import { LocationSelectorModal } from '../components/dashboard/LocationSelectorModal';
import { Button } from '../components/common/Button';
import { MapPin, RefreshCw, AlertCircle } from 'lucide-react';

export const Dashboard = () => {
  const { aqiData, location, isLoading, error, refreshAQI } = useAQI();
  const { user } = useAuth();
  const [locationModalOpen, setLocationModalOpen] = useState(false);

  // Time-aware greeting
  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good morning';
    if (hour < 18) return 'Good afternoon';
    return 'Good evening';
  };

  return (
    <DashboardLayout>
      {/* Dashboard Top Header */}
      <div className="mb-6 flex flex-col md:flex-row md:items-center md:justify-between gap-4 pb-4 border-b border-zinc-200 dark:border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <h1 className="text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
              {getGreeting()}
              {user ? `, ${user.fullName.split(' ')[0]}` : ''}
            </h1>
            {user && (
              <span className="text-[11px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border border-zinc-200 dark:border-zinc-800">
                {user.userCategory.toUpperCase()}
              </span>
            )}
          </div>
          <p className="mt-1 text-xs text-zinc-500 dark:text-zinc-400 flex items-center gap-1.5">
            <span>Monitoring:</span>
            <button
              onClick={() => setLocationModalOpen(true)}
              className="font-medium text-emerald-600 dark:text-emerald-400 hover:underline flex items-center gap-0.5"
            >
              <MapPin className="w-3 h-3" />
              {location.name}
            </button>
            <span className="text-zinc-300 dark:text-zinc-700">•</span>
            <span>Real-time CPCB / Copernicus satellite feed</span>
          </p>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => setLocationModalOpen(true)}
            leftIcon={<MapPin className="w-3.5 h-3.5 text-emerald-500" />}
          >
            Change Location
          </Button>

          <Button
            variant="secondary"
            size="sm"
            onClick={refreshAQI}
            isLoading={isLoading}
            leftIcon={<RefreshCw className="w-3.5 h-3.5" />}
          >
            Refresh Readings
          </Button>
        </div>
      </div>

      {/* Main Content Area */}
      {isLoading && !aqiData ? (
        <LoadingSpinner label="Fetching live particulate telemetry & satellite observations..." size="lg" />
      ) : error && !aqiData ? (
        <div className="p-6 rounded-xl border border-red-500/30 bg-red-500/5 text-center space-y-3">
          <AlertCircle className="w-8 h-8 text-red-500 mx-auto" />
          <h3 className="text-sm font-bold text-red-500">Failed to Load Air Quality Telemetry</h3>
          <p className="text-xs text-zinc-500">{error}</p>
          <Button size="sm" onClick={refreshAQI}>
            Retry Request
          </Button>
        </div>
      ) : aqiData ? (
        <div className="space-y-6">
          {/* Section 1: Main Overview Card */}
          <AQIOverviewCard
            data={aqiData}
            onRefresh={refreshAQI}
            isLoading={isLoading}
            onOpenLocationModal={() => setLocationModalOpen(true)}
          />

          {/* Section 2: Active Smog Alerts Widget */}
          <AlertsWidget />

          {/* Section 3: Health Risk Advisory Card */}
          <HealthRiskCard
            guidance={aqiData.healthGuidance}
            category={aqiData.aqiCategory}
            userCategory={user?.userCategory}
          />

          {/* Section 4: 24h Hourly Trend Area Chart */}
          {aqiData.hourlyTrend && aqiData.hourlyTrend.length > 0 && (
            <AQITrendChart data={aqiData.hourlyTrend} />
          )}

          {/* Section 5: Individual Pollutant Cards Grid */}
          <PollutantCardGrid pollutants={aqiData.pollutants} />

          {/* Section 6: Pollutant Comparison vs Safety Limits */}
          <PollutantComparisonChart pollutants={aqiData.pollutants} />

          {/* Section 7: Meteorological Conditions */}
          <WeatherCard weather={aqiData.weather} />
        </div>
      ) : null}

      <LocationSelectorModal
        isOpen={locationModalOpen}
        onClose={() => setLocationModalOpen(false)}
      />
    </DashboardLayout>
  );
};
