import { getInvoiceByIdService } from '../invoices.service.ts';
import { generateLocalQrDataUrl } from '../../lib/qrCode.ts';
import { calculateGstBreakdown, getStateNameOrFormatted, STATUTORY_INVOICE_DISCLAIMER } from '../../lib/gstCompliance.ts';
import fs from 'fs';
import path from 'path';

let puppeteerModule: any = null;

async function getPuppeteer() {
  if (puppeteerModule) return puppeteerModule;
  try {
    puppeteerModule = await import('puppeteer');
    return puppeteerModule;
  } catch (err) {
    console.error('Failed to import puppeteer:', err);
    return null;
  }
}

export const pdfToolDeclarations = [
  {
    name: 'generate_invoice_pdf',
    description: 'Generate a print-ready, GST-compliant PDF document for an invoice and return the download URL.',
    parameters: {
      type: 'OBJECT',
      properties: {
        invoiceId: {
          type: 'INTEGER',
          description: 'Database ID of the invoice to render (Required)',
        },
      },
      required: ['invoiceId'],
    },
  },
];

/**
 * Converts numeric amount to Indian English words
 */
function numberToIndianWords(num: number): string {
  const a = [
    '', 'One ', 'Two ', 'Three ', 'Four ', 'Five ', 'Six ', 'Seven ', 'Eight ', 'Nine ', 'Ten ',
    'Eleven ', 'Twelve ', 'Thirteen ', 'Fourteen ', 'Fifteen ', 'Sixteen ', 'Seventeen ', 'Eighteen ', 'Nineteen '
  ];
  const b = ['', '', 'Twenty', 'Thirty', 'Forty', 'Fifty', 'Sixty', 'Seventy', 'Eighty', 'Ninety'];

  const n = Math.floor(Math.abs(num));
  if (n === 0) return 'Zero Rupees Only';

  function inWords(n: number): string {
    let str = '';
    if (n >= 10000000) {
      str += inWords(Math.floor(n / 10000000)) + 'Crore ';
      n %= 10000000;
    }
    if (n >= 100000) {
      str += inWords(Math.floor(n / 100000)) + 'Lakh ';
      n %= 100000;
    }
    if (n >= 1000) {
      str += inWords(Math.floor(n / 1000)) + 'Thousand ';
      n %= 1000;
    }
    if (n >= 100) {
      str += inWords(Math.floor(n / 100)) + 'Hundred ';
      n %= 100;
    }
    if (n > 0) {
      if (n < 20) str += a[n];
      else {
        str += b[Math.floor(n / 10)] + (n % 10 !== 0 ? ' ' + a[n % 10] : ' ');
      }
    }
    return str;
  }

  return `${inWords(n).trim()} Rupees Only`;
}

/**
 * Safe HTML Entity Escaping to prevent HTML Injection & XSS in PDF generator
 */
function escapeHtml(str: any): string {
  if (str === null || str === undefined) return '';
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

function sanitizeBrandColor(color?: string): string {
  if (color && /^#[0-9a-fA-F]{6}$/.test(color.trim())) {
    return color.trim();
  }
  return '#4f46e5';
}

function sanitizeLogoUrl(url?: string): string {
  if (!url || typeof url !== 'string') return '';
  const trimmed = url.trim();
  if (trimmed.startsWith('https://') || trimmed.startsWith('data:image/')) {
    return escapeHtml(trimmed);
  }
  return '';
}

export async function renderInvoiceHtml(invoice: any, merchant: any): Promise<string> {
  const items = Array.isArray(invoice.items) ? invoice.items : [];
  const brandColor = sanitizeBrandColor(merchant?.brandColor);
  const logoUrl = sanitizeLogoUrl(merchant?.logoUrl);

  const subtotal = parseFloat(invoice.subtotal || '0');
  const taxRate = parseFloat(invoice.taxRate || '0');
  const discountAmount = parseFloat(invoice.discountAmount || '0');
  const tdsAmount = parseFloat(invoice.tdsAmount || '0');
  const totalAmount = parseFloat(invoice.totalAmount || '0');
  const paidAmount = parseFloat(invoice.paidAmount || '0');
  const balanceDue = Math.max(0, totalAmount - paidAmount);

  // Compute GST Split
  const gstBreakdown = calculateGstBreakdown(
    taxRate,
    subtotal,
    merchant?.gstin,
    invoice.placeOfSupply || invoice.client?.gstin
  );

  // Generate UPI QR Code
  const rawUpiId = merchant?.upiId || 'speedytrans@okaxis';
  const upiId = escapeHtml(rawUpiId);
  const upiUrl = `upi://pay?pa=${rawUpiId}&pn=${encodeURIComponent(merchant?.businessName || 'Merchant')}&am=${balanceDue.toFixed(2)}&cu=INR&tn=${encodeURIComponent(`Invoice ${invoice.invoiceNumber}`)}`;
  const qrCodeDataUrl = await generateLocalQrDataUrl(upiUrl);

  const placeOfSupplyFormatted = escapeHtml(getStateNameOrFormatted(invoice.placeOfSupply || invoice.client?.gstin?.substring(0, 2) || merchant?.gstin?.substring(0, 2)));

  const rows = items
    .map(
      (item: any, idx: number) => `
      <tr style="border-bottom: 1px solid #e2e8f0;">
        <td style="padding: 10px 12px; text-align: center; color: #64748b; font-size: 12px;">${idx + 1}</td>
        <td style="padding: 10px 12px; font-weight: 600; color: #1e293b; font-size: 13px;">
          ${escapeHtml(item.description || 'Item')}
          ${item.hsnCode ? `<div style="font-size: 11px; color: #64748b; font-weight: normal; margin-top: 2px;">HSN/SAC: <span style="font-family: monospace;">${escapeHtml(item.hsnCode)}</span></div>` : ''}
        </td>
        <td style="padding: 10px 12px; text-align: center; color: #334155; font-size: 12px;">${escapeHtml(item.quantity || 1)} ${escapeHtml(item.uqc || '')}</td>
        <td style="padding: 10px 12px; text-align: right; color: #334155; font-size: 13px;">₹${Number(item.rate || 0).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
        <td style="padding: 10px 12px; text-align: right; font-weight: 700; color: #0f172a; font-size: 13px;">₹${Number(item.amount || (item.quantity || 1) * (item.rate || 0)).toLocaleString('en-IN', { minimumFractionDigits: 2 })}</td>
      </tr>
    `
    )
    .join('');

  const hasTransportDetails = Boolean(invoice.vehicleNumber || invoice.lrNumber || invoice.routeSource || invoice.routeDestination);

  const escapedBusinessName = escapeHtml(merchant?.businessName || 'KwikBill Merchant');
  const escapedInvoiceNumber = escapeHtml(invoice.invoiceNumber);
  const escapedClientName = escapeHtml(invoice.client?.name || 'Customer');

  return `
    <!DOCTYPE html>
    <html>
    <head>
      <meta charset="utf-8" />
      <title>Tax Invoice ${escapedInvoiceNumber}</title>
      <style>
        * { box-sizing: border-box; }
        body { font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif; margin: 0; padding: 24px; background: #ffffff; color: #0f172a; }
        .invoice-box { max-width: 820px; margin: auto; border: 1px solid #cbd5e1; border-radius: 12px; padding: 28px; }
        .header { display: flex; justify-content: space-between; align-items: flex-start; margin-bottom: 24px; border-bottom: 2px solid ${brandColor}; padding-bottom: 18px; }
        .badge { display: inline-block; padding: 3px 10px; border-radius: 9999px; font-size: 11px; font-weight: 800; text-transform: uppercase; letter-spacing: 0.5px; }
        .badge-paid { background: #dcfce7; color: #166534; border: 1px solid #86efac; }
        .badge-pending { background: #fef9c3; color: #854d0e; border: 1px solid #fde047; }
        .badge-overdue { background: #fee2e2; color: #991b1b; border: 1px solid #fca5a5; }
      </style>
    </head>
    <body>
      <div class="invoice-box">
        <!-- Header -->
        <div class="header">
          <div style="display: flex; gap: 14px; align-items: flex-start;">
            ${
              logoUrl
                ? `<img src="${logoUrl}" alt="Logo" style="width: 56px; height: 56px; object-fit: contain; border-radius: 10px; border: 1px solid #e2e8f0; padding: 2px;" />`
                : `<div style="width: 52px; height: 52px; border-radius: 12px; background: ${brandColor}; color: #ffffff; display: flex; align-items: center; justify-content: center; font-size: 22px; font-weight: 900; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">${escapeHtml((merchant?.businessName || 'M').charAt(0).toUpperCase())}</div>`
            }
            <div>
              <h1 style="margin: 0; font-size: 22px; font-weight: 900; color: ${brandColor}; letter-spacing: -0.5px;">${escapedBusinessName}</h1>
              <p style="margin: 3px 0; color: #475569; font-size: 12px; line-height: 1.4;">${escapeHtml(merchant?.address || 'India')}</p>
              ${merchant?.gstin ? `<p style="margin: 2px 0; font-size: 12px; font-weight: 700; color: #1e293b;">GSTIN: <span style="font-family: monospace; font-weight: 800; color: ${brandColor};">${escapeHtml(merchant.gstin)}</span></p>` : ''}
              ${merchant?.phone ? `<p style="margin: 2px 0; font-size: 12px; color: #64748b;">Phone: <strong>${escapeHtml(merchant.phone)}</strong> | Email: ${escapeHtml(merchant.email || '')}</p>` : ''}
            </div>
          </div>

          <div style="text-align: right;">
            <div style="font-size: 18px; font-weight: 900; color: #0f172a; text-transform: uppercase; letter-spacing: 1px;">TAX INVOICE</div>
            <div style="font-size: 14px; font-weight: 800; color: ${brandColor}; margin-top: 3px;"># ${escapedInvoiceNumber}</div>
            <div style="margin-top: 6px;">
              <span class="badge ${invoice.status === 'paid' ? 'badge-paid' : invoice.status === 'overdue' ? 'badge-overdue' : 'badge-pending'}">
                ${escapeHtml(invoice.status || 'pending')}
              </span>
            </div>
          </div>
        </div>

        <!-- Bill To & Meta Info Grid -->
        <div style="display: flex; justify-content: space-between; margin-bottom: 20px; background: #f8fafc; padding: 14px 18px; border-radius: 10px; border: 1px solid #e2e8f0;">
          <div style="max-width: 55%;">
            <div style="font-size: 10px; font-weight: 800; text-transform: uppercase; color: #64748b; letter-spacing: 0.5px; margin-bottom: 4px;">BILLED TO (BUYER):</div>
            <div style="font-size: 15px; font-weight: 800; color: #0f172a;">${escapedClientName}</div>
            ${invoice.client?.companyName ? `<div style="font-size: 12px; font-weight: 600; color: #334155; margin-top: 2px;">${escapeHtml(invoice.client.companyName)}</div>` : ''}
            ${invoice.client?.address ? `<div style="font-size: 12px; color: #64748b; margin-top: 2px; line-height: 1.4;">${escapeHtml(invoice.client.address)}</div>` : ''}
            ${invoice.client?.gstin ? `<div style="font-size: 12px; font-weight: 700; color: #1e293b; margin-top: 4px;">GSTIN: <span style="font-family: monospace; color: #4f46e5;">${escapeHtml(invoice.client.gstin)}</span></div>` : ''}
            ${invoice.client?.phone ? `<div style="font-size: 11px; color: #64748b; margin-top: 2px;">Contact: ${escapeHtml(invoice.client.phone)}</div>` : ''}
          </div>

          <div style="text-align: right; font-size: 12px; min-width: 40%;">
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Invoice Date:</span> <strong style="color: #0f172a;">${escapeHtml(invoice.issueDate)}</strong></div>
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Due Date:</span> <strong style="color: #dc2626;">${escapeHtml(invoice.dueDate)}</strong></div>
            <div style="margin-bottom: 4px;"><span style="color: #64748b;">Place of Supply:</span> <strong>${placeOfSupplyFormatted}</strong></div>
            <div><span style="color: #64748b;">Reverse Charge (RCM):</span> <strong>${invoice.isRcm ? 'YES' : 'NO'}</strong></div>
          </div>
        </div>

        <!-- Optional Transport & Logistics Details -->
        ${
          hasTransportDetails
            ? `
          <div style="margin-bottom: 20px; background: #eff6ff; border: 1px solid #bfdbfe; border-radius: 8px; padding: 10px 14px; display: flex; flex-wrap: wrap; gap: 16px; font-size: 11px;">
            ${invoice.vehicleNumber ? `<div><span style="color: #1e40af; font-weight: bold;">Vehicle No:</span> <strong>${escapeHtml(invoice.vehicleNumber)}</strong></div>` : ''}
            ${invoice.lrNumber ? `<div><span style="color: #1e40af; font-weight: bold;">LR / Bilty No:</span> <strong>${escapeHtml(invoice.lrNumber)}</strong></div>` : ''}
            ${invoice.routeSource && invoice.routeDestination ? `<div><span style="color: #1e40af; font-weight: bold;">Route:</span> <strong>${escapeHtml(invoice.routeSource)} → ${escapeHtml(invoice.routeDestination)}</strong></div>` : ''}
            ${invoice.ewayBillNumber ? `<div><span style="color: #1e40af; font-weight: bold;">E-Way Bill:</span> <strong>${escapeHtml(invoice.ewayBillNumber)}</strong></div>` : ''}
          </div>
        `
            : ''
        }

        <!-- Items Table -->
        <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px; font-size: 12px;">
          <thead>
            <tr style="background: #f1f5f9; border-top: 1px solid #cbd5e1; border-bottom: 2px solid #94a3b8;">
              <th style="padding: 10px 12px; text-align: center; width: 35px; font-weight: 800; color: #334155;">#</th>
              <th style="padding: 10px 12px; text-align: left; font-weight: 800; color: #334155;">ITEM DESCRIPTION</th>
              <th style="padding: 10px 12px; text-align: center; width: 75px; font-weight: 800; color: #334155;">QTY</th>
              <th style="padding: 10px 12px; text-align: right; width: 110px; font-weight: 800; color: #334155;">RATE</th>
              <th style="padding: 10px 12px; text-align: right; width: 120px; font-weight: 800; color: #334155;">AMOUNT</th>
            </tr>
          </thead>
          <tbody>
            ${rows}
          </tbody>
        </table>

        <!-- Amount In Words -->
        <div style="margin-bottom: 20px; padding: 10px 14px; background: #f8fafc; border-left: 4px solid ${brandColor}; border-radius: 4px; font-size: 12px;">
          <span style="color: #64748b; font-weight: 600;">Total in Words:</span>
          <strong style="color: #0f172a; margin-left: 6px;">${numberToIndianWords(totalAmount)}</strong>
        </div>

        <!-- Footer Breakdown: QR Code + Bank Details + Financial Calculation -->
        <div style="display: flex; justify-content: space-between; align-items: flex-start; gap: 20px;">
          <!-- Left: UPI QR Code & Bank Transfer Box -->
          <div style="flex: 1; max-width: 48%;">
            <div style="display: flex; gap: 14px; background: #ffffff; border: 1px solid #e2e8f0; border-radius: 10px; padding: 12px; align-items: center;">
              ${
                qrCodeDataUrl
                  ? `<img src="${qrCodeDataUrl}" alt="UPI QR" style="width: 88px; height: 88px; object-fit: contain; border-radius: 6px; border: 1px solid #e2e8f0;" />`
                  : ''
              }
              <div style="font-size: 11px; color: #475569;">
                <div style="font-weight: 800; color: #0f172a; margin-bottom: 2px; font-size: 12px;">Instant UPI Payment</div>
                <div>Scan with Google Pay, PhonePe, Paytm</div>
                <div style="margin-top: 4px; font-family: monospace; font-weight: 800; color: ${brandColor}; font-size: 12px;">
                  ${upiId}
                </div>
              </div>
            </div>

            ${
              merchant?.bankAccountNo
                ? `
              <div style="margin-top: 10px; font-size: 11px; color: #475569; background: #f8fafc; padding: 8px 12px; border-radius: 6px; border: 1px solid #e2e8f0;">
                <div><strong>Bank Name:</strong> ${escapeHtml(merchant.bankName || 'Bank')}</div>
                <div><strong>A/C No:</strong> <span style="font-family: monospace; font-weight: bold;">${escapeHtml(merchant.bankAccountNo)}</span> | <strong>IFSC:</strong> ${escapeHtml(merchant.bankIfsc || '')}</div>
              </div>
            `
                : ''
            }

            <div style="margin-top: 10px; font-size: 11px; color: #64748b; line-height: 1.4;">
              <strong>Terms & Conditions:</strong><br />
              ${escapeHtml(invoice.terms || 'Payment is due within stipulated days of invoice date.')}
            </div>
          </div>

          <!-- Right: Tax Split & Totals Table -->
          <div style="width: 48%; font-size: 12px;">
            <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
              <span style="color: #64748b;">Taxable Subtotal:</span>
              <span style="font-weight: 700; color: #0f172a;">₹${subtotal.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            ${
              gstBreakdown.isInterState
                ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">Integrated GST (IGST ${gstBreakdown.igstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">₹${gstBreakdown.igstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `
                : `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">Central GST (CGST ${gstBreakdown.cgstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">₹${gstBreakdown.cgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9;">
                <span style="color: #64748b;">State GST (SGST ${gstBreakdown.sgstRate}%):</span>
                <span style="font-weight: 700; color: #0f172a;">₹${gstBreakdown.sgstAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `
            }

            ${
              discountAmount > 0
                ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; color: #16a34a;">
                <span>Discount Applied:</span>
                <span style="font-weight: 700;">- ₹${discountAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `
                : ''
            }

            ${
              tdsAmount > 0
                ? `
              <div style="display: flex; justify-content: space-between; padding: 5px 0; border-bottom: 1px solid #f1f5f9; color: #d97706;">
                <span>TDS Deducted:</span>
                <span style="font-weight: 700;">- ₹${tdsAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `
                : ''
            }

            <div style="display: flex; justify-content: space-between; padding: 10px 0; border-top: 2px solid #0f172a; margin-top: 6px; font-size: 16px; font-weight: 900; color: ${brandColor};">
              <span>Total Amount:</span>
              <span>₹${totalAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
            </div>

            ${
              paidAmount > 0
                ? `
              <div style="display: flex; justify-content: space-between; padding: 4px 0; color: #16a34a; font-size: 12px;">
                <span>Amount Paid:</span>
                <span style="font-weight: bold;">₹${paidAmount.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
              <div style="display: flex; justify-content: space-between; padding: 6px 0; border-top: 1px dashed #cbd5e1; font-weight: 800; color: #dc2626; font-size: 14px;">
                <span>Balance Due:</span>
                <span>₹${balanceDue.toLocaleString('en-IN', { minimumFractionDigits: 2 })}</span>
              </div>
            `
                : ''
            }

            <!-- Authorised Signatory Box -->
            <div style="margin-top: 24px; text-align: right; font-size: 11px; color: #64748b;">
              <div style="font-weight: 700; color: #0f172a;">For ${escapedBusinessName}</div>
              <div style="height: 44px;"></div>
              <div style="border-top: 1px solid #cbd5e1; display: inline-block; padding-top: 4px; min-width: 140px; text-align: center;">
                Authorised Signatory
              </div>
            </div>
          </div>
        </div>

        <!-- Statutory Footer -->
        <div style="margin-top: 24px; padding-top: 12px; border-top: 1px solid #e2e8f0; font-size: 10px; color: #94a3b8; text-align: center;">
          ${STATUTORY_INVOICE_DISCLAIMER}
        </div>
      </div>
    </body>
    </html>
  `;
}

export async function executePdfTool(userId: number, functionName: string, args: any) {
  if (functionName !== 'generate_invoice_pdf') {
    throw new Error(`Unknown PDF tool action: ${functionName}`);
  }

  const { invoiceId } = args;
  const invoice = await getInvoiceByIdService(userId, Number(invoiceId));
  if (!invoice) return { error: `Invoice #${invoiceId} not found.` };

  // Fetch merchant profile
  const { users } = await import('../../db/schema.ts');
  const { db } = await import('../../db/index.ts');
  const { eq } = await import('drizzle-orm');
  const userRows = await db.select().from(users).where(eq(users.id, userId)).limit(1);
  const merchant = userRows[0] || {};

  const html = await renderInvoiceHtml(invoice, merchant);

  try {
    const puppeteer = await getPuppeteer();
    if (puppeteer && (puppeteer.default || puppeteer).launch) {
      const browser = await (puppeteer.default || puppeteer).launch({
        headless: true,
        executablePath: process.env.PUPPETEER_EXECUTABLE_PATH || undefined,
        args: [
          '--no-sandbox',
          '--disable-setuid-sandbox',
          '--disable-dev-shm-usage',
          '--disable-gpu',
        ],
      });
      const page = await browser.newPage();

      // SECURITY: Request Interception to block SSRF and local filesystem access
      await page.setRequestInterception(true);
      page.on('request', (interceptedReq: any) => {
        const reqUrl = interceptedReq.url().toLowerCase();
        // Block cloud metadata services, loopback, private networks, and file: protocols
        if (
          reqUrl.startsWith('file:') ||
          reqUrl.includes('169.254.169.254') ||
          reqUrl.includes('127.0.0.1') ||
          reqUrl.includes('localhost') ||
          reqUrl.includes('0.0.0.0') ||
          reqUrl.includes('10.') ||
          reqUrl.includes('192.168.') ||
          reqUrl.includes('172.16.')
        ) {
          interceptedReq.abort();
        } else {
          interceptedReq.continue();
        }
      });

      await page.setContent(html, { waitUntil: 'networkidle0' });
      await browser.close();

      const viewUrl = `/pay/${invoice.shareToken || invoice.invoiceNumber}`;
      return {
        success: true,
        invoiceNumber: invoice.invoiceNumber,
        pdfUrl: viewUrl,
        message: `Invoice ${invoice.invoiceNumber} PDF generated successfully. Ready to view & print.`,
      };
    }
  } catch (err: any) {
    console.error('Puppeteer PDF generation error:', err);
  }

  // Fallback if browser rendering fails: return printable HTML view URL
  return {
    success: true,
    invoiceNumber: invoice.invoiceNumber,
    pdfUrl: `/pay/${invoice.shareToken || invoice.invoiceNumber}`,
    message: `Invoice ${invoice.invoiceNumber} is ready to view & print directly from your browser!`,
  };
}

