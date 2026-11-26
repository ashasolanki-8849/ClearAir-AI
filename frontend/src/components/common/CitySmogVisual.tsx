import React from 'react';
import { CloudFog, ShieldCheck, MapPin, Eye } from 'lucide-react';

interface CitySmogVisualProps {
  locationName?: string;
  pollutionPercent?: number;
  status?: string;
}

export const CitySmogVisual: React.FC<CitySmogVisualProps> = ({
  locationName = 'Gandhinagar',
  pollutionPercent = 64,
  status = 'High',
}) => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-xl mx-auto rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-2xl bg-zinc-950 group select-none">
      {/* Bespoke Urban City & Winter Smog Illustration */}
      <svg
        className="w-full h-full"
        viewBox="0 0 800 600"
        fill="none"
        xmlns="http://www.w3.org/2000/svg"
        preserveAspectRatio="xMidYMid slice"
      >
        <defs>
          {/* Upper Winter Sky Gradient */}
          <linearGradient id="skyGrad" x1="400" y1="0" x2="400" y2="350" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="60%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          {/* Winter Thermal Inversion & Smog Band */}
          <linearGradient id="smogBandGrad" x1="400" y1="200" x2="400" y2="450" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#64748b" stopOpacity="0.3" />
            <stop offset="40%" stopColor="#78716c" stopOpacity="0.8" />
            <stop offset="80%" stopColor="#57534e" stopOpacity="0.95" />
            <stop offset="100%" stopColor="#292524" stopOpacity="0.98" />
          </linearGradient>

          {/* Ground Fog & Roadway Gradient */}
          <linearGradient id="groundGrad" x1="400" y1="450" x2="400" y2="600" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#18181b" />
            <stop offset="100%" stopColor="#09090b" />
          </linearGradient>

          {/* Building Shading */}
          <linearGradient id="bldgFar" x1="0" y1="150" x2="0" y2="400" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#334155" />
            <stop offset="100%" stopColor="#475569" />
          </linearGradient>

          <linearGradient id="bldgMid" x1="0" y1="180" x2="0" y2="480" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#1e293b" />
            <stop offset="100%" stopColor="#334155" />
          </linearGradient>

          <linearGradient id="bldgNear" x1="0" y1="220" x2="0" y2="520" gradientUnits="userSpaceOnUse">
            <stop offset="0%" stopColor="#0f172a" />
            <stop offset="100%" stopColor="#1e293b" />
          </linearGradient>
        </defs>

        {/* 1. Base Sky */}
        <rect width="800" height="600" fill="url(#skyGrad)" />

        {/* Pale Winter Sun veiled behind atmospheric haze */}
        <circle cx="620" cy="120" r="48" fill="#fef08a" fillOpacity="0.25" />
        <circle cx="620" cy="120" r="32" fill="#fef9c3" fillOpacity="0.5" />

        {/* 2. Distant Skyline Layer (Partially obscured by upper winter haze) */}
        <g opacity="0.45">
          {/* Spire Tower */}
          <rect x="120" y="140" width="35" height="280" rx="3" fill="url(#bldgFar)" />
          <polygon points="125,140 137,70 149,140" fill="url(#bldgFar)" />
          {/* Blocks */}
          <rect x="60" y="200" width="45" height="220" rx="2" fill="url(#bldgFar)" />
          <rect x="180" y="170" width="55" height="250" rx="2" fill="url(#bldgFar)" />
          <rect x="250" y="210" width="40" height="210" rx="2" fill="url(#bldgFar)" />
          <rect x="420" y="160" width="65" height="260" rx="2" fill="url(#bldgFar)" />
          <rect x="510" y="130" width="50" height="290" rx="2" fill="url(#bldgFar)" />
          <polygon points="520,130 535,85 550,130" fill="url(#bldgFar)" />
          <rect x="580" y="190" width="45" height="230" rx="2" fill="url(#bldgFar)" />
          <rect x="650" y="220" width="70" height="200" rx="2" fill="url(#bldgFar)" />
        </g>

        {/* 3. Mid-ground City Skyline Layer */}
        <g opacity="0.75">
          <rect x="90" y="210" width="60" height="250" rx="4" fill="url(#bldgMid)" />
          {/* Lit Windows */}
          <g fill="#93c5fd" fillOpacity="0.4">
            <rect x="100" y="230" width="8" height="6" rx="1" />
            <rect x="115" y="230" width="8" height="6" rx="1" />
            <rect x="130" y="230" width="8" height="6" rx="1" />
            <rect x="100" y="250" width="8" height="6" rx="1" />
            <rect x="130" y="250" width="8" height="6" rx="1" />
            <rect x="100" y="270" width="8" height="6" rx="1" />
            <rect x="115" y="270" width="8" height="6" rx="1" />
          </g>

          <rect x="220" y="190" width="75" height="270" rx="4" fill="url(#bldgMid)" />
          <rect x="310" y="240" width="55" height="220" rx="4" fill="url(#bldgMid)" />
          <rect x="470" y="180" width="80" height="280" rx="4" fill="url(#bldgMid)" />
          {/* Windows on 470 building */}
          <g fill="#fde047" fillOpacity="0.35">
            <rect x="485" y="200" width="10" height="7" rx="1" />
            <rect x="505" y="200" width="10" height="7" rx="1" />
            <rect x="525" y="200" width="10" height="7" rx="1" />
            <rect x="485" y="220" width="10" height="7" rx="1" />
            <rect x="525" y="220" width="10" height="7" rx="1" />
            <rect x="505" y="240" width="10" height="7" rx="1" />
          </g>
          <rect x="570" y="225" width="65" height="235" rx="4" fill="url(#bldgMid)" />
          <rect x="700" y="210" width="60" height="250" rx="4" fill="url(#bldgMid)" />
        </g>

        {/* 4. Foreground City Infrastructure */}
        <rect x="30" y="280" width="90" height="220" rx="6" fill="url(#bldgNear)" />
        <rect x="150" y="250" width="80" height="250" rx="6" fill="url(#bldgNear)" />
        <rect x="360" y="260" width="100" height="240" rx="6" fill="url(#bldgNear)" />
        <rect x="630" y="270" width="90" height="230" rx="6" fill="url(#bldgNear)" />

        {/* 5. Dense Winter Smog & Particulate Thermal Inversion Layer (Trapped at ground level) */}
        <rect x="0" y="230" width="800" height="260" fill="url(#smogBandGrad)" />

        {/* Floating Particulate Micro-layers and Inversion Horizon line */}
        <path d="M0,260 Q 200,245 400,265 T 800,250" stroke="#a8a29e" strokeWidth="2" strokeOpacity="0.3" fill="none" />
        <path d="M0,290 Q 250,275 500,295 T 800,285" stroke="#78716c" strokeWidth="3" strokeOpacity="0.4" fill="none" />
        <path d="M0,330 Q 180,315 420,335 T 800,325" stroke="#57534e" strokeWidth="4" strokeOpacity="0.5" fill="none" />

        {/* 6. City Promenade & Ground Level */}
        <rect x="0" y="470" width="800" height="130" fill="url(#groundGrad)" />
        <line x1="0" y1="470" x2="800" y2="470" stroke="#3f3f46" strokeWidth="2" />

        {/* Roadway & Clean Electric Bus / Commute silhouette */}
        <rect x="40" y="490" width="130" height="42" rx="8" fill="#1e293b" stroke="#38bdf8" strokeWidth="1.5" />
        <rect x="52" y="498" width="22" height="15" rx="3" fill="#38bdf8" fillOpacity="0.6" />
        <rect x="80" y="498" width="22" height="15" rx="3" fill="#38bdf8" fillOpacity="0.6" />
        <rect x="108" y="498" width="22" height="15" rx="3" fill="#38bdf8" fillOpacity="0.6" />
        <circle cx="68" cy="535" r="9" fill="#09090b" stroke="#52525b" strokeWidth="2" />
        <circle cx="140" cy="535" r="9" fill="#09090b" stroke="#52525b" strokeWidth="2" />

        {/* Streetlight with warm downward cone illuminating the smog particles */}
        <line x1="280" y1="360" x2="280" y2="470" stroke="#71717a" strokeWidth="3" />
        <line x1="280" y1="360" x2="260" y2="355" stroke="#71717a" strokeWidth="3" />
        <circle cx="260" cy="358" r="4" fill="#fbbf24" />
        <polygon points="260,360 210,470 310,470" fill="#fbbf24" fillOpacity="0.08" />

        {/* 7. Family / Citizens Safely Navigating City Promenade with Protective N95 Masks */}
        {/* Adult 1 (Parent) */}
        <g transform="translate(370, 395)">
          {/* Head & Mask */}
          <circle cx="20" cy="20" r="11" fill="#cbd5e1" />
          {/* White N95 mask shape */}
          <path d="M16 20 Q 24 22 28 20 Q 26 27 18 26 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Body / Winter Jacket */}
          <path d="M8 32 C 8 32, 12 75, 12 75 L 28 75 C 28 75, 32 32, 32 32 Z" fill="#0284c7" />
          {/* Legs */}
          <line x1="15" y1="75" x2="15" y2="105" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="25" y1="75" x2="25" y2="105" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
        </g>

        {/* Child safely holding hand wearing protective mask */}
        <g transform="translate(415, 430)">
          {/* Head & Mask */}
          <circle cx="15" cy="15" r="8" fill="#fed7aa" />
          <path d="M12 15 Q 18 17 21 15 Q 19 20 13 19 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
          {/* Body */}
          <path d="M6 24 C 6 24, 9 52, 9 52 L 21 52 C 21 52, 24 24, 24 24 Z" fill="#f59e0b" />
          {/* Legs */}
          <line x1="11" y1="52" x2="11" y2="70" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
          <line x1="19" y1="52" x2="19" y2="70" stroke="#0f172a" strokeWidth="3.5" strokeLinecap="round" />
        </g>

        {/* Adult 2 (Companion/Student) */}
        <g transform="translate(450, 400)">
          <circle cx="20" cy="20" r="11" fill="#e2e8f0" />
          <path d="M16 20 Q 24 22 28 20 Q 26 27 18 26 Z" fill="#ffffff" stroke="#94a3b8" strokeWidth="0.8" />
          <path d="M8 32 C 8 32, 12 75, 12 75 L 28 75 C 28 75, 32 32, 32 32 Z" fill="#334155" />
          <line x1="15" y1="75" x2="15" y2="100" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
          <line x1="25" y1="75" x2="25" y2="100" stroke="#0f172a" strokeWidth="4.5" strokeLinecap="round" />
        </g>
      </svg>

      {/* Floating Smog Reality Badge */}
      <div className="absolute top-4 left-4 z-10 flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-white/10 text-white text-xs font-semibold shadow-lg">
        <span className="w-2.5 h-2.5 rounded-full bg-amber-400 animate-pulse" />
        <span>Winter Smog Inversion</span>
        <span className="text-zinc-500">•</span>
        <span className="text-amber-300 font-mono">{pollutionPercent}% Smog</span>
      </div>

      {/* Floating Protective Advice Pill */}
      <div className="absolute top-4 right-4 z-10 hidden sm:flex items-center gap-1.5 px-3 py-1.5 rounded-full bg-sky-500/90 text-white text-[11px] font-bold backdrop-blur-md shadow-lg">
        <ShieldCheck className="w-3.5 h-3.5" />
        <span>Family Protection Active</span>
      </div>

      {/* Bottom Context Banner: Explaining the winter smog problem statement */}
      <div className="absolute bottom-4 left-4 right-4 z-10 p-4 rounded-2xl bg-black/85 backdrop-blur-md border border-white/10 text-white space-y-1">
        <div className="flex items-center justify-between">
          <span className="font-bold text-xs sm:text-sm text-zinc-100 flex items-center gap-1.5">
            <CloudFog className="w-4 h-4 text-sky-400" />
            <span>Urban Smog & Cold Temperature Inversion</span>
          </span>
          <span className="text-[11px] font-semibold text-zinc-400">
            {locationName}
          </span>
        </div>
        <p className="text-[11px] text-zinc-300 leading-relaxed">
          Cold winter air traps toxic exhaust and fine dust near breathing level. ClearAir helps you time routines, protect your family with N95 masks, and purify indoor air.
        </p>
      </div>
    </div>
  );
};
