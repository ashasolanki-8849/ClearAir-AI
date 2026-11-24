import { apiClient } from './api';
import { StructuredAIResponse, SupportedLanguage, ConversationSummary, AssistantMessage } from '../types';

export interface SendMessagePayload {
  message: string;
  conversationId?: string;
  language?: SupportedLanguage;
  location?: {
    lat: number;
    lon: number;
    name: string;
    city?: string;
  };
  sessionId?: string;
}

export interface SendMessageResponse {
  success: boolean;
  conversationId: string;
  response: StructuredAIResponse;
  environmentalContext?: any;
  hasRealtimeData: boolean;
  dataNotice?: string;
}

export const assistantService = {
  sendChatMessage: async (payload: SendMessagePayload): Promise<SendMessageResponse> => {
    return apiClient<SendMessageResponse>('/assistant/chat', {
      method: 'POST',
      bodyData: payload,
    });
  },

  getConversations: async (sessionId?: string): Promise<{ success: boolean; conversations: ConversationSummary[] }> => {
    const query = sessionId ? `?sessionId=${encodeURIComponent(sessionId)}` : '';
    return apiClient<{ success: boolean; conversations: ConversationSummary[] }>(`/assistant/conversations${query}`);
  },

  getConversationById: async (
    id: string
  ): Promise<{ success: boolean; conversation: { _id: string; title: string; messages: AssistantMessage[]; language: SupportedLanguage } }> => {
    return apiClient(`/assistant/conversations/${id}`);
  },

  deleteConversation: async (id: string): Promise<{ success: boolean; message: string }> => {
    return apiClient(`/assistant/conversations/${id}`, {
      method: 'DELETE',
    });
  },

  clearAllConversations: async (): Promise<{ success: boolean; message: string }> => {
    return apiClient('/assistant/conversations', {
      method: 'DELETE',
    });
  },
};
