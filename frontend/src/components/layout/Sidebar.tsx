import { NavLink } from 'react-router-dom';
import {
  Activity,
  Layers,
  Bell,
  MapPin,
  User,
  Sparkles,
  Compass,
  Home,
  Navigation,
  TrendingUp,
  Leaf,
  Users,
  BarChart3,
  Sliders,
} from 'lucide-react';

export const Sidebar = () => {
  const activeClasses =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-semibold bg-zinc-900 text-white dark:bg-white dark:text-black transition-colors';
  const inactiveClasses =
    'flex items-center gap-3 px-3 py-2 rounded-lg text-xs font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900 transition-colors';

  const futureModules = [
    { id: 10, name: 'What-if Simulator', icon: Sliders },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16">
      {/* Active Modules Section (Module 1 & Module 2) */}
      <div className="mb-6 space-y-4">
        {/* Module 1: Core AQI Telemetry */}
        <div>
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 1: Telemetry
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/dashboard"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Activity className="w-4 h-4" />
              <span>AQI Dashboard</span>
            </NavLink>
            <NavLink
              to="/pollutants"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Layers className="w-4 h-4" />
              <span>Pollutant Telemetry</span>
            </NavLink>
            <NavLink
              to="/alerts"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Bell className="w-4 h-4" />
              <span>Pollution Alerts</span>
            </NavLink>
            <NavLink
              to="/locations"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <MapPin className="w-4 h-4" />
              <span>Saved Locations</span>
            </NavLink>
            <NavLink
              to="/profile"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <User className="w-4 h-4" />
              <span>Profile & Settings</span>
            </NavLink>
          </nav>
        </div>

        {/* Module 2: GenAI Smart Smog Assistant (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 2: GenAI
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/assistant"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Sparkles className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Smart Smog Assistant</span>
                <span className="text-[10px] opacity-70 font-normal">Real-Time Copilot</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 3: Personalized Daily Action Planner (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 3: Planner
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/planner"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Compass className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>My Daily Planner</span>
                <span className="text-[10px] opacity-70 font-normal">Diurnal Smog Timeline</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 4: Indoor Air Quality Intelligence & Guide (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 4: Indoor Guide
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/indoor"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Home className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Indoor Air Guide</span>
                <span className="text-[10px] opacity-70 font-normal">Sources, Purifiers & Ventilation</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 5: Low-Emission Travel Planner (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 5: Travel
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/travel"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Navigation className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Smart Travel Planner</span>
                <span className="text-[10px] opacity-70 font-normal">Clean Routes & Exposure</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 6: Pollution Forecast and Prediction (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 6: Forecast
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/forecast"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <TrendingUp className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Pollution Forecast</span>
                <span className="text-[10px] opacity-70 font-normal">7-Day & Hourly AI Models</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 7: Sustainable Living Advisor (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 7: Sustainable
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/sustainability"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Leaf className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Sustainable Advisor</span>
                <span className="text-[10px] opacity-70 font-normal">Green Habits & Alternatives</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 8: Community & Society Intelligence Platform (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 8: Community
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/community"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Users className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Community & Society</span>
                <span className="text-[10px] opacity-70 font-normal">Hotspots, Campaigns & RWAs</span>
              </div>
            </NavLink>
          </nav>
        </div>

        {/* Module 9: Environmental Impact Tracker & Intelligence (Active) */}
        <div className="pt-3 border-t border-zinc-100 dark:border-zinc-900">
          <div className="flex items-center justify-between px-2 mb-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
              Module 9: Impact Tracker
            </span>
            <span className="text-[10px] font-mono px-1.5 py-0.5 rounded bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 font-semibold">
              ACTIVE
            </span>
          </div>
          <nav className="flex flex-col space-y-1">
            <NavLink
              to="/impact"
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <BarChart3 className="w-4 h-4 text-emerald-400" />
              <div className="flex flex-col">
                <span>Impact Tracker</span>
                <span className="text-[10px] opacity-70 font-normal">Auditable Footprint & Goals</span>
              </div>
            </NavLink>
          </nav>
        </div>
      </div>

      {/* Future Modules Section (Architecture Prepared) */}
      <div className="pt-4 border-t border-zinc-200 dark:border-zinc-800/80">
        <div className="flex items-center justify-between px-2 mb-2">
          <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400">
            Upcoming Modules
          </span>
          <NavLink
            to="/roadmap"
            className="text-[10px] text-zinc-500 hover:text-emerald-500 dark:hover:text-emerald-400 font-medium"
          >
            View all
          </NavLink>
        </div>
        <div className="flex flex-col space-y-1">
          {futureModules.map((m) => {
            const Icon = m.icon;
            return (
              <NavLink
                key={m.id}
                to={`/roadmap#module-${m.id}`}
                className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-zinc-500 hover:text-zinc-800 hover:bg-zinc-100 dark:text-zinc-500 dark:hover:text-zinc-300 dark:hover:bg-zinc-900/60 transition-colors group"
              >
                <div className="flex items-center gap-2.5 truncate">
                  <Icon className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 transition-colors" />
                  <span className="truncate">{m.name}</span>
                </div>
                <span className="text-[9px] font-mono px-1.5 py-0.2 rounded bg-zinc-100 dark:bg-zinc-900 text-zinc-400">
                  M{m.id}
                </span>
              </NavLink>
            );
          })}
        </div>
      </div>

      {/* Environmental Data Source Info */}
      <div className="mt-auto pt-6 px-2 text-[11px] text-zinc-400">
        <div className="p-3 rounded-lg border border-zinc-200 bg-zinc-50 dark:border-zinc-800 dark:bg-[#070707]">
          <p className="font-semibold text-zinc-700 dark:text-zinc-300">Live AI Telemetry</p>
          <p className="mt-0.5 text-[10px] text-zinc-500">
            CPCB, Copernicus CAMS & Multilingual Smog Co-pilot
          </p>
        </div>
      </div>
    </aside>
  );
};
