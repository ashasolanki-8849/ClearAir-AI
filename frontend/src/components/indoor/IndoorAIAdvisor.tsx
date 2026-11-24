import React, { useState } from 'react';
import { Card } from '../common/Card';
import { Button } from '../common/Button';
import { Badge } from '../common/Badge';
import { IndoorAIAnswerData, IndoorRoomData } from '../../types';
import { indoorService } from '../../services/indoorService';
import { useToast } from '../../context/ToastContext';
import {
  Sparkles,
  Send,
  Loader2,
  HelpCircle,
  ShieldAlert,
  CheckCircle2,
  AlertCircle,
  Lightbulb,
} from 'lucide-react';

interface IndoorAIAdvisorProps {
  location?: { lat: number; lon: number; name: string };
  selectedRoom: IndoorRoomData | null;
  language?: string;
}

const SUGGESTED_INDOOR_PROMPTS = [
  'How can I improve bedroom air quality?',
  'Is it safe to open windows today?',
  'How do I reduce cooking smoke?',
  'Which air purifier is suitable for my room?',
  'How can I reduce indoor dust?',
  'Are indoor plants enough to clean the air?',
  'Why is indoor air sometimes worse than outdoor air?',
  'How can I improve classroom ventilation?',
];

export const IndoorAIAdvisor: React.FC<IndoorAIAdvisorProps> = ({
  location,
  selectedRoom,
  language = 'en',
}) => {
  const { showToast } = useToast();
  const [question, setQuestion] = useState('');
  const [loading, setLoading] = useState(false);
  const [answer, setAnswer] = useState<IndoorAIAnswerData | null>(null);

  const handleAsk = async (promptText: string) => {
    if (!promptText.trim()) return;
    setLoading(true);
    setQuestion(promptText);

    try {
      const res = await indoorService.askIndoorAdvisor({
        question: promptText,
        location,
        roomId: selectedRoom?._id,
        language,
      });

      if (res.success && res.answer) {
        setAnswer(res.answer);
      }
    } catch (e: any) {
      showToast(e.message || 'Could not fetch indoor advisor reply', 'error');
    } finally {
      setLoading(false);
    }
  };

  const getCostBadge = (category: string) => {
    switch (category) {
      case 'zero_cost':
        return <Badge variant="good">Zero Cost (Habitual)</Badge>;
      case 'low_cost':
        return <Badge variant="satisfactory">Low Cost</Badge>;
      case 'medium_cost':
        return <Badge variant="moderate">Medium Cost</Badge>;
      case 'higher_investment':
        return <Badge variant="poor">Higher Investment</Badge>;
      default:
        return null;
    }
  };

  return (
    <Card className="p-5 border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] space-y-5">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-2 pb-4 border-b border-zinc-100 dark:border-zinc-900">
        <div>
          <div className="flex items-center gap-1.5 text-xs font-mono font-bold uppercase text-emerald-600 dark:text-emerald-400">
            <Sparkles className="w-4 h-4" />
            GenAI Indoor Air Quality Advisor
          </div>
          <h3 className="text-lg font-bold text-zinc-900 dark:text-white mt-1">
            Ask the Indoor Air Intelligence Co-Pilot
          </h3>
          <p className="text-xs text-zinc-500 dark:text-zinc-400">
            Grounded in physical atmospheric science, WHO indoor guidelines, and your room parameters.
          </p>
        </div>
        <Badge variant="outline">
          Target: {selectedRoom?.roomName || 'Living Space'}
        </Badge>
      </div>

      {/* Suggested Prompts Carousel */}
      <div className="space-y-1.5">
        <span className="text-[10px] font-bold uppercase tracking-wider text-zinc-400 flex items-center gap-1">
          <HelpCircle className="w-3 h-3 text-zinc-400" />
          Suggested Inquiries:
        </span>
        <div className="flex flex-wrap gap-1.5">
          {SUGGESTED_INDOOR_PROMPTS.map((prompt, i) => (
            <button
              key={i}
              onClick={() => handleAsk(prompt)}
              disabled={loading}
              className="text-left text-xs px-2.5 py-1.5 rounded-lg border border-zinc-200 bg-zinc-50 hover:bg-zinc-100 dark:border-zinc-800 dark:bg-zinc-900/60 dark:hover:bg-zinc-800 text-zinc-700 dark:text-zinc-300 transition-colors"
            >
              {prompt}
            </button>
          ))}
        </div>
      </div>

      {/* Input Bar */}
      <form
        onSubmit={(e) => {
          e.preventDefault();
          handleAsk(question);
        }}
        className="flex gap-2"
      >
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          placeholder="Ask anything about indoor air quality, purifiers, mold, or ventilation..."
          disabled={loading}
          className="flex-1 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 px-4 py-2.5 text-xs text-zinc-900 dark:text-zinc-100 focus:outline-none focus:ring-1 focus:ring-emerald-500"
        />
        <Button variant="primary" type="submit" disabled={loading || !question.trim()} className="gap-1.5 text-xs">
          {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Send className="w-4 h-4" />}
          <span className="hidden sm:inline">Ask Advisor</span>
        </Button>
      </form>

      {/* Structured Response Display */}
      {answer && (
        <div className="p-5 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-zinc-50/50 dark:bg-zinc-900/30 space-y-4 animate-in fade-in duration-200">
          <div className="flex flex-wrap items-center justify-between gap-2 pb-3 border-b border-zinc-200/80 dark:border-zinc-800">
            <div className="flex items-center gap-2">
              <span className="text-xs font-bold text-zinc-900 dark:text-white uppercase tracking-wider">
                Analysis & Recommendation
              </span>
              {getCostBadge(answer.costCategory)}
            </div>
            <span className="text-[10px] text-zinc-400">
              ClearAir AI Science Engine
            </span>
          </div>

          {/* Problem & Cause */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-black">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Identified Issue
              </span>
              <p className="font-semibold text-zinc-800 dark:text-zinc-200">
                {answer.identifiedProblem}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-black">
              <span className="text-[10px] font-bold uppercase text-zinc-400 block mb-1">
                Root Mechanism / Cause
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                {answer.possibleCause}
              </p>
            </div>
          </div>

          {/* Recommended Action & Scientific Reason */}
          <div className="p-4 rounded-xl border border-emerald-500/20 bg-emerald-500/5 dark:bg-emerald-950/10 space-y-2">
            <span className="text-[10px] font-bold uppercase tracking-wider text-emerald-600 dark:text-emerald-400 flex items-center gap-1">
              <CheckCircle2 className="w-3.5 h-3.5" />
              Recommended Action
            </span>
            <p className="text-xs sm:text-sm font-bold text-zinc-900 dark:text-white leading-relaxed">
              {answer.recommendedAction}
            </p>
            <div className="pt-2 border-t border-emerald-500/15 text-xs text-zinc-600 dark:text-zinc-400">
              <strong>Scientific Justification:</strong> {answer.reason}
            </div>
          </div>

          {/* Expected Benefit & Limitations */}
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 text-xs">
            <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-black text-[11px] space-y-1">
              <span className="font-bold text-emerald-600 dark:text-emerald-400 block">
                Expected Health Benefit:
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                {answer.expectedBenefit}
              </p>
            </div>

            <div className="p-3 rounded-lg border border-zinc-200/60 dark:border-zinc-800/80 bg-white dark:bg-black text-[11px] space-y-1">
              <span className="font-bold text-amber-600 dark:text-amber-400 block">
                Technical Limitations:
              </span>
              <p className="text-zinc-600 dark:text-zinc-400">
                {answer.limitations}
              </p>
            </div>
          </div>

          {/* Data Source Footnote */}
          <p className="text-[10px] text-zinc-400 pt-1">
            * {answer.dataSourceNote}
          </p>
        </div>
      )}
    </Card>
  );
};
