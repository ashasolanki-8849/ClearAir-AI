import { Cloud, Droplets, Wind, Compass, AlertCircle } from 'lucide-react';
import { WeatherData } from '../../types';
import { Card } from '../common/Card';
import { getWindDirectionLabel } from '../../utils/aqiHelper';

interface WeatherCardProps {
  weather: WeatherData;
}

export const WeatherCard = ({ weather }: WeatherCardProps) => {
  const windDirText = getWindDirectionLabel(weather.windDirection);
  const isStagnant = weather.windSpeed < 5.0;

  return (
    <Card className="p-5">
      <div className="flex items-center justify-between pb-3 border-b border-zinc-100 dark:border-zinc-900">
        <div className="flex items-center gap-2">
          <Cloud className="w-4 h-4 text-zinc-400" />
          <h3 className="text-sm font-bold text-zinc-900 dark:text-zinc-100">
            Meteorological Conditions & Smog Trap
          </h3>
        </div>
        <span className="text-xs font-medium text-emerald-500">Live Weather</span>
      </div>

      <div className="mt-4 grid grid-cols-2 sm:grid-cols-4 gap-4 text-center">
        {/* Temperature */}
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-100 dark:border-zinc-900">
          <span className="text-[11px] uppercase font-mono text-zinc-400">Temperature</span>
          <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {weather.temperature}°C
          </p>
          <span className="text-[10px] text-zinc-500">{weather.condition}</span>
        </div>

        {/* Humidity */}
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-mono text-zinc-400">
            <Droplets className="w-3 h-3 text-cyan-500" />
            <span>Humidity</span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {weather.humidity}%
          </p>
          <span className="text-[10px] text-zinc-500">
            {weather.humidity > 70 ? 'High moisture locks smog' : 'Normal'}
          </span>
        </div>

        {/* Wind Speed */}
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-mono text-zinc-400">
            <Wind className="w-3 h-3 text-emerald-500" />
            <span>Wind Speed</span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {weather.windSpeed} <span className="text-xs font-normal">km/h</span>
          </p>
          <span className={`text-[10px] font-medium ${isStagnant ? 'text-amber-500' : 'text-zinc-500'}`}>
            {isStagnant ? 'Stagnant (Traps Smog)' : 'Breezy dispersion'}
          </span>
        </div>

        {/* Wind Direction */}
        <div className="p-3 rounded-lg bg-zinc-50 dark:bg-black/50 border border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-center gap-1 text-[11px] uppercase font-mono text-zinc-400">
            <Compass className="w-3 h-3 text-amber-500" />
            <span>Wind Direction</span>
          </div>
          <p className="mt-1 text-2xl font-bold font-mono text-zinc-900 dark:text-zinc-100">
            {windDirText}
          </p>
          <span className="text-[10px] text-zinc-500 font-mono">{weather.windDirection}° Azimuth</span>
        </div>
      </div>

      {/* Atmospheric Inversion Insight */}
      <div className="mt-4 p-3 rounded-lg bg-zinc-50 dark:bg-[#070707] border border-zinc-200/60 dark:border-zinc-800/80 flex items-start gap-2.5 text-xs text-zinc-600 dark:text-zinc-400">
        <AlertCircle className="w-4 h-4 text-amber-500 shrink-0 mt-0.5" />
        <p className="leading-relaxed">
          <strong className="text-zinc-800 dark:text-zinc-200">Winter Inversion Layer:</strong> Lower temperatures ({weather.temperature}°C) combined with low wind speeds ({weather.windSpeed} km/h) prevent vertical pollutant dispersion, creating a dense thermal inversion blanket over urban areas.
        </p>
      </div>
    </Card>
  );
};
