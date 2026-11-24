import React, { useState } from 'react';
import { TravelPriority, SavedPlaceData } from '../../types';
import {
  MapPin,
  Navigation,
  ArrowUpDown,
  Search,
  Crosshair,
  SlidersHorizontal,
  Home,
  Briefcase,
  GraduationCap,
  Sparkles,
  ShieldAlert,
  Clock,
  Leaf,
  DollarSign,
  Scale,
} from 'lucide-react';
import { Button } from '../common/Button';

interface RouteSearchFormProps {
  originName: string;
  destinationName: string;
  onOriginChange: (val: string, coords?: { lat: number; lon: number }) => void;
  onDestinationChange: (val: string, coords?: { lat: number; lon: number }) => void;
  onSwap: () => void;
  priority: TravelPriority;
  onPriorityChange: (p: TravelPriority) => void;
  preferredMode: string;
  onModeChange: (m: string) => void;
  savedPlaces: SavedPlaceData[];
  onSearch: () => void;
  isLoading: boolean;
  onDetectLocation: () => void;
  isDetectingLocation: boolean;
}

const NCR_PRESETS = [
  { name: 'Connaught Place, Central Delhi', lat: 28.6315, lon: 77.2167 },
  { name: 'Cyber City, Gurugram', lat: 28.4986, lon: 77.0878 },
  { name: 'Electronic City, Noida Sector 62', lat: 28.6258, lon: 77.3789 },
  { name: 'Dwarka Sector 21, South West Delhi', lat: 28.5522, lon: 77.0583 },
  { name: 'North Campus, Delhi University', lat: 28.6924, lon: 77.2104 },
  { name: 'Nehru Place, South Delhi', lat: 28.5494, lon: 77.2528 },
];

export const RouteSearchForm: React.FC<RouteSearchFormProps> = ({
  originName,
  destinationName,
  onOriginChange,
  onDestinationChange,
  onSwap,
  priority,
  onPriorityChange,
  preferredMode,
  onModeChange,
  savedPlaces,
  onSearch,
  isLoading,
  onDetectLocation,
  isDetectingLocation,
}) => {
  const [showAdvanced, setShowAdvanced] = useState(false);

  const priorities: { id: TravelPriority; label: string; icon: any; desc: string }[] = [
    {
      id: 'balanced',
      label: 'Balanced',
      icon: Scale,
      desc: 'Optimal trade-off between clean air, transit speed, and low carbon',
    },
    {
      id: 'lowest_exposure',
      label: 'Lowest Exposure',
      icon: ShieldAlert,
      desc: 'Minimizes PM2.5 inhalation dose & diesel corridor transit',
    },
    {
      id: 'fastest',
      label: 'Fastest',
      icon: Clock,
      desc: 'Quickest travel time via primary arterial highways',
    },
    {
      id: 'lowest_emissions',
      label: 'Zero / Low Carbon',
      icon: Leaf,
      desc: 'Prioritizes grade-separated rail transit and non-motorized travel',
    },
    {
      id: 'lowest_cost',
      label: 'Most Economical',
      icon: DollarSign,
      desc: 'Lowest overall passenger trip fare',
    },
  ];

  const modes = [
    { id: 'all', label: 'All Modes' },
    { id: 'metro', label: 'Metro Rail' },
    { id: 'bus', label: 'Public Bus' },
    { id: 'carpool', label: 'Carpooling' },
    { id: 'electric_vehicle', label: 'Electric Vehicle' },
    { id: 'car', label: 'Private Car' },
    { id: 'two_wheeler', label: 'Two-Wheeler' },
    { id: 'cycling', label: 'Cycling' },
    { id: 'walking', label: 'Walking' },
  ];

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-5">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-lg font-bold text-zinc-900 dark:text-zinc-100 flex items-center gap-2">
            <Navigation className="w-5 h-5 text-emerald-500" />
            Route & Trip Planner
          </h2>
          <p className="text-xs text-zinc-500 dark:text-zinc-400 mt-0.5">
            Compare travel time against real inhaled PM2.5 dose & CO₂ emissions
          </p>
        </div>

        <button
          onClick={() => setShowAdvanced(!showAdvanced)}
          className="text-xs font-medium text-zinc-600 dark:text-zinc-400 hover:text-emerald-500 dark:hover:text-emerald-400 flex items-center gap-1.5 px-3 py-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:border-zinc-300 dark:hover:border-zinc-700 transition-colors"
        >
          <SlidersHorizontal className="w-3.5 h-3.5" />
          <span>{showAdvanced ? 'Hide Options' : 'Preferences'}</span>
        </button>
      </div>

      {/* Input Group */}
      <div className="relative space-y-3">
        {/* Origin */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-emerald-500">
            <div className="w-2.5 h-2.5 rounded-full bg-emerald-500 ring-4 ring-emerald-500/20" />
          </div>
          <input
            type="text"
            value={originName}
            onChange={(e) => onOriginChange(e.target.value)}
            placeholder="Starting Point (e.g. Connaught Place, New Delhi)"
            className="w-full pl-10 pr-24 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
          <button
            onClick={onDetectLocation}
            disabled={isDetectingLocation}
            className="absolute right-2 px-2.5 py-1 text-xs font-medium text-emerald-600 dark:text-emerald-400 bg-emerald-50 dark:bg-emerald-950/40 hover:bg-emerald-100 dark:hover:bg-emerald-900/60 rounded-lg flex items-center gap-1 transition-colors disabled:opacity-50"
            title="Use current GPS location"
          >
            <Crosshair className={`w-3 h-3 ${isDetectingLocation ? 'animate-spin' : ''}`} />
            <span>GPS</span>
          </button>
        </div>

        {/* Swap Button */}
        <div className="absolute right-8 top-10 z-10">
          <button
            onClick={onSwap}
            className="p-1.5 rounded-full bg-white dark:bg-zinc-800 border border-zinc-200 dark:border-zinc-700 text-zinc-600 dark:text-zinc-300 hover:text-emerald-500 dark:hover:text-emerald-400 shadow-sm transition-transform active:scale-95"
            title="Swap Origin and Destination"
          >
            <ArrowUpDown className="w-3.5 h-3.5" />
          </button>
        </div>

        {/* Destination */}
        <div className="relative flex items-center">
          <div className="absolute left-3.5 text-red-500">
            <MapPin className="w-4 h-4 text-red-500" />
          </div>
          <input
            type="text"
            value={destinationName}
            onChange={(e) => onDestinationChange(e.target.value)}
            placeholder="Destination (e.g. Cyber City, Gurugram)"
            className="w-full pl-10 pr-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 dark:focus:ring-emerald-400"
          />
        </div>
      </div>

      {/* Saved Places & NCR Presets Quick Chips */}
      <div className="flex flex-wrap items-center gap-1.5 text-xs">
        <span className="text-zinc-400 dark:text-zinc-500 mr-1 font-medium">Quick Pick:</span>

        {/* User Saved Places */}
        {savedPlaces.map((place) => {
          let Icon = MapPin;
          if (place.label === 'home') Icon = Home;
          if (place.label === 'office') Icon = Briefcase;
          if (place.label === 'college') Icon = GraduationCap;

          return (
            <button
              key={place._id}
              onClick={() => onDestinationChange(place.address || place.customName || place.label, place.coordinates)}
              className="px-2.5 py-1 bg-zinc-100 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-700 dark:text-zinc-300 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg border border-zinc-200 dark:border-zinc-800 flex items-center gap-1 transition-colors"
            >
              <Icon className="w-3 h-3 text-emerald-500" />
              <span className="capitalize">{place.customName || place.label}</span>
            </button>
          );
        })}

        {/* NCR Presets */}
        {NCR_PRESETS.slice(0, 3).map((p) => (
          <button
            key={p.name}
            onClick={() => onDestinationChange(p.name, { lat: p.lat, lon: p.lon })}
            className="px-2 py-1 bg-zinc-50 dark:bg-zinc-900/50 hover:bg-zinc-100 dark:hover:bg-zinc-800 text-zinc-600 dark:text-zinc-400 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors"
          >
            {p.name.split(',')[0]}
          </button>
        ))}
      </div>

      {/* Priority Selector */}
      <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900">
        <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
          Travel Optimization Priority
        </label>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-2">
          {priorities.map((item) => {
            const Icon = item.icon;
            const isSelected = priority === item.id;
            return (
              <button
                key={item.id}
                type="button"
                onClick={() => onPriorityChange(item.id)}
                className={`p-2.5 rounded-xl border text-left transition-all ${
                  isSelected
                    ? 'bg-emerald-50/70 dark:bg-emerald-950/30 border-emerald-500 dark:border-emerald-500 text-emerald-900 dark:text-emerald-300 shadow-sm ring-1 ring-emerald-500'
                    : 'bg-zinc-50 dark:bg-zinc-900 border-zinc-200 dark:border-zinc-800 text-zinc-700 dark:text-zinc-300 hover:border-zinc-300 dark:hover:border-zinc-700'
                }`}
              >
                <div className="flex items-center gap-1.5 mb-1">
                  <Icon
                    className={`w-3.5 h-3.5 ${
                      isSelected ? 'text-emerald-600 dark:text-emerald-400' : 'text-zinc-400'
                    }`}
                  />
                  <span className="text-xs font-semibold">{item.label}</span>
                </div>
                <p className="text-[10px] text-zinc-500 dark:text-zinc-400 line-clamp-2 leading-tight">
                  {item.desc}
                </p>
              </button>
            );
          })}
        </div>
      </div>

      {/* Advanced / Mode Selection */}
      {showAdvanced && (
        <div className="space-y-2 pt-2 border-t border-zinc-100 dark:border-zinc-900 animate-fadeIn">
          <label className="text-xs font-semibold text-zinc-700 dark:text-zinc-300 block">
            Preferred Transportation Mode
          </label>
          <div className="flex flex-wrap gap-1.5">
            {modes.map((m) => (
              <button
                key={m.id}
                onClick={() => onModeChange(m.id)}
                className={`text-xs px-3 py-1.5 rounded-xl border font-medium transition-all ${
                  preferredMode === m.id
                    ? 'bg-zinc-900 text-white dark:bg-white dark:text-black border-zinc-900 dark:border-white shadow-sm'
                    : 'bg-zinc-50 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 border-zinc-200 dark:border-zinc-800 hover:border-zinc-400'
                }`}
              >
                {m.label}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Submit Action */}
      <Button
        onClick={onSearch}
        isLoading={isLoading}
        className="w-full flex items-center justify-center gap-2 py-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white font-semibold text-sm shadow-md transition-all active:scale-[0.99]"
      >
        <Search className="w-4 h-4" />
        <span>Analyze Low-Emission Routes</span>
      </Button>
    </div>
  );
};
