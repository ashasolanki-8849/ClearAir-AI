import { useState, useEffect, useRef } from 'react';
import { useLocation } from 'react-router-dom';
import { DashboardLayout } from '../components/layout/DashboardLayout';
import { ConversationSidebar } from '../components/assistant/ConversationSidebar';
import { StructuredResponseCard } from '../components/assistant/StructuredResponseCard';
import { assistantService } from '../services/assistantService';
import { AssistantMessage, ConversationSummary, SupportedLanguage } from '../types';
import { useAQI } from '../context/AQIContext';
import { useAuth } from '../context/AuthContext';
import { useToast } from '../context/ToastContext';
import { calculatePollutionMetrics } from '../utils/pollutionScale';
import {
  Sparkles,
  Send,
  Loader2,
  MapPin,
  PanelLeft,
  RefreshCw,
  HelpCircle,
  Mic,
  MicOff,
  UserCheck,
} from 'lucide-react';

const ROLE_SUGGESTED_PROMPTS: Record<string, string[]> = {
  general: [
    'Is it safe to go outside today?',
    'What should I do when pollution levels are high or severe?',
    'How can I protect my family from winter smog?',
    'Should I exercise or jog outdoors today?',
    'How can I reduce pollution inside my home without purifiers?',
    'What is the safest time to travel or run errands today?',
  ],
  student: [
    'How can I commute safely to school or college during morning smog?',
    'Should our school or campus avoid outdoor sports or morning assembly today?',
    'How does severe winter smog impact study focus, energy, and fatigue?',
    'Which mask should I wear when walking or riding a two-wheeler to campus?',
    'What indoor air hacks keep a classroom or hostel room clean?',
  ],
  family: [
    'How can I protect my children from winter smog today?',
    'Is it safe for my kids or toddlers to play outside in the evening?',
    'How do I seal bedroom windows without trapping stale cooking fumes?',
    'What natural indoor hacks purify home air for elderly parents?',
    'What warm home drinks relieve cough and throat dryness from smog?',
  ],
  working_professional: [
    'What is the lowest-smog commuting window for office travel today?',
    'Should I turn on internal air circulation in my car during traffic?',
    'How can I reduce throat fatigue during long daily highway drives?',
    'What simple indoor plants improve office desk air quality?',
    'When is the safest time for an evening workout or gym session today?',
  ],
  elderly: [
    'Is it safe for senior citizens to go for an early morning walk today?',
    'What time of day is best for seniors to step outdoors for sunlight?',
    'What gentle breathing exercises can be done safely inside our home?',
    'How can we relieve throat dryness and coughing caused by winter smog?',
    'Should seniors keep all bedroom doors and windows closed at night?',
  ],
};

export const AssistantPage = () => {
  const { location, aqiData } = useAQI();
  const { user, isAuthenticated } = useAuth();
  const { showToast } = useToast();
  const routerLocation = useLocation();

  const metrics = calculatePollutionMetrics(aqiData?.aqi, aqiData?.weather);

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
  const [isListening, setIsListening] = useState(false);
  const [selectedPromptRole, setSelectedPromptRole] = useState<string>(() => {
    return user?.userCategory || 'general';
  });

  useEffect(() => {
    if (user?.userCategory) {
      setSelectedPromptRole(user.userCategory);
    }
  }, [user?.userCategory]);

  const messagesEndRef = useRef<HTMLDivElement>(null);
  const initialSentRef = useRef(false);
  const recognitionRef = useRef<any>(null);

  // Initialize Speech Recognition for Voice-based Chat
  useEffect(() => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (SpeechRecognition) {
      const recognition = new SpeechRecognition();
      recognition.continuous = false;
      recognition.interimResults = true;
      recognition.lang = language === 'hi' ? 'hi-IN' : language === 'gu' ? 'gu-IN' : 'en-US';

      recognition.onresult = (event: any) => {
        const transcript = Array.from(event.results)
          .map((result: any) => result[0])
          .map((result: any) => result.transcript)
          .join('');
        setInputMessage(transcript);
      };

      recognition.onerror = (event: any) => {
        console.warn('Speech recognition error:', event.error);
        setIsListening(false);
        if (event.error === 'not-allowed') {
          showToast('Microphone access was denied. Please allow microphone permissions in your browser.', 'warning');
        } else {
          showToast('Voice input stopped.', 'info');
        }
      };

      recognition.onend = () => {
        setIsListening(false);
      };

      recognitionRef.current = recognition;
    }
  }, [language, showToast]);

  const toggleVoiceInput = () => {
    const SpeechRecognition = (window as any).SpeechRecognition || (window as any).webkitSpeechRecognition;
    if (!SpeechRecognition) {
      showToast('Voice input is not supported in this browser. Please type your question.', 'warning');
      return;
    }

    if (isListening) {
      recognitionRef.current?.stop();
      setIsListening(false);
    } else {
      try {
        recognitionRef.current?.start();
        setIsListening(true);
        showToast('Listening... Speak your question now.', 'info');
      } catch (e) {
        setIsListening(false);
      }
    }
  };

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
  }, [isAuthenticated, sessionId]);

  // Handle incoming query from navigation state
  useEffect(() => {
    const stateQuery = (routerLocation.state as any)?.initialQuery;
    if (stateQuery && !initialSentRef.current) {
      initialSentRef.current = true;
      handleSendMessage(stateQuery);
    }
  }, [routerLocation.state]);

  const handleSelectConversation = async (convId: string) => {
    try {
      setActiveConversationId(convId);
      const res = await assistantService.getConversationById(convId);
      if (res.success && res.conversation) {
        const mappedMessages: AssistantMessage[] = res.conversation.messages.map((m: any, idx: number) => ({
          id: `msg_${idx}`,
          role: m.role,
          content: m.content,
          structuredData: m.structuredData,
          timestamp: m.timestamp,
        }));
        setMessages(mappedMessages);
        setSidebarOpen(false);
      }
    } catch (err: any) {
      showToast('Could not load conversation', 'error');
    }
  };

  const handleNewConversation = () => {
    setActiveConversationId(null);
    setMessages([]);
    setSidebarOpen(false);
  };

  const handleDeleteConversation = async (convId: string) => {
    try {
      await assistantService.deleteConversation(convId);
      setConversations((prev) => prev.filter((c) => c._id !== convId));
      if (activeConversationId === convId) {
        handleNewConversation();
      }
      showToast('Conversation deleted', 'info');
    } catch (err) {
      showToast('Failed to delete', 'error');
    }
  };

  const handleClearAll = async () => {
    if (!window.confirm('Delete all conversation history?')) return;
    try {
      await assistantService.clearAllConversations();
      setConversations([]);
      handleNewConversation();
      showToast('All conversations cleared', 'info');
    } catch (err) {
      showToast('Failed to clear', 'error');
    }
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

  return (
    <DashboardLayout>
      <div className="flex h-[calc(100vh-8.5rem)] rounded-3xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black overflow-hidden relative shadow-sm">
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
        <div className="flex-1 flex flex-col h-full overflow-hidden bg-white dark:bg-black">
          {/* Top Assistant Header */}
          <div className="flex flex-wrap items-center justify-between gap-3 px-4 sm:px-6 py-3.5 border-b border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <div className="flex items-center gap-3">
              <button
                onClick={() => setSidebarOpen((prev) => !prev)}
                className="lg:hidden p-1.5 rounded-lg border border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300"
                title="Toggle Conversation History"
              >
                <PanelLeft className="w-4 h-4" />
              </button>

              <div className="flex items-center gap-2.5">
                <div className="h-8 w-8 rounded-xl bg-sky-500/10 text-sky-500 flex items-center justify-center font-bold">
                  <Sparkles className="w-4 h-4" />
                </div>
                <div>
                  <h2 className="text-sm sm:text-base font-bold text-zinc-900 dark:text-white leading-none">
                    AI Assistant
                  </h2>
                  <span className="text-[11px] text-zinc-500 dark:text-zinc-400">
                    Air safety & smog protection guide
                  </span>
                </div>
              </div>
            </div>

            {/* Context location badge & User Type badge */}
            <div className="flex flex-wrap items-center gap-2 text-xs">
              {user?.userCategory && (
                <div className="hidden sm:flex items-center gap-1.5 px-3 py-1 rounded-full border border-sky-200 dark:border-sky-900/40 bg-sky-50 dark:bg-sky-950/20 text-sky-700 dark:text-sky-300 font-medium">
                  <UserCheck className="w-3.5 h-3.5" />
                  <span className="capitalize">{user.userCategory} Guidance</span>
                </div>
              )}

              <div className="flex items-center gap-1.5 px-3 py-1 rounded-full border border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900">
                <MapPin className="w-3.5 h-3.5 text-sky-500 shrink-0" />
                <span className="text-zinc-700 dark:text-zinc-300 font-medium truncate max-w-[130px]">{location.name}</span>
                {metrics.isDataAvailable && (
                  <span className={`font-bold ml-1 ${metrics.statusColor}`}>
                    ({metrics.pollutionPercent}%)
                  </span>
                )}
              </div>
            </div>
          </div>

          {/* Messages Feed */}
          <div className="flex-1 overflow-y-auto p-4 sm:p-6 space-y-4">
            {messages.length === 0 ? (
              <div className="h-full flex flex-col items-center justify-center text-center p-6 space-y-6 max-w-lg mx-auto">
                <div className="p-4 rounded-3xl bg-sky-50 dark:bg-sky-950/20 text-sky-500 border border-sky-100 dark:border-sky-900/30">
                  <Sparkles className="w-8 h-8" />
                </div>

                <div className="space-y-2">
                  <h3 className="text-lg font-bold text-zinc-900 dark:text-white">
                    How can I help you today?
                  </h3>
                  <p className="text-xs text-zinc-500 dark:text-zinc-400 leading-relaxed">
                    Ask any question about today's air quality, safe times to go outdoors, 
                    protecting your family from smog, or keeping indoor air clean.
                  </p>
                </div>

                {/* Role Filter Tabs for Suggested Prompts */}
                <div className="w-full space-y-2.5 text-left">
                  <div className="flex items-center justify-between px-1">
                    <span className="text-[11px] font-semibold uppercase tracking-wider text-zinc-400">
                      Suggested Questions by Category:
                    </span>
                  </div>

                  {/* Category Pill Buttons */}
                  <div className="flex flex-wrap gap-1.5 pb-1">
                    {[
                      { key: 'general', label: 'General' },
                      { key: 'student', label: 'Student' },
                      { key: 'family', label: 'Family' },
                      { key: 'working_professional', label: 'Professional' },
                      { key: 'elderly', label: 'Elderly' },
                    ].map((tab) => (
                      <button
                        key={tab.key}
                        onClick={() => setSelectedPromptRole(tab.key)}
                        className={`px-3 py-1 rounded-full text-xs font-semibold transition-colors ${
                          selectedPromptRole === tab.key
                            ? 'bg-sky-500 text-white shadow-xs'
                            : 'bg-zinc-100 dark:bg-zinc-900 text-zinc-600 dark:text-zinc-400 hover:text-zinc-900 dark:hover:text-white'
                        }`}
                      >
                        {tab.label}
                      </button>
                    ))}
                  </div>

                  <div className="grid grid-cols-1 gap-2">
                    {(ROLE_SUGGESTED_PROMPTS[selectedPromptRole] || ROLE_SUGGESTED_PROMPTS.general).map(
                      (prompt, idx) => (
                        <button
                          key={idx}
                          onClick={() => handleSendMessage(prompt)}
                          className="w-full p-3 rounded-2xl border border-zinc-200 dark:border-zinc-800 bg-white dark:bg-zinc-950 hover:border-sky-400 dark:hover:border-sky-600 text-xs font-medium text-zinc-800 dark:text-zinc-200 text-left transition-colors flex items-center justify-between group shadow-2xs"
                        >
                          <span>{prompt}</span>
                          <Send className="w-3.5 h-3.5 text-zinc-400 group-hover:text-sky-500 shrink-0" />
                        </button>
                      )
                    )}
                  </div>
                </div>
              </div>
            ) : (
              messages.map((msg) => (
                <div
                  key={msg.id}
                  className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  <div
                    className={`max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 text-xs sm:text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-sky-500 text-white rounded-br-none shadow-sm'
                        : 'bg-zinc-50 dark:bg-zinc-900/90 text-zinc-900 dark:text-zinc-100 border border-zinc-200 dark:border-zinc-800 rounded-bl-none shadow-2xs'
                    }`}
                  >
                    {msg.role === 'assistant' && msg.structuredData ? (
                      <StructuredResponseCard
                        data={msg.structuredData}
                        onSelectFollowUp={(q) => handleSendMessage(q)}
                      />
                    ) : (
                      <p className="whitespace-pre-wrap">{msg.content}</p>
                    )}
                  </div>
                </div>
              ))
            )}

            {loadingReply && (
              <div className="flex justify-start">
                <div className="max-w-[85%] sm:max-w-[75%] rounded-2xl p-4 bg-zinc-50 dark:bg-zinc-900 text-zinc-500 border border-zinc-200 dark:border-zinc-800 rounded-bl-none flex items-center gap-2 text-xs">
                  <Loader2 className="w-4 h-4 animate-spin text-sky-500" />
                  <span>Thinking & analyzing air safety...</span>
                </div>
              </div>
            )}

            <div ref={messagesEndRef} />
          </div>

          {/* Bottom Chat Input Bar with Voice Input */}
          <div className="p-3 sm:p-4 border-t border-zinc-200 dark:border-zinc-800 bg-white dark:bg-black">
            <form
              onSubmit={(e) => {
                e.preventDefault();
                handleSendMessage();
              }}
              className="flex items-center gap-2"
            >
              <input
                type="text"
                value={inputMessage}
                onChange={(e) => setInputMessage(e.target.value)}
                placeholder={isListening ? 'Listening to your voice... Speak now' : 'Ask about smog, outdoor safety, or protecting your home...'}
                disabled={loadingReply}
                className={`flex-1 px-4 py-3 rounded-2xl border text-xs sm:text-sm focus:outline-none focus:ring-2 focus:ring-sky-500 disabled:opacity-50 transition-all ${
                  isListening
                    ? 'border-sky-500 bg-sky-50/20 dark:bg-sky-950/20 ring-2 ring-sky-500/20 text-zinc-900 dark:text-white'
                    : 'border-zinc-200 dark:border-zinc-800 bg-zinc-50 dark:bg-zinc-900 text-zinc-900 dark:text-white'
                }`}
              />

              {/* Microphone Voice Button */}
              <button
                type="button"
                onClick={toggleVoiceInput}
                disabled={loadingReply}
                className={`p-3 rounded-2xl border transition-all ${
                  isListening
                    ? 'bg-red-500 border-red-500 text-white animate-pulse shadow-md'
                    : 'border-zinc-200 dark:border-zinc-800 hover:bg-zinc-100 dark:hover:bg-zinc-900 text-zinc-600 dark:text-zinc-300'
                }`}
                title={isListening ? 'Stop listening' : 'Speak your question (Voice Chat)'}
              >
                {isListening ? <MicOff className="w-4 h-4" /> : <Mic className="w-4 h-4 text-sky-500" />}
              </button>

              <button
                type="submit"
                disabled={!inputMessage.trim() || loadingReply}
                className="p-3 rounded-2xl bg-sky-500 hover:bg-sky-600 text-white font-semibold shadow-sm transition-colors disabled:opacity-50"
                title="Send question"
              >
                <Send className="w-4 h-4" />
              </button>
            </form>
          </div>
        </div>
      </div>
    </DashboardLayout>
  );
};
