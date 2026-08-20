import { db, createPool } from './index.ts';
import { sql } from 'drizzle-orm';

export async function initializeDatabase() {
  const pool = createPool();
  
  try {
    // Create users table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS users (
        id SERIAL PRIMARY KEY,
        uid TEXT NOT NULL UNIQUE,
        email TEXT NOT NULL,
        role TEXT NOT NULL DEFAULT 'subscriber',
        business_name TEXT DEFAULT 'My Business',
        phone TEXT DEFAULT '',
        upi_id TEXT DEFAULT '',
        gstin TEXT DEFAULT '',
        address TEXT DEFAULT '',
        industry_type TEXT DEFAULT 'transport',
        subscription_plan TEXT DEFAULT 'pro_499',
        subscription_status TEXT DEFAULT 'active',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all columns exist and match schema
    await pool.query(`
      ALTER TABLE users ADD COLUMN IF NOT EXISTS business_name TEXT DEFAULT 'My Business';
      DO $$
      BEGIN
        IF EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name = 'users' AND column_name = 'businessname') THEN
          UPDATE users SET business_name = businessname WHERE business_name IS NULL OR business_name = 'My Business';
        END IF;
      END $$;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS role TEXT NOT NULL DEFAULT 'subscriber';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS trial_ends_at TIMESTAMP;
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_name TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_account_no TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS bank_ifsc TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_provider TEXT DEFAULT 'meta';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_phone_number_id TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS whatsapp_api_token TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS logo_url TEXT DEFAULT '';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS invoice_template TEXT DEFAULT 'modern';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS brand_color TEXT DEFAULT '#4f46e5';
      ALTER TABLE users ADD COLUMN IF NOT EXISTS custom_footer TEXT DEFAULT '';
    `);



    // Assign superadmin role to arai.343531@gmail.com
    await pool.query(`
      UPDATE users SET role = 'superadmin' WHERE LOWER(email) = 'arai.343531@gmail.com';
    `);



    // Create clients table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS clients (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        name TEXT NOT NULL,
        phone TEXT NOT NULL,
        email TEXT DEFAULT '',
        company_name TEXT DEFAULT '',
        address TEXT DEFAULT '',
        gstin TEXT DEFAULT '',
        industry_type TEXT DEFAULT 'general',
        payment_term_days INTEGER DEFAULT 7,
        notes TEXT DEFAULT '',
        is_active BOOLEAN NOT NULL DEFAULT true,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
      ALTER TABLE clients ADD COLUMN IF NOT EXISTS is_active BOOLEAN NOT NULL DEFAULT true;
    `);

    // Create invoices table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS invoices (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        invoice_number TEXT NOT NULL,
        issue_date TEXT NOT NULL,
        due_date TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'pending',
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        tax_rate NUMERIC(5, 2) DEFAULT '18.00',
        tax_amount NUMERIC(12, 2) DEFAULT '0.00',
        tds_rate NUMERIC(5, 2) DEFAULT '0.00',
        tds_amount NUMERIC(12, 2) DEFAULT '0.00',
        discount_amount NUMERIC(12, 2) DEFAULT '0.00',
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        paid_amount NUMERIC(12, 2) DEFAULT '0.00',
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        industry_details JSONB DEFAULT '{}'::jsonb,
        notes TEXT DEFAULT 'Thank you for your business! Please settle the dues promptly via UPI or bank transfer.',
        terms TEXT DEFAULT 'Payment is due within the stipulated days. Interest of 2%/month applicable on late payments.',
        reminder_sent_count INTEGER DEFAULT 0,
        last_reminder_sent_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Ensure all invoice columns exist for GST compliance and security isolation
    await pool.query(`
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS place_of_supply TEXT DEFAULT '';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_rcm BOOLEAN DEFAULT false;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS tax_type TEXT DEFAULT 'intra_state';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS share_token TEXT DEFAULT '';
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS is_cancelled BOOLEAN DEFAULT false;
      ALTER TABLE invoices ADD COLUMN IF NOT EXISTS cancel_reason TEXT DEFAULT '';
    `);

    // Create payments table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS payments (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        amount NUMERIC(12, 2) NOT NULL,
        payment_date TEXT NOT NULL,
        payment_method TEXT NOT NULL DEFAULT 'upi',
        reference_number TEXT DEFAULT '',
        notes TEXT DEFAULT '',
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Create reminder_logs table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS reminder_logs (
        id SERIAL PRIMARY KEY,
        user_id INTEGER NOT NULL REFERENCES users(id) ON DELETE CASCADE,
        invoice_id INTEGER NOT NULL REFERENCES invoices(id) ON DELETE CASCADE,
        client_id INTEGER NOT NULL REFERENCES clients(id) ON DELETE CASCADE,
        channel TEXT NOT NULL DEFAULT 'whatsapp',
        template_type TEXT NOT NULL DEFAULT 'standard',
        message_content TEXT NOT NULL,
        recipient_phone TEXT NOT NULL,
        status TEXT NOT NULL DEFAULT 'sent',
        sent_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 6. Subscription Plan Requests Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS plan_requests (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        business_name TEXT NOT NULL,
        contact_person TEXT NOT NULL,
        email TEXT NOT NULL,
        phone TEXT NOT NULL,
        industry_type TEXT DEFAULT 'transport' NOT NULL,
        requested_plan TEXT NOT NULL,
        business_needs TEXT DEFAULT '',
        status TEXT DEFAULT 'pending' NOT NULL,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 7. Recurring Invoices & Auto-Billing Table
    await pool.query(`
      CREATE TABLE IF NOT EXISTS recurring_profiles (
        id SERIAL PRIMARY KEY,
        user_id INTEGER REFERENCES users(id) ON DELETE CASCADE NOT NULL,
        client_id INTEGER REFERENCES clients(id) ON DELETE CASCADE NOT NULL,
        title TEXT NOT NULL DEFAULT 'Recurring Retainer Billing',
        frequency TEXT NOT NULL DEFAULT 'monthly',
        interval INTEGER NOT NULL DEFAULT 1,
        start_date TEXT NOT NULL,
        next_run_date TEXT NOT NULL,
        end_date TEXT,
        is_active BOOLEAN NOT NULL DEFAULT true,
        auto_send_whatsapp BOOLEAN NOT NULL DEFAULT true,
        currency TEXT NOT NULL DEFAULT 'INR',
        subtotal NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        tax_rate NUMERIC(5, 2) DEFAULT '18.00',
        tax_amount NUMERIC(12, 2) DEFAULT '0.00',
        tds_rate NUMERIC(5, 2) DEFAULT '0.00',
        tds_amount NUMERIC(12, 2) DEFAULT '0.00',
        discount_amount NUMERIC(12, 2) DEFAULT '0.00',
        total_amount NUMERIC(12, 2) NOT NULL DEFAULT '0.00',
        items JSONB NOT NULL DEFAULT '[]'::jsonb,
        industry_details JSONB DEFAULT '{}'::jsonb,
        notes TEXT DEFAULT 'Automated recurring invoice. Thank you for your continued business!',
        terms TEXT DEFAULT 'Payment is due within 7 days of invoice generation.',
        generated_count INTEGER NOT NULL DEFAULT 0,
        last_generated_at TIMESTAMP,
        created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
        updated_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // 8. Performance Indexes for Enterprise Scale
    await pool.query(`
      CREATE INDEX IF NOT EXISTS idx_invoices_user_id ON invoices(user_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_client_id ON invoices(client_id);
      CREATE INDEX IF NOT EXISTS idx_invoices_status ON invoices(status);
      CREATE INDEX IF NOT EXISTS idx_invoices_share_token ON invoices(share_token);
      CREATE INDEX IF NOT EXISTS idx_invoices_created_at ON invoices(created_at DESC);
      CREATE INDEX IF NOT EXISTS idx_clients_user_id ON clients(user_id);
      CREATE INDEX IF NOT EXISTS idx_payments_invoice_id ON payments(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_payments_user_id ON payments(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminder_logs_user_id ON reminder_logs(user_id);
      CREATE INDEX IF NOT EXISTS idx_reminder_logs_invoice_id ON reminder_logs(invoice_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_profiles_user_id ON recurring_profiles(user_id);
      CREATE INDEX IF NOT EXISTS idx_recurring_profiles_next_run ON recurring_profiles(next_run_date, is_active);
    `);

    console.log('Database tables & performance indexes verified / initialized successfully.');
  } catch (err) {
    console.error('Error initializing database tables:', err);
  }
}

