import React, { useState } from 'react';
import { 
  X, 
  Send, 
  Sparkles, 
  Bot, 
  User, 
  Flame, 
  CheckCircle2, 
  Info, 
  AlertCircle,
  HelpCircle,
  TrendingDown,
  BookOpen
} from 'lucide-react';
import { impactService } from '../../services/impactService';
import { ImpactAdvisorResponse } from '../../types';

interface AskImpactAdvisorModalProps {
  isOpen: boolean;
  onClose: () => void;
}

interface Message {
  role: 'user' | 'assistant';
  content: string;
  data?: ImpactAdvisorResponse;
}

export const AskImpactAdvisorModal: React.FC<AskImpactAdvisorModalProps> = ({ isOpen, onClose }) => {
  const [input, setInput] = useState<string>('');
  const [messages, setMessages] = useState<Message[]>([
    {
      role: 'assistant',
      content: 'Hello! I am your AI Environmental Impact Advisor. Ask me anything about calculating your carbon footprint, comparing transport modes in Delhi NCR, reducing grid electricity emissions, or understanding the difference between CO₂e and ambient AQI.',
      data: undefined
    }
  ]);
  const [loading, setLoading] = useState<boolean>(false);

  if (!isOpen) return null;

  const quickPrompts = [
    'How does Delhi Metro compare to a petrol car per kilometer?',
    'What is the carbon impact of switching to induction cooking from LPG?',
    'Why does my carbon footprint not immediately change citywide AQI?',
    'How do I calculate CEA grid electricity emissions accurately?'
  ];

  const handleSend = async (queryText?: string) => {
    const text = queryText || input;
    if (!text.trim() || loading) return;

    const userMsg: Message = { role: 'user', content: text };
    setMessages(prev => [...prev, userMsg]);
    setInput('');
    setLoading(true);

    try {
      const res = await impactService.askAdvisor(text);
      if (res.success && res.data) {
        const assistantMsg: Message = {
          role: 'assistant',
          content: res.data.directAnswer || res.data.summary || 'Advice generated successfully.',
          data: res.data
        };
        setMessages(prev => [...prev, assistantMsg]);
      } else {
        setMessages(prev => [
          ...prev,
          {
            role: 'assistant',
            content: res.error || 'I encountered an error querying the impact knowledge engine. Please try again.'
          }
        ]);
      }
    } catch (err: any) {
      setMessages(prev => [
        ...prev,
        {
          role: 'assistant',
          content: err.message || 'Error communicating with impact advisor'
        }
      ]);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/85 backdrop-blur-md animate-fade-in">
      <div className="bg-zinc-950 border border-zinc-800 rounded-2xl w-full max-w-3xl h-[85vh] flex flex-col shadow-2xl overflow-hidden">
        {/* Header */}
        <div className="p-5 border-b border-zinc-800 flex items-center justify-between bg-zinc-900/60">
          <div className="flex items-center gap-3">
            <div className="p-2.5 bg-emerald-500/10 text-emerald-400 rounded-xl border border-emerald-500/20">
              <Sparkles className="w-5 h-5" />
            </div>
            <div>
              <h3 className="text-lg font-bold text-white flex items-center gap-2">
                Ask My Impact Advisor
                <span className="text-[10px] uppercase font-bold tracking-wider px-2 py-0.5 rounded-full bg-emerald-500/20 text-emerald-400 border border-emerald-500/30">
                  AI Co-Pilot
                </span>
              </h3>
              <p className="text-xs text-zinc-400">
                Grounded in CEA v19, IPCC AR6, CPCB & DMRC verified emission factors.
              </p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="p-2 text-zinc-400 hover:text-white rounded-lg hover:bg-zinc-800 transition-colors"
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Chat Messages */}
        <div className="flex-1 overflow-y-auto p-5 space-y-4">
          {messages.map((m, idx) => (
            <div
              key={idx}
              className={`flex gap-3 ${m.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              {m.role === 'assistant' && (
                <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0 mt-1">
                  <Bot className="w-4 h-4" />
                </div>
              )}

              <div
                className={`max-w-[85%] rounded-2xl p-4 text-sm leading-relaxed ${
                  m.role === 'user'
                    ? 'bg-emerald-600 text-white rounded-tr-none'
                    : 'bg-zinc-900 text-zinc-200 border border-zinc-800 rounded-tl-none space-y-3'
                }`}
              >
                <div>{m.content}</div>

                {/* Structured Assistant Data (if available) */}
                {m.data && (
                  <div className="space-y-3 pt-3 border-t border-zinc-800 text-xs">
                    {m.data.estimatedSavingsKgCo2e !== undefined && m.data.estimatedSavingsKgCo2e > 0 && (
                      <div className="p-2.5 rounded-lg bg-emerald-950/30 border border-emerald-800/40 text-emerald-400 flex items-center gap-2">
                        <Flame className="w-4 h-4 flex-shrink-0" />
                        <span>
                          Estimated Potential Savings: <strong className="font-mono">{m.data.estimatedSavingsKgCo2e} kg CO₂e</strong>
                        </span>
                      </div>
                    )}

                    {m.data.actionPlan && m.data.actionPlan.length > 0 && (
                      <div>
                        <div className="font-bold text-zinc-300 uppercase tracking-wider text-[11px] mb-1.5 flex items-center gap-1.5">
                          <CheckCircle2 className="w-3.5 h-3.5 text-emerald-400" />
                          Recommended Action Plan
                        </div>
                        <ul className="space-y-1 pl-4 list-disc text-zinc-300">
                          {m.data.actionPlan.map((action: string, aIdx: number) => (
                            <li key={aIdx}>{action}</li>
                          ))}
                        </ul>
                      </div>
                    )}

                    {m.data.scientificCaveats && (
                      <div className="p-2 rounded bg-amber-950/20 border border-amber-800/30 text-amber-300/90 text-[11px]">
                        <strong>Caveat:</strong> {m.data.scientificCaveats}
                      </div>
                    )}

                    {m.data.dataSources && m.data.dataSources.length > 0 && (
                      <div className="text-[10px] text-zinc-400 flex items-center gap-1 flex-wrap">
                        <BookOpen className="w-3 h-3 text-zinc-400" />
                        <span>Sources: {m.data.dataSources.join(', ')}</span>
                      </div>
                    )}
                  </div>
                )}
              </div>

              {m.role === 'user' && (
                <div className="w-8 h-8 rounded-xl bg-zinc-800 text-zinc-300 border border-zinc-700 flex items-center justify-center flex-shrink-0 mt-1">
                  <User className="w-4 h-4" />
                </div>
              )}
            </div>
          ))}

          {loading && (
            <div className="flex gap-3 justify-start items-center text-zinc-400 text-xs">
              <div className="w-8 h-8 rounded-xl bg-emerald-500/10 text-emerald-400 border border-emerald-500/20 flex items-center justify-center flex-shrink-0">
                <Bot className="w-4 h-4" />
              </div>
              <div className="bg-zinc-900 border border-zinc-800 p-3 rounded-2xl flex items-center gap-2">
                <div className="w-2 h-2 rounded-full bg-emerald-400 animate-pulse" />
                <span>Consulting emission factors & scientific ledger...</span>
              </div>
            </div>
          )}
        </div>

        {/* Quick Prompts */}
        <div className="p-3 bg-zinc-950 border-t border-zinc-900 overflow-x-auto flex gap-2">
          {quickPrompts.map((p, idx) => (
            <button
              key={idx}
              onClick={() => handleSend(p)}
              disabled={loading}
              className="text-xs bg-zinc-900 hover:bg-zinc-800 text-zinc-300 border border-zinc-800 rounded-full px-3 py-1.5 whitespace-nowrap transition-colors flex-shrink-0"
            >
              {p}
            </button>
          ))}
        </div>

        {/* Input Bar */}
        <div className="p-4 border-t border-zinc-800 bg-zinc-900/60">
          <form
            onSubmit={(e) => {
              e.preventDefault();
              handleSend();
            }}
            className="flex items-center gap-2"
          >
            <input
              type="text"
              placeholder="Ask about emissions, grid factors, metro vs car, or personal reduction..."
              value={input}
              onChange={(e) => setInput(e.target.value)}
              disabled={loading}
              className="flex-1 bg-zinc-950 border border-zinc-700 rounded-xl px-4 py-3 text-sm text-white placeholder-zinc-500 focus:outline-none focus:border-emerald-500"
            />
            <button
              type="submit"
              disabled={loading || !input.trim()}
              className="p-3 rounded-xl bg-emerald-600 hover:bg-emerald-500 text-white disabled:opacity-50 transition-all flex-shrink-0 shadow-lg shadow-emerald-950/40"
            >
              <Send className="w-4 h-4" />
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};
