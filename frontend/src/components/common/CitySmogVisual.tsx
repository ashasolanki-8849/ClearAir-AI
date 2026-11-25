import React from 'react';

export const CitySmogVisual = () => {
  return (
    <div className="relative w-full aspect-[4/3] max-w-xl mx-auto rounded-3xl overflow-hidden border border-zinc-200 dark:border-zinc-800 shadow-xl bg-gradient-to-b from-sky-100/70 via-amber-100/40 to-zinc-200 dark:from-zinc-950 dark:via-zinc-900 dark:to-black">
      {/* City Skyline & Winter Smog Visual SVG */}
      <svg
        viewBox="0 0 600 450"
        className="w-full h-full object-cover"
        xmlns="http://www.w3.org/2000/svg"
      >
        <defs>
          {/* Sky Gradient: polluted smog layer at bottom, transitioning */}
          <linearGradient id="smogHaze" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#93c5fd" stopOpacity="0.4" />
            <stop offset="35%" stopColor="#cbd5e1" stopOpacity="0.6" />
            <stop offset="65%" stopColor="#f59e0b" stopOpacity="0.35" />
            <stop offset="100%" stopColor="#64748b" stopOpacity="0.8" />
          </linearGradient>

          {/* Winter Inversion Fog Layer */}
          <linearGradient id="fogInversion" x1="0%" y1="0%" x2="0%" y2="100%">
            <stop offset="0%" stopColor="#cbd5e1" stopOpacity="0" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.55" />
            <stop offset="100%" stopColor="#475569" stopOpacity="0.85" />
          </linearGradient>

          {/* Clean air bubble mask */}
          <linearGradient id="cleanSide" x1="0%" y1="0%" x2="100%" y2="0%">
            <stop offset="0%" stopColor="#38bdf8" stopOpacity="0.25" />
            <stop offset="50%" stopColor="#94a3b8" stopOpacity="0.1" />
            <stop offset="100%" stopColor="#f97316" stopOpacity="0.3" />
          </linearGradient>
        </defs>

        {/* Pale winter morning sky */}
        <rect width="600" height="450" fill="url(#smogHaze)" />

        {/* Distant tall urban skyline silhouettes */}
        <path
          d="M30 450 V210 H70 V450 M80 450 V180 H120 V450 M140 450 V240 H180 V450 M195 450 V160 H250 V450 M265 450 V220 H300 V450 M320 450 V190 H370 V450 M390 450 V150 H450 V450 M470 450 V230 H510 V450 M530 450 V175 H580 V450"
          fill="#334155"
          opacity="0.35"
        />

        {/* Midground urban buildings partially shrouded by smog */}
        <path
          d="M0 450 V270 H45 V450 M60 450 V240 H110 V450 M130 450 V290 H170 V450 M185 450 V210 H235 V450 M250 450 V260 H290 V450 M310 450 V230 H360 V450 M380 450 V275 H430 V450 M450 450 V220 H500 V450 M520 450 V280 H570 V450 M585 450 V250 H600 V450"
          fill="#1e293b"
          opacity="0.6"
        />

        {/* Dense winter morning inversion fog layer hovering across buildings (180px - 340px) */}
        <rect x="0" y="210" width="600" height="150" fill="url(#fogInversion)" />

        {/* Atmospheric smog haze bands */}
        <path
          d="M0 240 Q150 220 300 245 T600 230 V310 H0 Z"
          fill="#cbd5e1"
          opacity="0.45"
        />
        <path
          d="M0 270 Q200 290 400 260 T600 280 V360 H0 Z"
          fill="#94a3b8"
          opacity="0.5"
        />

        {/* Foreground urban street, sidewalks, and clean pedestrian zone */}
        <rect x="0" y="360" width="600" height="90" fill="#0f172a" opacity="0.95" />
        <line x1="0" y1="362" x2="600" y2="362" stroke="#475569" strokeWidth="2" />

        {/* Street lights & road markings */}
        <line x1="120" y1="410" x2="180" y2="410" stroke="#64748b" strokeWidth="3" strokeDasharray="16,12" />
        <line x1="260" y1="410" x2="320" y2="410" stroke="#64748b" strokeWidth="3" strokeDasharray="16,12" />
        <line x1="400" y1="410" x2="460" y2="410" stroke="#64748b" strokeWidth="3" strokeDasharray="16,12" />

        {/* Person / Family walking safely with protective precautions */}
        {/* Parent figure */}
        <g transform="translate(190, 315)">
          {/* Head */}
          <circle cx="20" cy="12" r="7" fill="#f8fafc" />
          {/* Mask indication */}
          <rect x="18" y="13" width="7" height="4" rx="1.5" fill="#38bdf8" />
          {/* Body */}
          <path d="M12 21 C12 21 16 48 16 65 L24 65 C24 48 28 21 28 21 Z" fill="#38bdf8" />
          {/* Arms */}
          <line x1="13" y1="26" x2="8" y2="44" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          <line x1="27" y1="26" x2="34" y2="40" stroke="#38bdf8" strokeWidth="3" strokeLinecap="round" />
          {/* Legs */}
          <line x1="17" y1="65" x2="16" y2="84" stroke="#0f172a" strokeWidth="4" />
          <line x1="23" y1="65" x2="25" y2="84" stroke="#0f172a" strokeWidth="4" />
        </g>

        {/* Child walking safely holding parent hand */}
        <g transform="translate(225, 335)">
          {/* Child Head */}
          <circle cx="14" cy="10" r="5.5" fill="#f8fafc" />
          {/* Mask */}
          <rect x="13" y="11" width="5" height="3" rx="1" fill="#38bdf8" />
          {/* Child Body */}
          <path d="M8 17 C8 17 11 40 11 50 L17 50 C17 40 20 17 20 17 Z" fill="#e2e8f0" />
          {/* Child hand connected */}
          <line x1="8" y1="21" x2="0" y2="21" stroke="#e2e8f0" strokeWidth="2.5" strokeLinecap="round" />
          {/* Child Legs */}
          <line x1="11" y1="50" x2="10" y2="64" stroke="#0f172a" strokeWidth="3" />
          <line x1="17" y1="50" x2="18" y2="64" stroke="#0f172a" strokeWidth="3" />
        </g>

        {/* Clear vs Smog demarcation badge on right */}
        <g transform="translate(380, 280)">
          <rect x="0" y="0" width="180" height="60" rx="16" fill="#000000" fillOpacity="0.85" stroke="#334155" strokeWidth="1.5" />
          <circle cx="24" cy="30" r="7" fill="#ef4444" />
          <text x="40" y="24" fill="#ffffff" fontSize="12" fontWeight="bold" fontFamily="sans-serif">
            Pollution: 78%
          </text>
          <text x="40" y="42" fill="#cbd5e1" fontSize="10" fontFamily="sans-serif">
            Winter Inversion Smog
          </text>
        </g>
      </svg>

      {/* Floating real-time status pill overlay */}
      <div className="absolute top-4 left-4 backdrop-blur-md bg-white/90 dark:bg-black/80 border border-zinc-200 dark:border-zinc-800 px-3.5 py-1.5 rounded-full flex items-center gap-2 text-xs font-semibold shadow-md">
        <span className="w-2.5 h-2.5 rounded-full bg-sky-500 animate-pulse" />
        <span className="text-zinc-800 dark:text-zinc-200">Winter Smog Advisory Active</span>
      </div>
    </div>
  );
};
