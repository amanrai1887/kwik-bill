import nodemailer from 'nodemailer';
import { config } from '../config/app.config.ts';

export interface PlanRequestEmailData {
  businessName: string;
  contactPerson: string;
  email: string;
  phone: string;
  industryType: string;
  requestedPlan: string;
  businessNeeds?: string;
  userId?: number;
}

let transporter: nodemailer.Transporter | null = null;

function getEmailTransporter() {
  if (transporter) return transporter;

  const smtpHost = process.env.SMTP_HOST || process.env.EMAIL_HOST;
  const smtpPort = Number(process.env.SMTP_PORT || process.env.EMAIL_PORT) || 587;
  const smtpUser = process.env.SMTP_USER || process.env.EMAIL_USER || process.env.GMAIL_USER;
  const smtpPass = process.env.SMTP_PASS || process.env.EMAIL_PASS || process.env.GMAIL_PASS || process.env.GMAIL_APP_PASSWORD;

  if (smtpHost && smtpUser && smtpPass) {
    transporter = nodemailer.createTransport({
      host: smtpHost,
      port: smtpPort,
      secure: smtpPort === 465,
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return transporter;
  }

  // Gmail direct service fallback if user provided Gmail credentials
  if (smtpUser && smtpPass && (smtpUser.includes('@gmail.com') || process.env.EMAIL_SERVICE === 'gmail')) {
    transporter = nodemailer.createTransport({
      service: 'gmail',
      auth: {
        user: smtpUser,
        pass: smtpPass,
      },
    });
    return transporter;
  }

  return null;
}

export async function sendAdminPlanRequestNotification(data: PlanRequestEmailData): Promise<boolean> {
  const adminEmail = config.superAdminEmails[0] || 'arai.343531@gmail.com';
  const planLabel =
    data.requestedPlan === 'pro_499'
      ? 'Pro Growth Plan (₹499/mo)'
      : data.requestedPlan === 'starter_299'
      ? 'Starter Plan (₹299/mo)'
      : '15-Day Free Trial (₹0)';

  const subject = `🔔 [Kwik-Bill] New Subscription Request: ${data.businessName} (${planLabel})`;

  const htmlContent = `
    <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto; padding: 20px; border: 1px solid #e2e8f0; rounded: 12px; background-color: #ffffff;">
      <div style="background-color: #4f46e5; color: #ffffff; padding: 16px 20px; border-radius: 8px; margin-bottom: 20px;">
        <h2 style="margin: 0; font-size: 20px;">New Subscription & Onboarding Request</h2>
        <p style="margin: 4px 0 0 0; font-size: 13px; opacity: 0.9;">Kwik-Bill SaaS Management Console</p>
      </div>

      <p style="font-size: 14px; color: #334155; line-height: 1.5;">
        A new company has requested to subscribe to <strong>${planLabel}</strong>. Below are their requirement details:
      </p>

      <table style="width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 13px;">
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b; width: 40%;">Company / Trade Name:</td>
          <td style="padding: 10px 0; color: #0f172a; font-weight: bold;">${data.businessName}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Contact Person:</td>
          <td style="padding: 10px 0; color: #0f172a;">${data.contactPerson}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">WhatsApp Mobile:</td>
          <td style="padding: 10px 0; color: #0f172a; font-family: monospace; font-weight: bold;">${data.phone}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Email Address:</td>
          <td style="padding: 10px 0; color: #0f172a;">${data.email}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Industry Segment:</td>
          <td style="padding: 10px 0; color: #0f172a; text-transform: capitalize;">${data.industryType}</td>
        </tr>
        <tr style="border-bottom: 1px solid #f1f5f9;">
          <td style="padding: 10px 0; font-weight: bold; color: #64748b;">Requested Plan:</td>
          <td style="padding: 10px 0; color: #4f46e5; font-weight: bold;">${planLabel}</td>
        </tr>
        ${
          data.businessNeeds
            ? `<tr>
                <td style="padding: 10px 0; font-weight: bold; color: #64748b; vertical-align: top;">Business Needs:</td>
                <td style="padding: 10px 0; color: #0f172a; background: #f8fafc; padding: 10px; border-radius: 6px;">${data.businessNeeds}</td>
              </tr>`
            : ''
        }
      </table>

      <div style="background-color: #f8fafc; border-left: 4px solid #4f46e5; padding: 12px 16px; margin: 20px 0; font-size: 13px; color: #334155;">
        <strong>Next Steps:</strong> Log in to your SuperAdmin Master Console to review, provision, or approve this company's subscription.
      </div>

      <div style="font-size: 11px; color: #94a3b8; text-align: center; border-top: 1px solid #f1f5f9; padding-top: 16px; margin-top: 24px;">
        Kwik-Bill SaaS • Automated Lead & Subscription Notification Engine
      </div>
    </div>
  `;

  const mailTransporter = getEmailTransporter();

  if (mailTransporter) {
    try {
      const fromAddress = process.env.EMAIL_FROM || process.env.SMTP_FROM || `"Kwik-Bill Subscriptions" <${process.env.SMTP_USER || 'notifications@kwikbill.com'}>`;
      await mailTransporter.sendMail({
        from: fromAddress,
        to: adminEmail,
        subject,
        html: htmlContent,
      });
      console.log(`[Email Service] Subscription request notification successfully sent to Admin (${adminEmail})`);
      return true;
    } catch (err) {
      console.error('[Email Service] Failed to send email via SMTP:', err);
    }
  } else {
    console.log(`[Email Service - Notification Logged]`);
    console.log(`To: ${adminEmail}`);
    console.log(`Subject: ${subject}`);
    console.log(`Company: ${data.businessName} | Contact: ${data.contactPerson} | Phone: ${data.phone} | Plan: ${data.requestedPlan}`);
  }

  return false;
}
