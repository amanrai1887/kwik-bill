import { Response } from 'express';
import { AuthRequest } from '../middleware/auth.ts';
import { processAgentTurn } from '../services/agent.orchestrator.ts';
import { getConversationsByUserId, getConversationById, deleteConversation } from '../db/conversations.ts';
import { AI_SUGGESTIONS } from '../config/ai.config.ts';
import { asyncHandler, ApiResponse, BadRequestError, ForbiddenError } from '../utils/apiResponse.ts';
import { isSuperAdminEmail } from '../config/app.config.ts';

export const postChatMessage = asyncHandler(async (req: AuthRequest, res: Response) => {
  const user = req.dbUser;
  if (!user) {
    throw new BadRequestError('User session not found.');
  }

  // 1. Block Demo Users: AI Agent requires real authenticated account
  if (user.uid === 'demo-business-owner-101') {
    throw new ForbiddenError(
      'KwikBill AI Agent is available only for registered, signed-in users. Please sign in with your account to use AI Agent.'
    );
  }

  // 2. Enforce Plan Gating: Pro Plan or Superadmin only
  const isSuperAdmin = user.role === 'superadmin' || isSuperAdminEmail(user.email);
  const isProPlan = user.subscriptionPlan === 'pro_499';
  const isTrialActive = user.subscriptionPlan === 'trial_15_days' && user.subscriptionStatus === 'trial';

  if (!isSuperAdmin && !isProPlan && !isTrialActive) {
    throw new ForbiddenError(
      'KwikBill AI Agent is exclusively available on the Pro Growth Plan (₹499/mo). Please upgrade your subscription to unlock intelligent AI billing automation.'
    );
  }

  const { message, conversationId, confirmationPayload } = req.body;

  if ((!message || !message.trim()) && !confirmationPayload) {
    throw new BadRequestError('Message or confirmationPayload is required.');
  }

  const agentResult = await processAgentTurn({
    userId: user.id,
    userProfile: user,
    conversationId,
    userMessage: (message || '').trim(),
    confirmationPayload,
  });

  return ApiResponse.success(res, agentResult);
});

export const getConversationsList = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const list = await getConversationsByUserId(userId);
  return ApiResponse.success(res, { conversations: list });
});

export const getConversationDetail = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const conversationId = req.params.conversationId;
  const conv = await getConversationById(userId, conversationId);
  if (!conv) {
    return ApiResponse.success(res, { conversation: null, messages: [] });
  }
  return ApiResponse.success(res, { conversation: conv, messages: conv.messages || [] });
});

export const removeConversation = asyncHandler(async (req: AuthRequest, res: Response) => {
  const userId = req.dbUser.id;
  const conversationId = req.params.conversationId;
  await deleteConversation(userId, conversationId);
  return ApiResponse.success(res, { message: 'Conversation deleted successfully.' });
});

export const getChatSuggestions = asyncHandler(async (_req: AuthRequest, res: Response) => {
  return ApiResponse.success(res, { suggestions: AI_SUGGESTIONS });
});
