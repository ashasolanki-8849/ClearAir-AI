import { AQICategory } from '../types';

export interface AQICategoryConfig {
  category: AQICategory;
  range: string;
  color: string; // pure hex color
  bgColor: string; // low opacity background
  borderColor: string;
  textColor: string;
  label: string;
  healthSummary: string;
}

export const AQI_CONFIGS: Record<AQICategory, AQICategoryConfig> = {
  Good: {
    category: 'Good',
    range: '0 - 50',
    color: '#10b981', // emerald-500
    bgColor: 'rgba(16, 185, 129, 0.12)',
    borderColor: '#059669',
    textColor: '#10b981',
    label: 'Good Air',
    healthSummary: 'Air quality is satisfactory and poses minimal risk.',
  },
  Satisfactory: {
    category: 'Satisfactory',
    range: '51 - 100',
    color: '#34d399', // emerald-400
    bgColor: 'rgba(52, 211, 153, 0.12)',
    borderColor: '#10b981',
    textColor: '#34d399',
    label: 'Satisfactory',
    healthSummary: 'Acceptable; minor sensitivity discomfort possible.',
  },
  Moderate: {
    category: 'Moderate',
    range: '101 - 200',
    color: '#f59e0b', // amber-500
    bgColor: 'rgba(245, 158, 11, 0.12)',
    borderColor: '#d97706',
    textColor: '#f59e0b',
    label: 'Moderate Smog',
    healthSummary: 'Breathing discomfort to sensitive groups; reduce exertion.',
  },
  Poor: {
    category: 'Poor',
    range: '201 - 300',
    color: '#f97316', // orange-500
    bgColor: 'rgba(249, 115, 22, 0.12)',
    borderColor: '#ea580c',
    textColor: '#f97316',
    label: 'Poor / Smoggy',
    healthSummary: 'Prolonged exposure causes breathing discomfort; mask advised.',
  },
  'Very Poor': {
    category: 'Very Poor',
    range: '301 - 400',
    color: '#ef4444', // red-500
    bgColor: 'rgba(239, 68, 68, 0.15)',
    borderColor: '#dc2626',
    textColor: '#ef4444',
    label: 'Very Poor',
    healthSummary: 'Respiratory risk on exposure; wear N95, keep windows closed.',
  },
  Severe: {
    category: 'Severe',
    range: '401 - 500+',
    color: '#991b1b', // red-800
    bgColor: 'rgba(153, 27, 27, 0.25)',
    borderColor: '#7f1d1d',
    textColor: '#f87171',
    label: 'Severe Smog Crisis',
    healthSummary: 'Hazardous conditions; healthy persons affected. Stay indoors.',
  },
};

export const getAQIConfig = (category: AQICategory | string): AQICategoryConfig => {
  return AQI_CONFIGS[category as AQICategory] || AQI_CONFIGS.Moderate;
};

export const formatPollutantValue = (val: number | null | undefined, unit: string = 'µg/m³'): string => {
  if (val == null) return 'N/A';
  return `${val} ${unit}`;
};

export const getWindDirectionLabel = (degrees: number): string => {
  const directions = ['N', 'NNE', 'NE', 'ENE', 'E', 'ESE', 'SE', 'SSE', 'S', 'SSW', 'SW', 'WSW', 'W', 'WNW', 'NW', 'NNW'];
  const index = Math.round((degrees % 360) / 22.5) % 16;
  return directions[index];
};
