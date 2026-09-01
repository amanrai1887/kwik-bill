import { GoogleGenAI } from '@google/genai';
import { config } from '../config/app.config.ts';
import { buildSystemPrompt, UserBusinessContext } from '../config/ai.config.ts';
import { allToolDeclarations, executeAgentTool } from './tools/index.ts';
import { getConversationById, saveConversation, StoredAIMessage } from '../db/conversations.ts';
import { randomUUID } from 'crypto';

export interface ProcessAgentMessageParams {
  userId: number;
  userProfile: any;
  conversationId?: string;
  userMessage: string;
  confirmationPayload?: any;
}

export interface AgentResponse {
  conversationId: string;
  response: string;
  toolsUsed: Array<{
    name: string;
    args: any;
    result: any;
  }>;
  structuredData?: any;
  requiresConfirmation?: boolean;
  confirmationPayload?: any;
}

export async function processAgentTurn(params: ProcessAgentMessageParams): Promise<AgentResponse> {
  const { userId, userProfile, userMessage, confirmationPayload } = params;
  const conversationId = params.conversationId || randomUUID();

  const apiKey = config.gemini.apiKey || process.env.GEMINI_API_KEY;
  if (!apiKey) {
    throw new Error('GEMINI_API_KEY is not configured on the server. Please set GEMINI_API_KEY in your environment variables.');
  }

  const ai = new GoogleGenAI({ apiKey });

  // 1. Build dynamic business context
  const now = new Date();
  const currentDateStr = now.toLocaleDateString('en-IN', {
    weekday: 'long',
    year: 'numeric',
    month: 'short',
    day: 'numeric',
  });

  const businessContext: UserBusinessContext = {
    userId,
    businessName: userProfile.businessName || 'My Business',
    email: userProfile.email,
    phone: userProfile.phone || '',
    gstin: userProfile.gstin || '',
    address: userProfile.address || '',
    upiId: userProfile.upiId || '',
    bankName: userProfile.bankName,
    bankAccountNo: userProfile.bankAccountNo,
    bankIfsc: userProfile.bankIfsc,
    industryType: userProfile.industryType || 'general',
    subscriptionPlan: userProfile.subscriptionPlan || 'pro_499',
    currentDate: currentDateStr,
  };

  const systemInstruction = buildSystemPrompt(businessContext);

  // 2. Retrieve past conversation history from PostgreSQL
  const existingConv = await getConversationById(userId, conversationId);
  const storedMessages: StoredAIMessage[] = (existingConv?.messages as StoredAIMessage[]) || [];

  // Convert stored messages into Gemini Contents format
  const contents: any[] = [];

  for (const m of storedMessages.slice(-16)) {
    if (m.role === 'user') {
      contents.push({
        role: 'user',
        parts: [{ text: m.content || '' }],
      });
    } else if (m.role === 'model') {
      const parts: any[] = [];
      if (m.content) {
        parts.push({ text: m.content });
      }
      if (m.toolCalls && m.toolCalls.length > 0) {
        for (const tc of m.toolCalls) {
          parts.push({
            functionCall: {
              name: tc.name,
              args: tc.args || {},
            },
          });
        }
      }
      if (parts.length > 0) {
        contents.push({ role: 'model', parts });
      }
    } else if (m.role === 'function' && m.toolResult) {
      contents.push({
        role: 'user',
        parts: [
          {
            functionResponse: {
              name: m.toolResult.name,
              response: m.toolResult.result || {},
            },
          },
        ],
      });
    }
  }

  // If user passed a confirmationPayload directly (e.g. from clicking "Confirm" in chat UI)
  let effectiveMessage = userMessage;
  if (confirmationPayload && confirmationPayload.actionType) {
    effectiveMessage = `Confirmed: Proceed with ${confirmationPayload.actionType}.`;
  }

  // Append new user message
  contents.push({
    role: 'user',
    parts: [{ text: effectiveMessage }],
  });

  const toolsUsed: Array<{ name: string; args: any; result: any }> = [];
  let finalResponseText = '';
  let structuredData: any = null;
  let requiresConfirmation = false;
  let pendingConfirmationPayload: any = null;

  const maxIterations = 5;
  let iteration = 0;

  while (iteration < maxIterations) {
    iteration++;

    const geminiResponse = await ai.models.generateContent({
      model: config.gemini.model || 'gemini-3.6-flash',
      contents,
      config: {
        systemInstruction,
        temperature: 0.3,
        tools: [
          {
            functionDeclarations: allToolDeclarations as any,
          },
        ],
      },
    });

    const candidate = geminiResponse.candidates?.[0];
    if (!candidate || !candidate.content) {
      finalResponseText = "I'm sorry, I couldn't process your request right now. Please try again.";
      break;
    }

    const parts = candidate.content.parts || [];
    const functionCalls = parts.filter((p: any) => Boolean(p.functionCall)).map((p: any) => p.functionCall);
    const textParts = parts.filter((p: any) => Boolean(p.text)).map((p: any) => p.text).join('\n');

    if (textParts) {
      finalResponseText = textParts;
    }

    if (functionCalls.length === 0) {
      // No more function calls, final answer reached
      break;
    }

    // Add model turn with function calls to conversation history
    contents.push({
      role: 'model',
      parts,
    });

    // Execute each function call
    const toolResponseParts: any[] = [];

    for (const call of functionCalls) {
      const toolName = call.name;
      let toolArgs = call.args || {};

      // If user provided confirmation payload, merge confirmed flag
      if (confirmationPayload && confirmationPayload.payload) {
        toolArgs = { ...toolArgs, ...confirmationPayload.payload, confirmAction: true };
      }

      console.log(`[KwikBill AI Agent] Executing Tool: ${toolName} with args:`, toolArgs);

      let toolResult: any;
      try {
        toolResult = await executeAgentTool(userId, toolName, toolArgs);
      } catch (err: any) {
        console.error(`[KwikBill AI Agent] Tool execution error (${toolName}):`, err);
        toolResult = { error: err.message || 'Tool execution failed' };
      }

      toolsUsed.push({
        name: toolName,
        args: toolArgs,
        result: toolResult,
      });

      // Capture structured data for frontend cards
      if (toolResult?.invoices || toolResult?.invoiceId || toolResult?.pdfUrl || toolResult?.client || toolResult?.paymentId) {
        structuredData = { ...(structuredData || {}), ...toolResult };
      }

      // Check if tool asks for explicit confirmation
      if (toolResult?.requiresConfirmation) {
        requiresConfirmation = true;
        pendingConfirmationPayload = toolResult;
      }

      toolResponseParts.push({
        functionResponse: {
          name: toolName,
          response: toolResult,
        },
      });
    }

    // Add tool responses back to conversation contents
    contents.push({
      role: 'user',
      parts: toolResponseParts,
    });

    // If confirmation is required, break and let Gemini give a summary confirmation prompt
    if (requiresConfirmation) {
      // Generate one final response summarizing the confirmation
      const confirmSummaryRes = await ai.models.generateContent({
        model: config.gemini.model || 'gemini-3.6-flash',
        contents,
        config: {
          systemInstruction,
          temperature: 0.3,
        },
      });
      const confirmText = confirmSummaryRes.candidates?.[0]?.content?.parts?.map((p: any) => p.text).join('\n');
      if (confirmText) {
        finalResponseText = confirmText;
      } else if (pendingConfirmationPayload?.confirmationMessage) {
        finalResponseText = pendingConfirmationPayload.confirmationMessage;
      }
      break;
    }
  }

  // 3. Persist new messages to PostgreSQL
  const newMessagesToStore: StoredAIMessage[] = [
    ...storedMessages,
    {
      id: randomUUID(),
      role: 'user',
      content: effectiveMessage,
      createdAt: new Date().toISOString(),
    },
    {
      id: randomUUID(),
      role: 'model',
      content: finalResponseText,
      toolCalls: toolsUsed.map((t) => ({ name: t.name, args: t.args })),
      structuredData,
      requiresConfirmation,
      confirmationPayload: pendingConfirmationPayload,
      createdAt: new Date().toISOString(),
    },
  ];

  // Derive title from first user query if new conversation
  const title = storedMessages.length === 0 ? effectiveMessage.slice(0, 45) : existingConv?.title;

  await saveConversation(userId, conversationId, newMessagesToStore, title);

  return {
    conversationId,
    response: finalResponseText,
    toolsUsed,
    structuredData,
    requiresConfirmation,
    confirmationPayload: pendingConfirmationPayload,
  };
}
