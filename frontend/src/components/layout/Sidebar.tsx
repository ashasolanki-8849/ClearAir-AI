import { NavLink } from 'react-router-dom';
import {
  CloudFog,
  Sparkles,
  Bell,
  Navigation,
  Calendar,
  CheckCircle2,
  Settings,
  LayoutDashboard,
  Users,
} from 'lucide-react';
import { useAQI } from '../../context/AQIContext';
import { calculatePollutionMetrics } from '../../utils/pollutionScale';

export const Sidebar = () => {
  const { aqiData } = useAQI();
  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const activeClasses =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-semibold bg-sky-50 text-sky-600 dark:bg-zinc-900 dark:text-sky-400 border border-sky-200 dark:border-zinc-800 transition-colors shadow-sm';
  const inactiveClasses =
    'flex items-center gap-3 px-3.5 py-2.5 rounded-xl text-sm font-medium text-zinc-600 hover:text-zinc-900 hover:bg-zinc-100 dark:text-zinc-400 dark:hover:text-zinc-200 dark:hover:bg-zinc-900/80 transition-colors';

  const menuItems = [
    {
      name: 'Air Pollution',
      path: '/pollution',
      icon: CloudFog,
      badge: `${metrics.pollutionPercent}%`,
      badgeColor: metrics.statusColor,
    },
    {
      name: 'AI Assistant',
      path: '/assistant',
      icon: Sparkles,
      highlight: true,
    },
    {
      name: 'Alerts',
      path: '/alerts',
      icon: Bell,
    },
    {
      name: 'Smart Travel',
      path: '/travel',
      icon: Navigation,
    },
    {
      name: 'Pollution Forecast',
      path: '/forecast',
      icon: Calendar,
    },
    {
      name: 'What To Do',
      path: '/what-to-do',
      icon: CheckCircle2,
    },
    {
      name: 'Community',
      path: '/community',
      icon: Users,
    },
    {
      name: 'Profile & Settings',
      path: '/profile',
      icon: Settings,
    },
  ];

  return (
    <aside className="hidden lg:flex flex-col w-64 shrink-0 border-r border-zinc-200 bg-white p-4 dark:border-zinc-800 dark:bg-black overflow-y-auto max-h-[calc(100vh-4rem)] sticky top-16">
      <div className="mb-3 px-2">
        <NavLink
          to="/dashboard"
          className={({ isActive }) =>
            `flex items-center gap-3 px-3.5 py-2 rounded-xl text-xs font-semibold ${
              isActive
                ? 'bg-zinc-900 text-white dark:bg-white dark:text-black'
                : 'text-zinc-500 hover:text-zinc-900 dark:text-zinc-400 dark:hover:text-white'
            } transition-colors`
          }
        >
          <LayoutDashboard className="w-4 h-4" />
          <span>Dashboard Overview</span>
        </NavLink>
      </div>

      <div className="px-2 mb-2">
        <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400 dark:text-zinc-500">
          Main Features
        </span>
      </div>

      <nav className="flex flex-col space-y-1.5">
        {menuItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              className={({ isActive }) => (isActive ? activeClasses : inactiveClasses)}
            >
              <Icon className="w-4 h-4 shrink-0" />
              <span className="flex-1 truncate">{item.name}</span>
              {item.badge && (
                <span className={`text-xs font-bold font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-900 ${item.badgeColor}`}>
                  {item.badge}
                </span>
              )}
            </NavLink>
          );
        })}
      </nav>

      {/* Simple Quick Summary Card at bottom of sidebar */}
      <div className="mt-auto pt-6">
        <div className="p-3.5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/70 dark:bg-zinc-950/60">
          <div className="flex items-center justify-between text-xs mb-1.5">
            <span className="text-zinc-500 dark:text-zinc-400">Air Status</span>
            <span className={`font-bold ${metrics.statusColor}`}>{metrics.status}</span>
          </div>
          <p className="text-[11px] text-zinc-600 dark:text-zinc-300 line-clamp-2 leading-relaxed">
            {metrics.shortAdvice}
          </p>
        </div>
      </div>
    </aside>
  );
};
