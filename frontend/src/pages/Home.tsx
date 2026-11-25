import { Link } from 'react-router-dom';
import {
  CloudFog,
  Sparkles,
  Bell,
  Navigation,
  Calendar,
  CheckCircle2,
  ArrowRight,
  ShieldCheck,
  MapPin,
} from 'lucide-react';
import { Navbar } from '../components/layout/Navbar';
import { Footer } from '../components/layout/Footer';
import { CitySmogVisual } from '../components/common/CitySmogVisual';
import { useAQI } from '../context/AQIContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import { useState } from 'react';
import { LocationSelectorModal } from '../components/dashboard/LocationSelectorModal';

export const Home = () => {
  const { location, aqiData } = useAQI();
  const [isLocationModalOpen, setIsLocationModalOpen] = useState(false);
  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

  const features = [
    {
      icon: CloudFog,
      title: 'Check pollution near you',
      description: 'See current pollution and smog levels in your area using a clear percentage score.',
      link: '/pollution',
    },
    {
      icon: Sparkles,
      title: 'Ask the AI assistant',
      description: 'Get immediate, friendly advice in simple English on how to protect your family.',
      link: '/assistant',
    },
    {
      icon: Bell,
      title: 'Receive pollution alerts',
      description: 'Know when air quality becomes unsafe or when smog spikes suddenly.',
      link: '/alerts',
    },
    {
      icon: Navigation,
      title: 'Plan safer travel',
      description: 'Find lower-pollution travel routes to avoid breathing heavy roadside exhaust.',
      link: '/travel',
    },
    {
      icon: Calendar,
      title: 'Check pollution forecast',
      description: 'See simple day-by-day pollution predictions to plan your week ahead safely.',
      link: '/forecast',
    },
    {
      icon: CheckCircle2,
      title: 'Learn what actions to take',
      description: 'Simple everyday steps to keep indoor air clean and reduce personal smog exposure.',
      link: '/what-to-do',
    },
  ];

  return (
    <div className="min-h-screen flex flex-col bg-white text-zinc-900 dark:bg-black dark:text-zinc-100 transition-colors">
      <Navbar onOpenLocationModal={() => setIsLocationModalOpen(true)} />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-12 sm:py-20 px-4 sm:px-6 lg:px-8 max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-12 items-center">
            {/* Left Column: Heading, Description, Buttons */}
            <div className="space-y-6 text-center lg:text-left">
              {/* Simple Location Pill */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-xs font-medium text-zinc-700 dark:text-zinc-300">
                <MapPin className="w-3.5 h-3.5 text-sky-500" />
                <span>Monitoring: {location.name}</span>
                {metrics.isDataAvailable && (
                  <span className={`font-bold ml-1 ${metrics.statusColor}`}>
                    ({metrics.pollutionPercent}% • {metrics.status})
                  </span>
                )}
              </div>

              <h1 className="text-4xl sm:text-5xl lg:text-6xl font-extrabold tracking-tight text-zinc-900 dark:text-white leading-[1.15]">
                Know Your Air. <br />
                <span className="text-sky-500">Stay Safe.</span>
              </h1>

              <p className="text-base sm:text-lg text-zinc-600 dark:text-zinc-400 max-w-xl mx-auto lg:mx-0 leading-relaxed">
                Check pollution near you, understand today's air quality, and get simple advice to protect yourself and your family.
              </p>

              {/* Only Two Main Action Buttons as strictly specified */}
              <div className="flex flex-col sm:flex-row items-center justify-center lg:justify-start gap-3.5 pt-2">
                <Link
                  to="/pollution"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-sm shadow-md transition-colors"
                >
                  <CloudFog className="w-4 h-4" />
                  <span>Check Air Quality</span>
                </Link>

                <Link
                  to="/register"
                  className="w-full sm:w-auto inline-flex items-center justify-center gap-2 px-6 py-3.5 rounded-xl border border-zinc-300 dark:border-zinc-700 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-900 dark:text-white font-semibold text-sm transition-colors"
                >
                  <span>Get Started</span>
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>

              {/* Simple Safety Note */}
              <p className="text-xs text-zinc-500 dark:text-zinc-400 pt-1">
                ✓ Free to use • No complicated numbers • Made for everyone
              </p>
            </div>

            {/* Right Column: Realistic Visual */}
            <div className="flex justify-center">
              <CitySmogVisual />
            </div>
          </div>
        </section>

        {/* Simple "What You Can Do" Section */}
        <section className="py-14 sm:py-20 border-t border-zinc-200 dark:border-zinc-800 bg-zinc-50/60 dark:bg-zinc-950/40">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center max-w-2xl mx-auto mb-12 space-y-2">
              <h2 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
                Everything You Need To Stay Protected
              </h2>
              <p className="text-sm text-zinc-500 dark:text-zinc-400">
                Simple tools designed to help you navigate severe smog and urban pollution.
              </p>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {features.map((item, idx) => {
                const Icon = item.icon;
                return (
                  <Link
                    key={idx}
                    to={item.link}
                    className="p-6 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black hover:border-sky-400 dark:hover:border-sky-600 transition-all shadow-sm group"
                  >
                    <div className="p-3 rounded-xl bg-sky-500/10 text-sky-500 dark:bg-sky-500/20 dark:text-sky-400 w-fit mb-4 group-hover:scale-105 transition-transform">
                      <Icon className="w-5 h-5" />
                    </div>
                    <h3 className="font-bold text-base text-zinc-900 dark:text-white mb-1.5 flex items-center justify-between">
                      <span>{item.title}</span>
                      <ArrowRight className="w-4 h-4 text-zinc-400 group-hover:text-sky-500 group-hover:translate-x-1 transition-all" />
                    </h3>
                    <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                      {item.description}
                    </p>
                  </Link>
                );
              })}
            </div>
          </div>
        </section>
      </main>

      <Footer />

      <LocationSelectorModal
        isOpen={isLocationModalOpen}
        onClose={() => setIsLocationModalOpen(false)}
      />
    </div>
  );
};
