import { Router } from 'express';
import {
  chat,
  getConversations,
  getConversationById,
  deleteConversation,
  clearAllConversations,
} from '../controllers/assistantController.js';
import { optionalAuthenticateToken, authenticateToken } from '../middleware/authMiddleware.js';

const router = Router();

router.post('/chat', optionalAuthenticateToken, chat);
router.get('/conversations', optionalAuthenticateToken, getConversations);
router.get('/conversations/:id', optionalAuthenticateToken, getConversationById);
router.delete('/conversations/:id', optionalAuthenticateToken, deleteConversation);
router.delete('/conversations', authenticateToken, clearAllConversations);

export default router;
