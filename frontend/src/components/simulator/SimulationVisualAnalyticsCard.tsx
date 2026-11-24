import React, { useState } from 'react';
import { 
  BarChart, 
  Bar, 
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer, 
  Legend, 
  AreaChart, 
  Area 
} from 'recharts';
import { 
  BarChart3, 
  TrendingDown, 
  Calendar, 
  Layers, 
  Info 
} from 'lucide-react';
import { 
  SimulationBaselineData, 
  SimulationResultsData 
} from '../../types';

interface SimulationVisualAnalyticsCardProps {
  baseline: SimulationBaselineData;
  results: SimulationResultsData;
}

export const SimulationVisualAnalyticsCard: React.FC<SimulationVisualAnalyticsCardProps> = ({
  baseline,
  results,
}) => {
  const [activeChart, setActiveChart] = useState<'aqi_pm' | 'projections'>('aqi_pm');

  // Chart Data: Three-state AQI & Particulate comparison
  const aqiComparisonData = [
    {
      name: 'Current (Measured)',
      AQI: baseline.currentAqi,
      'PM2.5 (µg/m³)': baseline.currentPm25,
      'PM10 (µg/m³)': baseline.currentPm10,
    },
    {
      name: 'Simulated (Scenario)',
      AQI: results.simulatedAqi,
      'PM2.5 (µg/m³)': results.simulatedPm25,
      'PM10 (µg/m³)': results.simulatedPm10,
    },
    {
      name: 'Recommended (Target)',
      AQI: results.comparison.recommended.aqi,
      'PM2.5 (µg/m³)': results.comparison.recommended.pm25,
      'PM10 (µg/m³)': results.comparison.recommended.pm10,
    },
  ];

  // Chart Data: Cumulative Avoidance Projections
  const projectionData = [
    { timeline: 'Day 1', avoidedCO2Kg: +(results.tailpipeEmissionsAvoidedKgCO2e).toFixed(1), avoidedPM25G: +(results.tailpipePm25AvoidedGrams).toFixed(1) },
    { timeline: 'Day 3', avoidedCO2Kg: +(results.tailpipeEmissionsAvoidedKgCO2e * 3).toFixed(1), avoidedPM25G: +(results.tailpipePm25AvoidedGrams * 3).toFixed(1) },
    { timeline: 'Day 7 (Week 1)', avoidedCO2Kg: +(results.projections.weekly.cumulativeAvoidedKgCO2e).toFixed(1), avoidedPM25G: +(results.projections.weekly.cumulativePm25Grams).toFixed(1) },
    { timeline: 'Day 14 (Week 2)', avoidedCO2Kg: +(results.tailpipeEmissionsAvoidedKgCO2e * 14).toFixed(1), avoidedPM25G: +(results.tailpipePm25AvoidedGrams * 14).toFixed(1) },
    { timeline: 'Day 30 (Month 1)', avoidedCO2Kg: +(results.projections.monthly.cumulativeAvoidedKgCO2e).toFixed(1), avoidedPM25G: +(results.projections.monthly.cumulativePm25Grams).toFixed(1) },
  ];

  return (
    <div className="bg-zinc-950 border border-zinc-800 rounded-2xl p-6 shadow-xl space-y-6">
      {/* Header and Toggle */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4 pb-6 border-b border-zinc-800">
        <div>
          <div className="flex items-center gap-2">
            <div className="p-2 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <BarChart3 className="w-5 h-5" />
            </div>
            <h3 className="text-xl font-bold text-white tracking-tight">Visual Simulation Analytics</h3>
          </div>
          <p className="text-xs text-zinc-400 mt-1">
            Comparative bar charts and cumulative particulate avoidance trajectories.
          </p>
        </div>

        {/* Chart View Toggle */}
        <div className="flex items-center bg-zinc-900 p-1 rounded-xl border border-zinc-800">
          <button
            onClick={() => setActiveChart('aqi_pm')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeChart === 'aqi_pm'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Layers className="w-3.5 h-3.5" />
            AQI & Particulate Comparison
          </button>
          <button
            onClick={() => setActiveChart('projections')}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold transition-all ${
              activeChart === 'projections'
                ? 'bg-emerald-600 text-white shadow-md'
                : 'text-zinc-400 hover:text-white'
            }`}
          >
            <Calendar className="w-3.5 h-3.5" />
            Cumulative Projections
          </button>
        </div>
      </div>

      {/* Chart Display Area */}
      <div className="h-72 w-full pt-2">
        {activeChart === 'aqi_pm' ? (
          <ResponsiveContainer width="100%" height="100%">
            <BarChart data={aqiComparisonData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="name" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f4f4f5' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Bar dataKey="AQI" fill="#f59e0b" radius={[6, 6, 0, 0]} />
              <Bar dataKey="PM2.5 (µg/m³)" fill="#10b981" radius={[6, 6, 0, 0]} />
              <Bar dataKey="PM10 (µg/m³)" fill="#06b6d4" radius={[6, 6, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        ) : (
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={projectionData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
              <defs>
                <linearGradient id="colorCO2" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10b981" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorPM25" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#06b6d4" stopOpacity={0.4}/>
                  <stop offset="95%" stopColor="#06b6d4" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke="#27272a" />
              <XAxis dataKey="timeline" stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <YAxis stroke="#a1a1aa" fontSize={11} tickLine={false} />
              <Tooltip 
                contentStyle={{ 
                  backgroundColor: '#09090b', 
                  border: '1px solid #27272a', 
                  borderRadius: '12px',
                  fontSize: '12px',
                  color: '#f4f4f5' 
                }} 
              />
              <Legend wrapperStyle={{ fontSize: '11px', paddingTop: '10px' }} />
              <Area type="monotone" dataKey="avoidedCO2Kg" name="Cumulative Avoided CO₂e (kg)" stroke="#10b981" fillOpacity={1} fill="url(#colorCO2)" />
              <Area type="monotone" dataKey="avoidedPM25G" name="Cumulative Avoided PM2.5 (g)" stroke="#06b6d4" fillOpacity={1} fill="url(#colorPM25)" />
            </AreaChart>
          </ResponsiveContainer>
        )}
      </div>

      {/* Footer Insight */}
      <div className="bg-zinc-900/40 rounded-xl p-3.5 border border-zinc-800/80 text-xs text-zinc-400 flex items-start gap-2.5">
        <Info className="w-4 h-4 text-emerald-400 flex-shrink-0 mt-0.5" />
        <div>
          <span className="font-semibold text-zinc-300">Airshed Trajectory Interpretation:</span> Sustained adherence across 30 days avoids an estimated <span className="text-emerald-400 font-mono font-bold">{results.projections.monthly.cumulativeAvoidedKgCO2e} kg CO₂e</span> and prevents <span className="text-cyan-400 font-mono font-bold">{results.projections.monthly.cumulativePm25Grams} grams</span> of combustion fine particles from accumulating in your community breathing zone.
        </div>
      </div>
    </div>
  );
};
export default SimulationVisualAnalyticsCard;
