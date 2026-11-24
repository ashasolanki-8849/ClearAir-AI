import { Response } from 'express';
import { AuthenticatedRequest } from '../middleware/authMiddleware.js';
import { Conversation, IConversation, SupportedLanguage } from '../models/Conversation.js';
import { buildAssistantContext } from '../services/contextBuilderService.js';
import { generateAssistantReply } from '../services/aiAssistantService.js';

export const chat = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { message, conversationId, language = 'en', location, sessionId } = req.body;

    if (!message || typeof message !== 'string' || message.trim().length === 0) {
      res.status(400).json({ success: false, message: 'Message text is required.' });
      return;
    }

    const userId = req.user?.id || null;
    const selectedLanguage: SupportedLanguage = ['en', 'hi', 'gu'].includes(language) ? language : 'en';

    // 1. Build real environmental and user context
    const fullContext = await buildAssistantContext(userId, location);

    // 2. Retrieve existing conversation or prepare a new one
    let conversation: IConversation | null = null;
    if (conversationId) {
      conversation = await Conversation.findById(conversationId);
    }

    if (!conversation) {
      // Create new conversation
      const truncatedTitle = message.trim().length > 40 ? `${message.trim().slice(0, 40)}...` : message.trim();
      conversation = new Conversation({
        userId,
        sessionId: sessionId || (userId ? null : `anon_${Date.now()}_${Math.random().toString(36).substring(2, 7)}`),
        title: truncatedTitle,
        messages: [],
        language: selectedLanguage,
        aqiContextSnapshot: {
          locationName: fullContext.environmental.locationName,
          city: fullContext.environmental.city,
          lat: fullContext.environmental.lat,
          lon: fullContext.environmental.lon,
          aqi: fullContext.environmental.aqi,
          aqiCategory: fullContext.environmental.aqiCategory,
          pm25: fullContext.environmental.pollutants.pm25,
          pm10: fullContext.environmental.pollutants.pm10,
          temperature: fullContext.environmental.weather.temperature,
          humidity: fullContext.environmental.weather.humidity,
          windSpeed: fullContext.environmental.weather.windSpeed,
          condition: fullContext.environmental.weather.condition,
          timestamp: new Date(),
        },
      });
    }

    // Update language and snapshot
    conversation.language = selectedLanguage;

    // 3. Generate structured AI response
    const structuredResponse = await generateAssistantReply(
      message.trim(),
      fullContext,
      selectedLanguage,
      conversation.messages
    );

    // 4. Save both user message and assistant structured message
    const userMsgId = `usr_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;
    const assistantMsgId = `ast_${Date.now()}_${Math.random().toString(36).substring(2, 6)}`;

    conversation.messages.push({
      id: userMsgId,
      role: 'user',
      content: message.trim(),
      structuredData: null,
      timestamp: new Date(),
    });

    conversation.messages.push({
      id: assistantMsgId,
      role: 'assistant',
      content: structuredResponse.summary,
      structuredData: structuredResponse,
      timestamp: new Date(),
    });

    await conversation.save();

    res.status(200).json({
      success: true,
      conversationId: conversation._id,
      response: structuredResponse,
      environmentalContext: fullContext.environmental,
      hasRealtimeData: fullContext.hasRealtimeData,
      dataNotice: fullContext.dataNotice,
    });
  } catch (error: any) {
    console.error('[Assistant Controller Error]:', error);
    res.status(500).json({ success: false, message: error.message || 'AI Assistant processing failed.' });
  }
};

export const getConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    const sessionId = req.query.sessionId as string;

    const query = userId ? { userId } : sessionId ? { sessionId } : null;

    if (!query) {
      res.status(200).json({ success: true, conversations: [] });
      return;
    }

    const conversations = await Conversation.find(query, {
      title: 1,
      language: 1,
      aqiContextSnapshot: 1,
      createdAt: 1,
      updatedAt: 1,
      messageCount: { $size: '$messages' },
    })
      .sort({ updatedAt: -1 })
      .limit(30);

    res.status(200).json({
      success: true,
      conversations,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const getConversationById = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    // Ownership check if conversation has userId
    if (conversation.userId && userId && conversation.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized access to this conversation.' });
      return;
    }

    res.status(200).json({
      success: true,
      conversation,
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const deleteConversation = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const { id } = req.params;
    const userId = req.user?.id;

    const conversation = await Conversation.findById(id);
    if (!conversation) {
      res.status(404).json({ success: false, message: 'Conversation not found.' });
      return;
    }

    if (conversation.userId && userId && conversation.userId.toString() !== userId) {
      res.status(403).json({ success: false, message: 'Unauthorized to delete this conversation.' });
      return;
    }

    await Conversation.findByIdAndDelete(id);

    res.status(200).json({
      success: true,
      message: 'Conversation deleted successfully.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};

export const clearAllConversations = async (req: AuthenticatedRequest, res: Response): Promise<void> => {
  try {
    const userId = req.user?.id;
    if (!userId) {
      res.status(401).json({ success: false, message: 'Authentication required to clear all conversations.' });
      return;
    }

    await Conversation.deleteMany({ userId });

    res.status(200).json({
      success: true,
      message: 'All conversations cleared.',
    });
  } catch (error: any) {
    res.status(500).json({ success: false, message: error.message });
  }
};
