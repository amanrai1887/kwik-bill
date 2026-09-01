import { db } from './index.ts';
import { aiConversations } from './schema.ts';
import { eq, and, desc } from 'drizzle-orm';

export interface StoredAIMessage {
  id: string;
  role: 'user' | 'model' | 'function' | 'system';
  content?: string;
  toolCalls?: Array<{
    name: string;
    args: any;
  }>;
  toolResult?: {
    name: string;
    result: any;
  };
  structuredData?: any;
  requiresConfirmation?: boolean;
  confirmationPayload?: any;
  createdAt: string;
}

export async function getConversationsByUserId(userId: number, limit = 20) {
  try {
    return await db
      .select({
        id: aiConversations.id,
        conversationId: aiConversations.conversationId,
        title: aiConversations.title,
        lastActiveAt: aiConversations.lastActiveAt,
        createdAt: aiConversations.createdAt,
      })
      .from(aiConversations)
      .where(eq(aiConversations.userId, userId))
      .orderBy(desc(aiConversations.lastActiveAt))
      .limit(limit);
  } catch (error) {
    console.error('Failed to get AI conversations:', error);
    throw new Error('Failed to get AI conversations.', { cause: error });
  }
}

export async function getConversationById(userId: number, conversationId: string) {
  try {
    const rows = await db
      .select()
      .from(aiConversations)
      .where(and(eq(aiConversations.userId, userId), eq(aiConversations.conversationId, conversationId)))
      .limit(1);

    if (rows.length === 0) return null;
    return rows[0];
  } catch (error) {
    console.error('Failed to get conversation:', error);
    throw new Error('Failed to get conversation.', { cause: error });
  }
}

export async function saveConversation(
  userId: number,
  conversationId: string,
  messages: StoredAIMessage[],
  title?: string
) {
  try {
    const existing = await getConversationById(userId, conversationId);

    // Keep sliding window of max 50 recent messages per conversation
    const trimmedMessages = messages.slice(-50);

    if (existing) {
      const updateData: any = {
        messages: trimmedMessages,
        lastActiveAt: new Date(),
        updatedAt: new Date(),
      };
      if (title && title.trim()) {
        updateData.title = title.trim();
      }
      const updated = await db
        .update(aiConversations)
        .set(updateData)
        .where(and(eq(aiConversations.userId, userId), eq(aiConversations.conversationId, conversationId)))
        .returning();
      return updated[0];
    } else {
      const inserted = await db
        .insert(aiConversations)
        .values({
          userId,
          conversationId,
          title: title || 'New Conversation',
          messages: trimmedMessages,
          lastActiveAt: new Date(),
        })
        .returning();
      return inserted[0];
    }
  } catch (error) {
    console.error('Failed to save AI conversation:', error);
    throw new Error('Failed to save AI conversation.', { cause: error });
  }
}

export async function deleteConversation(userId: number, conversationId: string) {
  try {
    const deleted = await db
      .delete(aiConversations)
      .where(and(eq(aiConversations.userId, userId), eq(aiConversations.conversationId, conversationId)))
      .returning();
    return deleted[0] || null;
  } catch (error) {
    console.error('Failed to delete conversation:', error);
    throw new Error('Failed to delete conversation.', { cause: error });
  }
}
