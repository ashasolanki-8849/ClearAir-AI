import { Link } from 'react-router-dom';
import { ShieldAlert, Wind, Heart, Award } from 'lucide-react';

export const Footer = () => {
  return (
    <footer className="border-t border-zinc-200 bg-white py-10 dark:border-zinc-800 dark:bg-black text-zinc-500 text-xs">
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-8 mb-8">
          {/* Brand Col */}
          <div className="space-y-3">
            <div className="flex items-center gap-2">
              <div className="flex h-7 w-7 items-center justify-center rounded-md bg-zinc-900 text-white dark:bg-white dark:text-black">
                <Wind className="h-4 w-4" />
              </div>
              <span className="font-bold text-sm text-zinc-900 dark:text-white">ClearAir AI</span>
            </div>
            <p className="text-zinc-500 dark:text-zinc-400 leading-relaxed text-xs">
              Navigating severe winter smog and urban air pollution with precision telemetry, health-focused advisories, and sustainable decision-making.
            </p>
          </div>

          {/* Standards & Methodologies */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
              AQI Standards
            </h4>
            <ul className="space-y-1.5">
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Indian CPCB National Standard</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>US EPA Air Quality Index</span>
              </li>
              <li className="flex items-center gap-1.5">
                <Award className="w-3.5 h-3.5 text-emerald-500" />
                <span>Copernicus CAMS European Standard</span>
              </li>
            </ul>
          </div>

          {/* Architecture & Future Modules */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[11px]">
              Platform Modules
            </h4>
            <ul className="space-y-1.5">
              <li>
                <Link to="/dashboard" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                  Module 1: Real-Time Monitoring
                </Link>
              </li>
              <li>
                <Link to="/roadmap" className="hover:text-emerald-500 dark:hover:text-emerald-400">
                  Modules 2–10: Platform Roadmap →
                </Link>
              </li>
              <li>
                <Link to="/pollutants" className="hover:text-zinc-900 dark:hover:text-zinc-200">
                  Pollutants & Health Limits
                </Link>
              </li>
            </ul>
          </div>

          {/* Medical Disclaimer */}
          <div className="space-y-2">
            <h4 className="font-semibold text-zinc-900 dark:text-zinc-200 uppercase tracking-wider text-[11px] flex items-center gap-1.5">
              <ShieldAlert className="w-3.5 h-3.5 text-amber-500" />
              Medical Disclaimer
            </h4>
            <p className="text-[11px] text-zinc-500 dark:text-zinc-500 leading-normal">
              ClearAir AI provides environmental risk interpretations based on ambient air pollution thresholds. Guidance does not constitute clinical medical diagnosis or prescription. Consult healthcare professionals for specific symptoms.
            </p>
          </div>
        </div>

        <div className="pt-6 border-t border-zinc-100 dark:border-zinc-900 flex flex-col sm:flex-row items-center justify-between gap-3 text-[11px]">
          <p>© {new Date().getFullYear()} ClearAir AI. Dedicated to clean air for every community.</p>
          <div className="flex items-center gap-4">
            <span className="text-zinc-400">Pure-Black Theme Optimized</span>
            <span>•</span>
            <span className="text-zinc-400">Real-Time Sensor Telemetry</span>
          </div>
        </div>
      </div>
    </footer>
  );
};
