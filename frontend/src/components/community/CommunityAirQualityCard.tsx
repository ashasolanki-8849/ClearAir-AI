import React from 'react';
import {
  Wind,
  AlertTriangle,
  Activity,
  Droplets,
  Thermometer,
  ShieldAlert,
  Info,
  CheckCircle,
} from 'lucide-react';
import { Badge } from '../common/Badge';

interface CommunityAirQualityCardProps {
  aqiData?: any;
  severeConditionActive?: boolean;
  alertThreshold?: number;
  dataSourceLabel?: string;
  lastUpdated?: string;
}

export const CommunityAirQualityCard: React.FC<CommunityAirQualityCardProps> = ({
  aqiData,
  severeConditionActive,
  alertThreshold = 300,
  dataSourceLabel,
  lastUpdated,
}) => {
  if (!aqiData) {
    return (
      <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 flex items-center justify-center min-h-[220px]">
        <div className="flex items-center gap-2 text-zinc-500 text-sm">
          <Activity className="w-5 h-5 animate-pulse text-emerald-500" />
          <span>Synchronizing hyper-local air quality station feed...</span>
        </div>
      </div>
    );
  }

  const aqi = aqiData.aqi || 0;
  const category = aqiData.aqiCategory || 'Moderate';
  const pollutants = aqiData.pollutants || {};
  const weather = aqiData.weather || {};

  const getAQIColor = (val: number) => {
    if (val <= 50) return 'text-emerald-500 bg-emerald-50 dark:bg-emerald-950/40 border-emerald-200 dark:border-emerald-800';
    if (val <= 100) return 'text-lime-500 bg-lime-50 dark:bg-lime-950/40 border-lime-200 dark:border-lime-800';
    if (val <= 200) return 'text-amber-500 bg-amber-50 dark:bg-amber-950/40 border-amber-200 dark:border-amber-800';
    if (val <= 300) return 'text-orange-500 bg-orange-50 dark:bg-orange-950/40 border-orange-200 dark:border-orange-800';
    if (val <= 400) return 'text-rose-600 bg-rose-50 dark:bg-rose-950/40 border-rose-200 dark:border-rose-800';
    return 'text-purple-600 bg-purple-50 dark:bg-purple-950/40 border-purple-200 dark:border-purple-800';
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-3xl p-6 md:p-8 shadow-sm space-y-6">
      {/* Severe Smog Warning Banner if applicable */}
      {severeConditionActive && (
        <div className="flex items-start gap-3 p-4 rounded-2xl bg-rose-50 dark:bg-rose-950/60 border border-rose-200 dark:border-rose-900 text-rose-900 dark:text-rose-200">
          <ShieldAlert className="w-6 h-6 text-rose-600 dark:text-rose-400 shrink-0 mt-0.5" />
          <div className="space-y-1 text-xs">
            <h4 className="font-bold text-sm text-rose-700 dark:text-rose-300">
              Community Severe Smog Alert Active (AQI &gt;= {alertThreshold})
            </h4>
            <p className="text-zinc-700 dark:text-rose-200/90 leading-relaxed">
              Outdoor physical activities and morning assemblies should be suspended. Security guards and maintenance personnel should be provided with certified N95 respirators. Ensure building air intakes and windows are closed.
            </p>
          </div>
        </div>
      )}

      {/* Main AQI Row */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6 items-center">
        {/* AQI Badge Block */}
        <div className="flex items-center gap-4">
          <div
            className={`w-24 h-24 rounded-2xl border flex flex-col items-center justify-center shrink-0 ${getAQIColor(
              aqi
            )}`}
          >
            <span className="text-3xl font-black tracking-tight">{aqi}</span>
            <span className="text-[10px] font-bold uppercase tracking-wider">AQI</span>
          </div>

          <div>
            <div className="flex items-center gap-2">
              <span className="text-lg font-bold text-zinc-900 dark:text-zinc-100">
                {category}
              </span>
            </div>
            <p className="text-xs text-zinc-500 mt-1">
              National Air Quality Index (CPCB standard)
            </p>
            <div className="flex items-center gap-1.5 text-xs text-zinc-400 mt-1">
              <Activity className="w-3.5 h-3.5 text-emerald-500" />
              <span>Verified Monitoring Feed</span>
            </div>
          </div>
        </div>

        {/* 6 Core Pollutants */}
        <div className="md:col-span-2 grid grid-cols-3 sm:grid-cols-6 gap-2">
          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">PM2.5</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.pm25 ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">µg/m³</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">PM10</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.pm10 ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">µg/m³</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">NO₂</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.no2 ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">µg/m³</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">SO₂</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.so2 ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">µg/m³</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">CO</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.co ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">mg/m³</div>
          </div>

          <div className="p-2.5 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 text-center">
            <div className="text-[10px] font-semibold text-zinc-500 uppercase">O₃</div>
            <div className="text-sm font-bold text-zinc-900 dark:text-zinc-100 mt-0.5">
              {pollutants.o3 ?? '--'}
            </div>
            <div className="text-[9px] text-zinc-600">µg/m³</div>
          </div>
        </div>
      </div>

      {/* Atmospheric & Source Footer */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pt-4 border-t border-zinc-100 dark:border-zinc-900 text-xs text-zinc-500">
        <div className="flex items-center gap-4 flex-wrap">
          {weather.temperature !== undefined && (
            <span className="flex items-center gap-1">
              <Thermometer className="w-3.5 h-3.5 text-zinc-400" />
              {weather.temperature}°C Temp
            </span>
          )}
          {weather.humidity !== undefined && (
            <span className="flex items-center gap-1">
              <Droplets className="w-3.5 h-3.5 text-blue-400" />
              {weather.humidity}% Humidity
            </span>
          )}
          {weather.windSpeed !== undefined && (
            <span className="flex items-center gap-1">
              <Wind className="w-3.5 h-3.5 text-teal-400" />
              {weather.windSpeed} km/h Wind
            </span>
          )}
        </div>

        <div className="flex items-center gap-2 text-zinc-400">
          <Info className="w-3.5 h-3.5 shrink-0" />
          <span>Source: {dataSourceLabel || aqiData.dataSource || 'CPCB / Official Monitoring Station'}</span>
        </div>
      </div>
    </div>
  );
};
