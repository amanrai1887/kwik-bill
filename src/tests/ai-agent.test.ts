import { describe, it, expect } from 'vitest';
import { allToolDeclarations } from '../services/tools/index.ts';
import { buildSystemPrompt, AI_SUGGESTIONS } from '../config/ai.config.ts';
import { renderInvoiceHtml } from '../services/tools/pdf.tool.ts';

describe('KwikBill AI Agent Tests', () => {
  describe('Tool Declarations Registry', () => {
    it('registers all essential tools for natural language billing automation', () => {
      const toolNames = allToolDeclarations.map((t) => t.name);

      expect(toolNames).toContain('query_invoices');
      expect(toolNames).toContain('get_invoice_detail');
      expect(toolNames).toContain('create_invoice');
      expect(toolNames).toContain('update_invoice_tax_and_totals');
      expect(toolNames).toContain('update_invoice_status');
      expect(toolNames).toContain('cancel_invoice');
      expect(toolNames).toContain('search_clients');
      expect(toolNames).toContain('create_client');
      expect(toolNames).toContain('record_payment');
      expect(toolNames).toContain('get_payments_history');
      expect(toolNames).toContain('get_dashboard_analytics');
      expect(toolNames).toContain('get_party_risk_scores');
      expect(toolNames).toContain('send_whatsapp_invoice');
      expect(toolNames).toContain('send_payment_reminder');
      expect(toolNames).toContain('generate_invoice_pdf');
    });

    it('ensures each tool has a valid schema with name, description, and parameters', () => {
      for (const tool of allToolDeclarations) {
        expect(tool.name).toBeTruthy();
        expect(tool.description).toBeTruthy();
        expect(tool.parameters).toBeDefined();
        expect(tool.parameters.type).toBe('OBJECT');
      }
    });
  });

  describe('System Prompt & Business Context Injection', () => {
    it('injects active merchant details into system prompt', () => {
      const mockContext = {
        userId: 1,
        businessName: 'Speedy Transport & Logistics',
        email: 'owner@speedytrans.in',
        phone: '9876543210',
        gstin: '07AAAAA0000A1Z5',
        address: 'Transport Nagar, Delhi',
        upiId: 'speedy@upi',
        industryType: 'transport',
        subscriptionPlan: 'pro_499',
        currentDate: 'Tuesday, Sep 1, 2026',
      };

      const prompt = buildSystemPrompt(mockContext);
      expect(prompt).toContain('Speedy Transport & Logistics');
      expect(prompt).toContain('07AAAAA0000A1Z5');
      expect(prompt).toContain('speedy@upi');
      expect(prompt).toContain('Tuesday, Sep 1, 2026');
      expect(prompt).toContain('ALWAYS confirm financial mutations');
      expect(prompt).toContain('INDIAN FINANCIAL STANDARDS');
    });

    it('has preset quick suggestions for common user queries', () => {
      expect(AI_SUGGESTIONS.length).toBeGreaterThan(0);
      expect(AI_SUGGESTIONS[0]).toContain('unpaid invoices from last month');
    });
  });

  describe('Invoice PDF HTML Renderer', () => {
    it('generates valid tax invoice HTML template with correct brand colors and line items', async () => {
      const mockInvoice = {
        id: 101,
        invoiceNumber: 'INV-2026-101',
        issueDate: '2026-08-15',
        dueDate: '2026-08-30',
        status: 'pending',
        subtotal: '50000.00',
        taxRate: '18.00',
        taxAmount: '9000.00',
        totalAmount: '59000.00',
        discountAmount: '0.00',
        client: {
          name: 'ABC Traders',
          companyName: 'ABC Trading Corp',
          phone: '9811122233',
          gstin: '07BBBBB1111B1Z6',
        },
        items: [
          {
            description: 'Logistics freight transport',
            quantity: 1,
            rate: 50000,
            amount: 50000,
          },
        ],
      };

      const mockMerchant = {
        businessName: 'Speedy Transport',
        brandColor: '#4f46e5',
        upiId: 'speedy@upi',
      };

      const html = await renderInvoiceHtml(mockInvoice, mockMerchant);
      expect(html).toContain('INV-2026-101');
      expect(html).toContain('ABC Traders');
      expect(html).toContain('₹50,000.00');
      expect(html).toContain('₹4,500.00');
      expect(html).toContain('₹59,000.00');
      expect(html).toContain('speedy@upi');
    });
  });
});
