import React, { useState } from 'react';
import { HelpCircle, Sparkles, Wind, CloudRain, Sun, AlertTriangle, RefreshCw } from 'lucide-react';
import { Badge } from '../common/Badge';
import { ForecastExplanationData } from '../../types';
import { forecastService } from '../../services/forecastService';

interface WhyIsPollutionChangingCardProps {
  initialExplanation?: ForecastExplanationData | null;
  lat?: number;
  lon?: number;
}

export const WhyIsPollutionChangingCard: React.FC<WhyIsPollutionChangingCardProps> = ({
  initialExplanation,
  lat = 28.6139,
  lon = 77.2090,
}) => {
  const [explanation, setExplanation] = useState<ForecastExplanationData | null>(initialExplanation || null);
  const [loading, setLoading] = useState<boolean>(false);
  const [horizon, setHorizon] = useState<'24h' | '48h' | '72h'>('24h');

  const fetchExplanation = async (h: '24h' | '48h' | '72h') => {
    setLoading(true);
    try {
      const res = await forecastService.getExplanation(lat, lon, h);
      if (res.data) {
        setExplanation(res.data);
      }
    } catch (err) {
      console.error('Failed to fetch forecast explanation:', err);
    } finally {
      setLoading(false);
    }
  };

  const handleHorizonChange = (newHorizon: '24h' | '48h' | '72h') => {
    setHorizon(newHorizon);
    fetchExplanation(newHorizon);
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900 gap-3">
        <div className="flex items-center space-x-2.5">
          <div className="p-2 rounded-xl bg-emerald-50 dark:bg-emerald-950/40 text-emerald-600 dark:text-emerald-400">
            <Sparkles className="h-5 w-5" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
                Why Is Pollution Changing?
              </h3>
              <Badge variant="outline">
                AI + Physical Model
              </Badge>
            </div>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
              Clear explainability connecting atmospheric physics, meteorological inversion, and emission dynamics
            </p>
          </div>
        </div>

        {/* Horizon selector */}
        <div className="flex items-center space-x-1 bg-zinc-100 dark:bg-zinc-900 p-1 rounded-xl self-start sm:self-auto">
          {(['24h', '48h', '72h'] as const).map((h) => (
            <button
              key={h}
              onClick={() => handleHorizonChange(h)}
              disabled={loading}
              className={`px-2.5 py-1 text-xs font-semibold rounded-lg transition-all ${
                horizon === h
                  ? 'bg-white dark:bg-zinc-800 text-zinc-900 dark:text-white shadow-xs'
                  : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-white'
              }`}
            >
              {h}
            </button>
          ))}
          <button
            onClick={() => fetchExplanation(horizon)}
            disabled={loading}
            title="Refresh AI explanation"
            className="p-1 text-zinc-400 hover:text-zinc-700 dark:hover:text-zinc-200 ml-1 rounded-lg hover:bg-zinc-200 dark:hover:bg-zinc-800 transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${loading ? 'animate-spin' : ''}`} />
          </button>
        </div>
      </div>

      <div className="pt-1 space-y-4">
        {loading ? (
          <div className="py-12 flex flex-col items-center justify-center space-y-3">
            <RefreshCw className="h-6 w-6 text-emerald-500 animate-spin" />
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Synthesizing boundary-layer physics and synoptic forecast models...
            </p>
          </div>
        ) : !explanation ? (
          <div className="py-8 text-center space-y-2">
            <HelpCircle className="h-8 w-8 text-zinc-400 mx-auto" />
            <p className="text-sm font-semibold text-zinc-700 dark:text-zinc-300">
              No explanation loaded
            </p>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 max-w-sm mx-auto">
              Click refresh to generate an automated scientific explanation for the forecast period.
            </p>
            <button
              onClick={() => fetchExplanation(horizon)}
              className="mt-2 px-3 py-1.5 bg-zinc-900 text-white dark:bg-white dark:text-zinc-900 rounded-lg text-xs font-semibold hover:opacity-90 transition-opacity"
            >
              Analyze Atmospheric Drivers
            </button>
          </div>
        ) : (
          <>
            {/* Primary Natural Language Narrative */}
            <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-2">
              <div className="flex items-center justify-between">
                <span className="text-[11px] font-bold uppercase tracking-wider text-zinc-500 dark:text-zinc-400">
                  Forecast Narrative ({explanation.horizon})
                </span>
                <span className="text-[11px] font-mono text-zinc-400 dark:text-zinc-500">
                  Confidence: {Math.round((explanation.confidence || 0.88) * 100)}%
                </span>
              </div>
              <p className="text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed font-normal">
                {explanation.explanation}
              </p>
            </div>

            {/* Contributing Atmospheric Drivers */}
            <div>
              <h4 className="text-xs font-bold text-zinc-700 dark:text-zinc-300 uppercase tracking-wider mb-2 flex items-center gap-1.5">
                <Wind className="h-3.5 w-3.5 text-zinc-500" />
                Key Contributing Physical Factors
              </h4>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-2">
                {explanation.contributingFactors?.map((factor, idx) => (
                  <div
                    key={idx}
                    className="flex items-start space-x-2.5 p-3 rounded-xl bg-zinc-50/70 dark:bg-zinc-900/40 border border-zinc-200/80 dark:border-zinc-800/80 text-xs"
                  >
                    <div className="mt-1 w-1.5 h-1.5 rounded-full bg-emerald-500 shrink-0" />
                    <span className="text-zinc-700 dark:text-zinc-300 leading-snug">
                      {factor}
                    </span>
                  </div>
                ))}
              </div>
            </div>

            {/* Impact & Actionable Advice */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3 pt-1">
              {explanation.impactOnVulnerable && (
                <div className="p-3.5 rounded-xl border border-amber-200/70 dark:border-amber-900/40 bg-amber-50/40 dark:bg-amber-950/20">
                  <div className="flex items-center space-x-1.5 text-amber-700 dark:text-amber-400 text-xs font-bold mb-1">
                    <AlertTriangle className="h-3.5 w-3.5" />
                    <span>Impact on Vulnerable Groups</span>
                  </div>
                  <p className="text-xs text-amber-900 dark:text-amber-200/90 leading-relaxed">
                    {explanation.impactOnVulnerable}
                  </p>
                </div>
              )}

              {explanation.actionableAdvice && (
                <div className="p-3.5 rounded-xl border border-emerald-200/70 dark:border-emerald-900/40 bg-emerald-50/40 dark:bg-emerald-950/20">
                  <div className="flex items-center space-x-1.5 text-emerald-700 dark:text-emerald-400 text-xs font-bold mb-1">
                    <Sun className="h-3.5 w-3.5" />
                    <span>Recommended Preventive Action</span>
                  </div>
                  <p className="text-xs text-emerald-900 dark:text-emerald-200/90 leading-relaxed">
                    {explanation.actionableAdvice}
                  </p>
                </div>
              )}
            </div>

            {/* Scientific Grounding Note */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between text-[11px] text-zinc-400 dark:text-zinc-500 pt-2 border-t border-zinc-100 dark:border-zinc-900 gap-1">
              <span className="flex items-center gap-1">
                <CloudRain className="h-3 w-3" />
                Physical model: Copernicus Atmosphere Service (CAMS) + boundary layer inversion equations
              </span>
              <span>Updated {new Date(explanation.timestamp || Date.now()).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
            </div>
          </>
        )}
      </div>
    </div>
  );
};
