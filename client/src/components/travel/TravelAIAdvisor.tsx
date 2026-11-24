import React, { useState } from 'react';
import {
  Sparkles,
  Send,
  MessageSquare,
  Bot,
  User,
  ShieldAlert,
  Clock,
  Car,
  Leaf,
  Info,
} from 'lucide-react';
import { Button } from '../common/Button';
import { travelService } from '../../services/travelService';
import { TravelAIAnswerData } from '../../types';

interface TravelAIAdvisorProps {
  outdoorAqi: number;
  originName?: string;
  destinationName?: string;
  selectedMode?: string;
  userCategory?: string;
}

const SUGGESTED_QUESTIONS = [
  'Is it safe to cycle to work or college in this air?',
  'Why is metro rail safer than an open auto-rickshaw during severe smog?',
  'How do I use car AC recirculation to block 80% of diesel exhaust?',
  'What is the optimal time to travel today to avoid the smog inversion?',
];

export const TravelAIAdvisor: React.FC<TravelAIAdvisorProps> = ({
  outdoorAqi,
  originName,
  destinationName,
  selectedMode,
  userCategory,
}) => {
  const [question, setQuestion] = useState('');
  const [answer, setAnswer] = useState<TravelAIAnswerData | null>(null);
  const [source, setSource] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);

  const handleAsk = async (queryText?: string) => {
    const q = (queryText || question).trim();
    if (!q) return;

    setIsLoading(true);
    try {
      const res = await travelService.askTravelAdvisor({
        question: q,
        outdoorAqi,
        originName,
        destinationName,
        currentMode: selectedMode,
        userCategory,
      });

      if (res.success) {
        setAnswer(res.answer);
        setSource(res.source);
        if (queryText) setQuestion(queryText);
      }
    } catch (err) {
      console.error('Failed to ask travel advisor:', err);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="bg-white dark:bg-zinc-950 border border-zinc-200 dark:border-zinc-800 rounded-2xl p-5 md:p-6 shadow-sm space-y-4">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <div className="p-2 bg-emerald-500/10 text-emerald-600 dark:text-emerald-400 rounded-xl">
            <Sparkles className="w-5 h-5" />
          </div>
          <div>
            <h3 className="text-base font-bold text-zinc-900 dark:text-zinc-100">
              GenAI Smart Travel Co-Pilot
            </h3>
            <p className="text-xs text-zinc-500 dark:text-zinc-400">
              Personalized advice on routes, departure windows, and cabin smog filtration
            </p>
          </div>
        </div>

        {source && (
          <span className="text-[10px] font-mono px-2 py-0.5 rounded-full bg-zinc-100 dark:bg-zinc-800 text-zinc-500">
            {source}
          </span>
        )}
      </div>

      {/* Suggested Questions */}
      <div className="flex flex-wrap gap-1.5">
        {SUGGESTED_QUESTIONS.map((q, i) => (
          <button
            key={i}
            onClick={() => handleAsk(q)}
            disabled={isLoading}
            className="text-xs px-2.5 py-1.5 bg-zinc-50 dark:bg-zinc-900 hover:bg-emerald-50 dark:hover:bg-emerald-950/40 text-zinc-600 dark:text-zinc-400 hover:text-emerald-600 dark:hover:text-emerald-400 rounded-lg border border-zinc-200 dark:border-zinc-800 transition-colors text-left"
          >
            {q}
          </button>
        ))}
      </div>

      {/* Input Box */}
      <div className="flex gap-2">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={(e) => e.key === 'Enter' && handleAsk()}
          placeholder="Ask anything about smog-safe routes, masks, or departure timing..."
          className="flex-1 px-4 py-2.5 bg-zinc-50 dark:bg-zinc-900 border border-zinc-200 dark:border-zinc-800 rounded-xl text-xs text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-emerald-500"
        />
        <Button
          onClick={() => handleAsk()}
          isLoading={isLoading}
          className="px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl flex items-center gap-1.5 text-xs font-semibold"
        >
          <Send className="w-3.5 h-3.5" />
          <span>Ask</span>
        </Button>
      </div>

      {/* AI Structured Answer Box */}
      {answer && (
        <div className="p-4 rounded-xl bg-zinc-50 dark:bg-zinc-900/60 border border-zinc-200 dark:border-zinc-800 space-y-3 text-xs animate-fadeIn">
          {/* Recommended Mode */}
          <div className="flex items-center gap-2 p-2.5 bg-emerald-50/70 dark:bg-emerald-950/30 border border-emerald-200 dark:border-emerald-800/60 rounded-lg">
            <Bot className="w-4 h-4 text-emerald-600 dark:text-emerald-400 flex-shrink-0" />
            <div className="text-xs">
              <span className="font-bold text-zinc-900 dark:text-zinc-100">Recommended Mode: </span>
              <span className="text-emerald-700 dark:text-emerald-300 font-semibold">{answer.recommendedMode}</span>
            </div>
          </div>

          {/* Core Route & Exposure Advice */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <ShieldAlert className="w-3.5 h-3.5 text-emerald-500" />
                Route & Street Exposure
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {answer.routeAdvice}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Car className="w-3.5 h-3.5 text-emerald-500" />
                Cabin & Mask Mitigation
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {answer.exposureMitigation}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Clock className="w-3.5 h-3.5 text-emerald-500" />
                Diurnal Timing Advice
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {answer.timingAdvice}
              </p>
            </div>

            <div className="p-3 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 space-y-1">
              <span className="font-bold text-zinc-800 dark:text-zinc-200 flex items-center gap-1.5">
                <Leaf className="w-3.5 h-3.5 text-emerald-500" />
                Carbon & Communal Impact
              </span>
              <p className="text-[11px] text-zinc-600 dark:text-zinc-400 leading-relaxed">
                {answer.emissionImpact}
              </p>
            </div>
          </div>

          {/* Group Specific Advice */}
          {answer.familyOrStudentSpecificAdvice && (
            <div className="p-2.5 bg-white dark:bg-zinc-950 rounded-lg border border-zinc-200/80 dark:border-zinc-800 text-[11px] text-zinc-600 dark:text-zinc-400">
              <span className="font-semibold text-zinc-800 dark:text-zinc-200">Personalized Note: </span>
              {answer.familyOrStudentSpecificAdvice}
            </div>
          )}

          {/* Health Disclaimer */}
          <div className="flex items-center gap-1.5 text-[10px] text-zinc-400 pt-1">
            <Info className="w-3 h-3 flex-shrink-0" />
            <span>{answer.healthDisclaimer}</span>
          </div>
        </div>
      )}
    </div>
  );
};
