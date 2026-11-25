import { useState } from 'react';
import { HelpCircle, ChevronDown, ChevronUp, Link as LinkIcon } from 'lucide-react';
import { Link } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';

interface FAQ {
  q: string;
  a: string;
}

const faqs: FAQ[] = [
  {
    q: 'How does ClearAir calculate the pollution percentage?',
    a: 'We use real air-quality readings from environmental stations near your location and normalize them into a clear 0% to 100% scale. Lower numbers (0%–25%) mean clean air, while higher numbers (51%–100%) mean high or very high pollution.',
  },
  {
    q: 'What should I do when pollution is High (51%–75%) or Very High (76%–100%)?',
    a: 'When pollution is High or Very High, try to avoid outdoor running and heavy exercise, especially during cold mornings and late evenings. Keep doors and windows closed when outdoor air is poor, and wear a well-fitting mask if you need to travel outside.',
  },
  {
    q: 'How does the AI Assistant help me?',
    a: 'The AI Assistant is designed to answer your everyday questions in simple English. You can ask if it is safe to exercise outside, how to keep your home air clean, when the best time to travel is, or what precautions to take for your children or elderly family members.',
  },
  {
    q: 'How does Smart Travel work?',
    a: 'You enter your starting point and destination. Smart Travel displays the route on the map with estimated travel time and distance. Whenever nearby pollution data is available along alternative routes, it highlights a lower-pollution route to help you reduce exposure.',
  },
  {
    q: 'Is my location data safe?',
    a: 'Yes. Your location is strictly used in your browser to fetch air quality near you and calculate travel routes. We do not sell or track your location for advertising.',
  },
  {
    q: 'What if pollution data is not available for my area?',
    a: 'If an official monitoring station is temporarily offline or does not cover your exact location, ClearAir clearly states that data is unavailable rather than showing fake or guessed numbers.',
  },
];

export const HelpPage = () => {
  const [openIndex, setOpenIndex] = useState<number | null>(0);

  const toggle = (idx: number) => {
    setOpenIndex(openIndex === idx ? null : idx);
  };

  return (
    <DashboardLayout>
      <div className="max-w-3xl mx-auto space-y-8">
        <div>
          <h1 className="text-2xl sm:text-3xl font-bold tracking-tight text-zinc-900 dark:text-white">
            Help Center
          </h1>
          <p className="mt-1 text-sm text-zinc-500 dark:text-zinc-400">
            Find simple answers to common questions about using ClearAir.
          </p>
        </div>

        {/* FAQs */}
        <div className="space-y-3">
          {faqs.map((faq, index) => {
            const isOpen = openIndex === index;
            return (
              <div
                key={index}
                className="rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden shadow-sm"
              >
                <button
                  onClick={() => toggle(index)}
                  className="w-full p-4 sm:p-5 text-left flex items-center justify-between gap-4 font-semibold text-xs sm:text-sm text-zinc-900 dark:text-white hover:bg-zinc-50 dark:hover:bg-zinc-900/50 transition-colors"
                >
                  <span>{faq.q}</span>
                  {isOpen ? (
                    <ChevronUp className="w-4 h-4 text-zinc-400 shrink-0" />
                  ) : (
                    <ChevronDown className="w-4 h-4 text-zinc-400 shrink-0" />
                  )}
                </button>
                {isOpen && (
                  <div className="px-4 pb-4 sm:px-5 sm:pb-5 pt-0 text-xs text-zinc-600 dark:text-zinc-300 leading-relaxed border-t border-zinc-100 dark:border-zinc-900">
                    <p className="mt-3">{faq.a}</p>
                  </div>
                )}
              </div>
            );
          })}
        </div>

        {/* Still Need Help? */}
        <div className="p-6 rounded-2xl border border-sky-200 dark:border-sky-900/30 bg-sky-50/50 dark:bg-sky-950/20 text-center space-y-2">
          <h2 className="text-sm font-bold text-zinc-900 dark:text-white">
            Still have questions?
          </h2>
          <p className="text-xs text-zinc-600 dark:text-zinc-400 max-w-sm mx-auto">
            Our team is here to help. Reach out through our contact page anytime.
          </p>
          <div className="pt-2">
            <Link
              to="/contact"
              className="inline-flex items-center gap-1.5 px-4 py-2 rounded-xl bg-sky-500 hover:bg-sky-600 text-white font-semibold text-xs transition-colors"
            >
              Contact Support
            </Link>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
