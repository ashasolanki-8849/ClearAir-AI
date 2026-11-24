import { useState, useEffect, useRef } from 'react';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ConversationSidebar } from '../components/assistant/ConversationSidebar';
import { StructuredResponseCard } from '../components/assistant/StructuredResponseCard';
import { assistantService } from '../services/assistantService';
import { AssistantMessage, ConversationSummary, SupportedLanguage } from '../types';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import {
  Sparkles,
  Send,
  Loader2,
  MapPin,
  Globe,
  PanelLeft,
  RefreshCw,
  HelpCircle,
  Shield,
  ArrowRight,
  Radio,
} from 'lucide-react';
import { getAQIConfig } from '../utils/aqiHelper';

const SUGGESTED_PROMPTS = [
  'Is it safe to go outside today?',
  'What precautions should my family take?',
  'How can I improve indoor air quality?',
  'What is the safest time to exercise?',
  'How can I reduce my exposure to PM2.5?',
  'What should I do during severe smog?',
  'How can I reduce my daily pollution contribution?',
  'What if I exercise outdoors today?',
  'What if I commute during peak traffic?',
];

export const AssistantPage = () => {
  const { location, aqiData, refreshAQI, isLoading: aqiLoading } = useAQI();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();

  const [language, setLanguage] = useState<SupportedLanguage>(() => {
    return (localStorage.getItem('clearair_assistant_lang') as SupportedLanguage) || 'en';
  });

  const [sessionId] = useState<string>(() => {
    let stored = localStorage.getItem('clearair_assistant_session');
    if (!stored) {
      stored = `sess_${Date.now()}_${Math.random().toString(36).substring(2, 8)}`;
      localStorage.setItem('clearair_assistant_session', stored);
    }
    return stored;
  });

  const [conversations, setConversations] = useState<ConversationSummary[]>([]);
  const [activeConversationId, setActiveConversationId] = useState<string | null>(null);
  const [messages, setMessages] = useState<AssistantMessage[]>([]);
  const [inputMessage, setInputMessage] = useState('');
  const [loadingReply, setLoadingReply] = useState(false);
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const messagesEndRef = useRef<HTMLDivElement>(null);

  // Scroll to bottom on new messages
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [messages, loadingReply]);

  // Load conversations list
  const loadConversations = async () => {
    try {
      const res = await assistantService.getConversations(isAuthenticated ? undefined : sessionId);
      if (res.success && res.conversations) {
        setConversations(res.conversations);
      }
    } catch (e) {
      // ignore
    }
  };

  useEffect(() => {
    loadConversations();
  }, [isAuthenticated]);

  // Load a specific conversation
  const handleSelectConversation = async (id: string) => {
    setActiveConversationId(id);
    try {
      const res = await assistantService.getConversationById(id);
      if (res.success && res.conversation) {
        setMessages(res.conversation.messages || []);
        if (res.conversation.language) {
          setLanguage(res.conversation.language);
        }
      }
    } catch (err: any) {
      showToast(err.message || 'Failed to load conversation history', 'error');
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    showToast('Started new smog consultation.', 'info');
  };

  const handleDeleteConversation = async (id: string, e: React.MouseEvent) => {
    e.stopPropagation();
    try {
      await assistantService.deleteConversation(id);
      setConversations((prev) => prev.filter((c) => c._id !== id));
      if (activeConversationId === id) {
        handleNewConversation();
      }
      showToast('Conversation removed.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not delete conversation', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!isAuthenticated) {
      setConversations([]);
      handleNewConversation();
      return;
    }
    try {
      await assistantService.clearAllConversations();
      setConversations([]);
      handleNewConversation();
      showToast('Chat history cleared.', 'info');
    } catch (err: any) {
      showToast(err.message || 'Could not clear history', 'error');
    }
  };

  const handleLanguageChange = (newLang: SupportedLanguage) => {
    setLanguage(newLang);
    localStorage.setItem('clearair_assistant_lang', newLang);
    showToast(`Assistant language set to ${newLang === 'hi' ? 'हिन्दी (Hindi)' : newLang === 'gu' ? 'ગુજરાતી (Gujarati)' : 'English'}.`, 'info');
  };

  const handleSendMessage = async (customText?: string) => {
    const textToSend = customText || inputMessage;
    if (!textToSend.trim() || loadingReply) return;

    const userMessage: AssistantMessage = {
      id: `usr_${Date.now()}`,
      role: 'user',
      content: textToSend.trim(),
      timestamp: new Date().toISOString(),
    };

    setMessages((prev) => [...prev, userMessage]);
    setInputMessage('');
    setLoadingReply(true);

    try {
      const res = await assistantService.sendChatMessage({
        message: textToSend.trim(),
        conversationId: activeConversationId || undefined,
        language,
        location: {
          lat: location.lat,
          lon: location.lon,
          name: location.name,
          city: location.city,
        },
        sessionId: isAuthenticated ? undefined : sessionId,
      });

      if (res.success && res.response) {
        if (!activeConversationId && res.conversationId) {
          setActiveConversationId(res.conversationId);
          loadConversations();
        }

        const assistantMsg: AssistantMessage = {
          id: `ast_${Date.now()}`,
          role: 'assistant',
          content: res.response.summary,
          structuredData: res.response,
          timestamp: new Date().toISOString(),
        };

        setMessages((prev) => [...prev, assistantMsg]);
      }
    } catch (error: any) {
      showToast(error.message || 'Failed to generate recommendation', 'error');
    } finally {
      setLoadingReply(false);
    }
  };

  const aqiConfig = aqiData ? getAQIConfig(aqiData.aqiCategory) : null;

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8.5rem)] rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden relative shadow-sm">
        {/* Left Drawer / Sidebar */}
        <ConversationSidebar
          conversations={conversations}
          activeId={activeConversationId}
          onSelect={handleSelectConversation}
          onNew={handleNewConversation}
          onDelete={handleDeleteConversation}
          onClearAll={handleClearAll}
          isOpen={sidebarOpen}
          onClose={() => setSidebarOpen(false)}
        />

        {/* Main Chat View */}
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-zinc-50/30 dark:bg-black">
          {/* Top Assistant Header & Telemetry Bar */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 py-3 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                title="Toggle Conversation History"
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2">
                <div className="h-7 w-7 rounded-lg bg-emerald-500/10 text-emerald-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm font-bold text-zinc-900 dark:text-zinc-100 leading-none">
                    Smart Smog Assistant
                  </h2>
                  <span className="text-[10px] text-zinc-400 font-mono">
                    Module 2 • Ground-Truth Environmental Copilot
                  </span>
                </div>
              </div>
            </div>

            {/* Context & Language Controls */}
            <div className="flex items-center gap-2 sm:gap-3 text-xs">
              {/* Location & AQI Chip */}
              <div className="hidden sm:flex items-center gap-2 px-2.5 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black font-mono text-[11px]">
                <MapPin className="w-3 h-3 text-emerald-500" />
                <span className="text-zinc-700 dark:text-zinc-300">{location.name}</span>
                {aqiData && (
                  <span
                    className="font-bold px-1.5 py-0.2 rounded"
                    style={{ color: aqiConfig?.color, backgroundColor: aqiConfig?.bgColor }}
                  >
                    AQI {aqiData.aqi}
                  </span>
                )}
              </div>

              {/* Language Selector */}
              <div className="flex items-center gap-1 p-0.5 rounded-lg border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-black text-xs">
                <Globe className="w-3.5 h-3.5 text-zinc-400 ml-1.5" />
                <button
                  onClick={() => handleLanguageChange('en')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    language === 'en'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  EN
                </button>
                <button
                  onClick={() => handleLanguageChange('hi')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    language === 'hi'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  हिन्दी
                </button>
                <button
                  onClick={() => handleLanguageChange('gu')}
                  className={`px-2 py-0.5 rounded text-[11px] font-medium transition-colors ${
                    language === 'gu'
                      ? 'bg-zinc-900 text-white dark:bg-white dark:text-black font-bold'
                      : 'text-zinc-500 hover:text-zinc-900 dark:hover:text-zinc-200'
                  }`}
                >
                  ગુજરાતી
                </button>
              </div>
            </div>
          </div>

          {/* Messages Scroll Area */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-5">
            {messages.length === 0 ? (
              /* Welcome Hero & Suggested Questions */
              <div className="max-w-2xl mx-auto py-8 sm:py-12 space-y-6 text-center">
                <div className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-zinc-900 text-white dark:bg-white dark:text-black shadow-md">
                  <Sparkles className="h-7 w-7 text-emerald-400 dark:text-emerald-600" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-xl sm:text-2xl font-bold tracking-tight text-zinc-900 dark:text-zinc-100">
                    GenAI Smart Smog Assistant
                  </h3>
                  <p className="text-xs sm:text-sm text-zinc-500 dark:text-zinc-400 max-w-lg mx-auto leading-relaxed">
                    Personalized environmental intelligence grounded in live CPCB & Copernicus satellite telemetry. Ask questions about outdoor safety, family precautions, indoor air quality, or low-emission routines.
                  </p>
                </div>

                {/* Ground-truth Context Chip */}
                {aqiData && (
                  <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] text-xs shadow-xs">
                    <Radio className="w-3.5 h-3.5 text-emerald-500 animate-pulse" />
                    <span>
                      Grounded in <strong className="text-zinc-900 dark:text-zinc-100">{location.name}</strong> (AQI {aqiData.aqi} • {aqiData.aqiCategory})
                    </span>
                    {user && (
                      <span className="text-zinc-400 font-mono">
                        • Profile: {user.userCategory}
                      </span>
                    )}
                  </div>
                )}

                {/* Suggested Questions Grid */}
                <div className="pt-4 text-left">
                  <p className="text-[11px] font-mono font-bold uppercase tracking-wider text-zinc-400 mb-3 text-center">
                    Suggested Consultations
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-2.5">
                    {SUGGESTED_PROMPTS.map((prompt, idx) => (
                      <button
                        key={idx}
                        onClick={() => handleSendMessage(prompt)}
                        className="flex items-center justify-between p-3 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] hover:border-zinc-300 dark:hover:border-zinc-700 text-xs text-zinc-700 dark:text-zinc-300 transition-all text-left group"
                      >
                        <span>{prompt}</span>
                        <ArrowRight className="w-3.5 h-3.5 text-zinc-400 group-hover:text-emerald-500 shrink-0 ml-2 transition-transform group-hover:translate-x-0.5" />
                      </button>
                    ))}
                  </div>
                </div>
              </div>
            ) : (
              /* Conversation Messages */
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'user' ? (
                    <div className="max-w-[85%] sm:max-w-xl rounded-2xl rounded-tr-xs bg-zinc-900 text-white dark:bg-white dark:text-black p-4 text-xs sm:text-sm font-medium shadow-sm">
                      {msg.content}
                    </div>
                  ) : (
                    <div className="max-w-full sm:max-w-3xl rounded-2xl rounded-tl-xs border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] p-4 sm:p-5 shadow-sm">
                      {msg.structuredData ? (
                        <StructuredResponseCard
                          data={msg.structuredData}
                          onSelectFollowUp={(q) => handleSendMessage(q)}
                        />
                      ) : (
                        <p className="text-xs sm:text-sm text-zinc-800 dark:text-zinc-200 leading-relaxed whitespace-pre-line">
                          {msg.content}
                        </p>
                      )}
                    </div>
                  )}
                </div>
              ))
            )}

            {/* Loading Indicator */}
            {loadingReply && (
              <div className="flex items-center gap-3 p-4 rounded-xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707] max-w-sm">
                <Loader2 className="w-4 h-4 animate-spin text-emerald-500 shrink-0" />
                <span className="text-xs text-zinc-500 font-mono">
                  Synthesizing real-time telemetry for {location.name}...
                </span>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar */}
          <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-[#070707]">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2 max-w-4xl mx-auto"
            >
              <input
                type="text"
                placeholder={
                  language === 'hi'
                    ? `${location.name} की वायु गुणवत्ता या सुरक्षा के बारे में पूछें...`
                    : language === 'gu'
                    ? `${location.name} ની હવા ગુણવત્તા અથવા સુરક્ષા વિશે પૂછો...`
                    : `Ask about smog, indoor safety, workouts, or what-if scenarios in ${location.name}...`
                }
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                disabled={loadingReply}
                className="flex-1 rounded-xl border border-zinc-300 dark:border-zinc-800 bg-zinc-50 dark:bg-black py-2.5 px-4 text-xs sm:text-sm text-zinc-900 dark:text-zinc-100 placeholder:text-zinc-400 focus:outline-none focus:ring-2 focus:ring-zinc-900 dark:focus:ring-zinc-300"
              />

              <button
                type="submit"
                disabled={!inputMessage.trim() || loadingReply}
                className="flex h-10 w-10 items-center justify-center rounded-xl bg-zinc-900 text-white hover:bg-zinc-800 dark:bg-white dark:text-black dark:hover:bg-zinc-200 disabled:opacity-40 disabled:cursor-not-allowed transition-colors shrink-0 shadow-sm"
                title="Send message"
              >
                {loadingReply ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Send className="w-4 h-4" />
                )}
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
