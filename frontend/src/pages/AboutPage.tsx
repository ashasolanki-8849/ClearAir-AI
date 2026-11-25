import { Wind, Shield, Users, Heart } from 'lucide-react';
import { DashboardLayout } from '../components/layout/DashboardLayout';

export const AboutPage = () => {
  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            About ClearAir
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            A simple, practical guide for families and communities to navigate severe air pollution.
          </p>
        </div>

        <div className="prose dark:prose-invert text-xs sm:text-sm leading-relaxed text-zinc-600 dark:text-zinc-300 space-y-4">
          <p>
            During winter and seasonal changes, many cities experience dense smog and high pollution levels. 
            For families with children, elderly parents, students, and daily commuters, understanding what to do can be overwhelming.
          </p>

          <p>
            <strong>ClearAir</strong> was created with a single purpose: to take the confusion out of air quality. 
            Instead of complicated scientific jargon and technical charts, we provide clear pollution percentages, 
            simple safety tips, and a friendly AI Assistant to help you make safe everyday choices.
          </p>
        </div>

        {/* 3 Pillars */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 pt-4">
          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
              <Shield className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Protect Health</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Know when it is safe to step outside and how to protect yourself and your family from smog.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
              <Users className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Simple For Everyone</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Clear English, normalized percentage scales, and zero confusing technical jargon.
            </p>
          </div>

          <div className="p-5 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black shadow-sm space-y-2">
            <div className="p-2.5 rounded-xl bg-sky-500/10 text-sky-500 w-fit">
              <Heart className="w-5 h-5" />
            </div>
            <h3 className="font-bold text-sm text-zinc-900 dark:text-white">Real Impact</h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
              Actionable daily tips: clean travel options, indoor ventilation, and sustainable daily habits.
            </p>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
