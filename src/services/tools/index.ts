import { invoiceToolDeclarations, executeInvoiceTool } from './invoice.tool.ts';
import { clientToolDeclarations, executeClientTool } from './client.tool.ts';
import { paymentToolDeclarations, executePaymentTool } from './payment.tool.ts';
import { analyticsToolDeclarations, executeAnalyticsTool } from './analytics.tool.ts';
import { whatsappToolDeclarations, executeWhatsAppTool } from './whatsapp.tool.ts';
import { pdfToolDeclarations, executePdfTool } from './pdf.tool.ts';

// Aggregate all tool declarations
export const allToolDeclarations = [
  ...invoiceToolDeclarations,
  ...clientToolDeclarations,
  ...paymentToolDeclarations,
  ...analyticsToolDeclarations,
  ...whatsappToolDeclarations,
  ...pdfToolDeclarations,
];

// Central tool execution dispatcher
export async function executeAgentTool(userId: number, toolName: string, args: any) {
  // Invoice tools
  if (invoiceToolDeclarations.some((t) => t.name === toolName)) {
    return await executeInvoiceTool(userId, toolName, args);
  }

  // Client tools
  if (clientToolDeclarations.some((t) => t.name === toolName)) {
    return await executeClientTool(userId, toolName, args);
  }

  // Payment tools
  if (paymentToolDeclarations.some((t) => t.name === toolName)) {
    return await executePaymentTool(userId, toolName, args);
  }

  // Analytics tools
  if (analyticsToolDeclarations.some((t) => t.name === toolName)) {
    return await executeAnalyticsTool(userId, toolName, args);
  }

  // WhatsApp tools
  if (whatsappToolDeclarations.some((t) => t.name === toolName)) {
    return await executeWhatsAppTool(userId, toolName, args);
  }

  // PDF tools
  if (pdfToolDeclarations.some((t) => t.name === toolName)) {
    return await executePdfTool(userId, toolName, args);
  }

  throw new Error(`Tool "${toolName}" is not registered in the tool execution registry.`);
}
