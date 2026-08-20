import { describe, it, expect } from 'vitest';
import { sendAdminPlanRequestNotification } from '../services/email.service.ts';

describe('Admin Email Notification Service', () => {
  it('handles plan request notification gracefully even when SMTP is not configured', async () => {
    const result = await sendAdminPlanRequestNotification({
      businessName: 'Test Transport Fleet',
      contactPerson: 'Ravi Kumar',
      email: 'ravi@testfleet.com',
      phone: '+91 9876543210',
      industryType: 'transport',
      requestedPlan: 'pro_499',
      businessNeeds: 'Need automated WhatsApp reminders for 50 clients daily',
    });

    // In local/test environment without active SMTP credentials, it logs cleanly and returns false without throwing
    expect(typeof result).toBe('boolean');
  });
});
