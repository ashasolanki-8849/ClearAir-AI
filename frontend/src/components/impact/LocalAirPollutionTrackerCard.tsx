import React, { useState, useEffect } from 'react';
import { 
  Wind, 
  AlertTriangle, 
  CheckCircle, 
  ShieldAlert, 
  Info, 
  MapPin, 
  Activity, 
  TrendingUp, 
  ArrowRight,
  ShieldCheck,
  Compass
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { LocalPollutionAwareness } from '../../types';

export const LocalAirPollutionTrackerCard: React.FC = () => {
  const [data, setData] = useState<LocalPollutionAwareness | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchPollution = async () => {
      try {
        setLoading(true);
        setError(null);
        const res = await impactService.getLocalPollutionAwareness();
        if (res.success && res.data) {
          setData(res.data);
        } else {
          setError(res.error || 'Failed to fetch local air pollution data');
        }
      } catch (err: any) {
        setError(err.message || 'Error fetching local air quality');
      } finally {
        setLoading(false);
      }
    };

    fetchPollution();
  }, []);

  const getAqiColor = (aqi: number) => {
    if (aqi <= 50) return { bg: 'bg-emerald-500/10', text: 'text-emerald-400', border: 'border-emerald-500/30', label: 'Good' };
    if (aqi <= 100) return { bg: 'bg-lime-500/10', text: 'text-lime-400', border: 'border-lime-500/30', label: 'Satisfactory' };
    if (aqi <= 200) return { bg: 'bg-amber-500/10', text: 'text-amber-400', border: 'border-amber-500/30', label: 'Moderate' };
    if (aqi <= 300) return { bg: 'bg-orange-500/10', text: 'text-orange-400', border: 'border-orange-500/30', label: 'Poor' };
    if (aqi <= 400) return { bg: 'bg-red-500/10', text: 'text-red-400', border: 'border-red-500/30', label: 'Very Poor' };
    return { bg: 'bg-purple-500/10', text: 'text-purple-400', border: 'border-purple-500/30', label: 'Severe / Hazardous' };
  };

  if (loading) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-8 text-center text-zinc-400">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-2 border-emerald-500 border-t-transparent mb-3" />
        <p className="text-sm">Connecting to local air quality telemetry & CPCB monitoring grid...</p>
      </div>
    );
  }

  if (error || !data) {
    return (
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 text-center">
        <AlertTriangle className="w-8 h-8 text-amber-400 mx-auto mb-2" />
        <p className="text-sm text-zinc-300">{error || 'Station telemetry currently unavailable'}</p>
        <p className="text-xs text-zinc-500 mt-1">Please ensure location permissions or city profiles are configured.</p>
      </div>
    );
  }

  const aqiStyle = getAqiColor(data.currentAqi);

  return (
    <div className="space-y-6">
      {/* 1. Mandatory Scientific Disaggregation Callout Banner */}
      <div className="bg-gradient-to-r from-amber-950/40 via-zinc-900 to-zinc-950 border-2 border-amber-500/30 rounded-2xl p-6 shadow-2xl relative overflow-hidden">
        <div className="flex items-start gap-4">
          <div className="p-3 bg-amber-500/20 text-amber-400 rounded-xl border border-amber-500/30 flex-shrink-0">
            <ShieldAlert className="w-6 h-6" />
          </div>
          <div>
            <div className="inline-flex items-center gap-2 px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-amber-500/20 text-amber-300 border border-amber-500/30 mb-2">
              Scientific Transparency Note
            </div>
            <h4 className="text-lg font-bold text-white">
              Disaggregating Carbon Footprint (CO₂e) vs. Ambient Air Quality (AQI)
            </h4>
            <p className="text-sm text-zinc-300 mt-2 leading-relaxed">
              Your <strong className="text-emerald-400">Carbon Footprint (kg CO₂e)</strong> measures global greenhouse gas emissions that drive multi-decade planetary warming. In contrast, <strong className="text-amber-400">Ambient Air Quality (AQI)</strong> reflects real-time localized particulate matter (<span className="font-mono text-xs">PM2.5, PM10</span>) and reactive toxic gases (<span className="font-mono text-xs">NO₂, SO₂, CO</span>) in your immediate breathing zone.
            </p>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 mt-4 pt-4 border-t border-zinc-800 text-xs">
              <div className="flex items-start gap-2 text-zinc-300">
                <span className="text-emerald-400 font-bold">✓ Direct Impact:</span>
                Choosing public transport or an EV directly eliminates tailpipe PM2.5 and NOx from your neighborhood streets.
              </div>
              <div className="flex items-start gap-2 text-zinc-300">
                <span className="text-amber-400 font-bold">⚠ Realistic Attribution:</span>
                Individual action cannot immediately alter citywide ambient AQI, which is heavily governed by seasonal thermal inversions and regional crop/industrial fires.
              </div>
            </div>
          </div>
        </div>
      </div>

      {/* 2. Real-Time Ambient AQI & Criteria Pollutants */}
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl">
        <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
          <div>
            <div className="flex items-center gap-2 text-zinc-400 text-xs font-semibold">
              <MapPin className="w-4 h-4 text-emerald-400" />
              <span>STATION: {data.stationName} ({data.city})</span>
            </div>
            <h3 className="text-2xl font-black text-white mt-1">Live Ambient Air Telemetry</h3>
          </div>
          <div className="flex items-center gap-3">
            <div className={`px-4 py-2 rounded-xl border ${aqiStyle.bg} ${aqiStyle.border} flex items-center gap-3`}>
              <div className="text-right">
                <div className="text-xs font-semibold uppercase text-zinc-400">Ambient AQI</div>
                <div className={`text-2xl font-black ${aqiStyle.text}`}>{data.currentAqi}</div>
              </div>
              <div className={`text-xs font-bold uppercase px-2 py-1 rounded-md bg-zinc-900/80 ${aqiStyle.text}`}>
                {aqiStyle.label}
              </div>
            </div>
          </div>
        </div>

        {/* Criteria Pollutants Grid */}
        <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-6 gap-3 mt-6">
          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">PM2.5 Fine Dust</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.pm25.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500">µg/m³ (WHO: 15)</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">PM10 Coarse Dust</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.pm10.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500">µg/m³ (NAAQS: 100)</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">NO₂ Nitrogen Dioxide</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.no2.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500">µg/m³ (Tailpipe gas)</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">SO₂ Sulphur Dioxide</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.so2.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500">µg/m³ (Fuel sulphur)</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">CO Carbon Monoxide</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.co.toFixed(2)}</div>
            <div className="text-[10px] text-zinc-500">mg/m³ (Incomplete burn)</div>
          </div>

          <div className="bg-zinc-900/60 p-3 rounded-xl border border-zinc-800/80">
            <div className="text-xs text-zinc-400 font-medium">O₃ Surface Ozone</div>
            <div className="text-lg font-black text-white mt-1 font-mono">{data.pollutants.o3.toFixed(1)}</div>
            <div className="text-[10px] text-zinc-500">µg/m³ (Photochemical)</div>
          </div>
        </div>

        {/* Avoided Personal Inhalation Exposure Section */}
        <div className="mt-6 p-4 rounded-xl bg-zinc-900/40 border border-zinc-800 flex flex-col md:flex-row items-start md:items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="p-2.5 rounded-lg bg-emerald-500/10 text-emerald-400 border border-emerald-500/20">
              <ShieldCheck className="w-5 h-5" />
            </div>
            <div>
              <div className="text-xs font-semibold text-zinc-400">Personal Inhalation Protection</div>
              <div className="text-sm font-medium text-white">
                Estimated Avoided Inhalation: <span className="font-bold text-emerald-400 font-mono">{(data.avoidedExposureEstimate?.pm25GramsAvoided ?? 0).toFixed(2)} grams PM2.5</span>
              </div>
              <div className="text-xs text-zinc-500 mt-0.5">
                Calculated based on protective actions (N95 mask usage on severe days, indoor HEPA filtration, low-emission routing).
              </div>
            </div>
          </div>
          <div className="text-xs px-3 py-1.5 rounded-lg bg-zinc-800/80 text-zinc-300 border border-zinc-700 whitespace-nowrap">
            Updated: {new Date(data.lastUpdated).toLocaleTimeString()}
          </div>
        </div>
      </div>
    </div>
  );
};
