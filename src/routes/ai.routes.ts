import { Router } from 'express';
import { requireAuth } from '../middleware/auth.ts';
import { aiLimiter } from '../middleware/rateLimiter.ts';
import {
  postChatMessage,
  getConversationsList,
  getConversationDetail,
  removeConversation,
  getChatSuggestions,
} from '../controllers/ai.controller.ts';

const router = Router();

// Apply auth to all AI agent routes
router.use(requireAuth);

// Chat completion endpoint (with rate limiter)
router.post('/chat', aiLimiter, postChatMessage);

// Conversation management
router.get('/conversations', getConversationsList);
router.get('/conversations/:conversationId', getConversationDetail);
router.delete('/conversations/:conversationId', removeConversation);

// Quick suggestions
router.get('/suggestions', getChatSuggestions);

export default router;
