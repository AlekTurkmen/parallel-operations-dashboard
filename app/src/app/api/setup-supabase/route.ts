import { NextResponse } from 'next/server';
import { createClient } from '@supabase/supabase-js';

// Use service role key to bypass RLS
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_PROJECT_URL || 
                   'https://fhnrrxlyxllbnxhjzaqq.supabase.co';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 
                          process.env.SUPABSE_SERVICE_ROLE_KEY || 
                          '';

// Create a supabase client with the service key
const supabaseAdmin = createClient(supabaseUrl, supabaseServiceKey);

export async function GET() {
  try {
    const results = [];
    
    // 1. Create Tables via SQL - using service role to bypass RLS
    const SQL = `
    -- Enable needed extensions
    CREATE EXTENSION IF NOT EXISTS moddatetime;

    -- Create Agents table
    CREATE TABLE IF NOT EXISTS agents (
      agent_id INT2 PRIMARY KEY,
      ip_address TEXT,
      type TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create Devices table
    CREATE TABLE IF NOT EXISTS devices (
      device_id TEXT PRIMARY KEY,
      agent_id INT2 REFERENCES agents(agent_id) ON DELETE CASCADE,
      model_type TEXT,
      serial_number TEXT,
      phone_number TEXT,
      mobile_carrier TEXT,
      imei TEXT,
      airdroid_id TEXT,
      status TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create Clients table
    CREATE TABLE IF NOT EXISTS clients (
      client_id INT4 PRIMARY KEY,
      name TEXT,
      qwilr TEXT,
      domain TEXT,
      product_description TEXT,
      contract_type TEXT,
      external_emails JSONB,
      active BOOLEAN DEFAULT TRUE,
      view_goal INT8,
      billing_date TEXT,
      billing_net_days TEXT,
      billing_retainer TEXT,
      billing_cpm TEXT,
      billing_max TEXT,
      roi TEXT,
      sentiment TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    );

    -- Create Accounts table
    CREATE TABLE IF NOT EXISTS accounts (
      account_id UUID PRIMARY KEY DEFAULT gen_random_uuid(),
      device_id TEXT REFERENCES devices(device_id),
      client_id INT4 REFERENCES clients(client_id) ON DELETE SET NULL,
      username TEXT,
      email TEXT,
      password TEXT,
      dob DATE,
      platform TEXT,
      status TEXT,
      last_updated TIMESTAMPTZ DEFAULT NOW()
    );
    
    -- Disable RLS on all tables for development
    ALTER TABLE agents SECURITY DEFINER;
    ALTER TABLE devices SECURITY DEFINER;
    ALTER TABLE clients SECURITY DEFINER;
    ALTER TABLE accounts SECURITY DEFINER;
    `;
    
    // Use SQL execute
    const { data, error: sqlError } = await supabaseAdmin.rpc('pgexec', { sql: SQL });
    
    results.push({
      statement: 'Create database schema',
      success: !sqlError,
      error: sqlError ? sqlError.message : null
    });
    
    // 2. Set up sample data
    // Insert sample agents
    const { error: agentsError } = await supabaseAdmin
      .from('agents')
      .upsert([
        { agent_id: 1, ip_address: '192.168.1.1', type: 'usb-bridge' },
        { agent_id: 2, ip_address: '192.168.1.2', type: 'usb-bridge' }
      ]);
      
    results.push({
      statement: 'Insert sample agents',
      success: !agentsError,
      error: agentsError ? agentsError.message : null
    });
    
    // Insert sample clients
    const { error: clientsError } = await supabaseAdmin
      .from('clients')
      .upsert([
        { 
          client_id: 1, 
          name: 'Sample Client', 
          domain: 'sampleclient.com', 
          active: true, 
          external_emails: ['contact@sampleclient.com']
        }
      ]);
      
    results.push({
      statement: 'Insert sample clients',
      success: !clientsError,
      error: clientsError ? clientsError.message : null
    });
    
    // Insert sample devices
    const { error: devicesError } = await supabaseAdmin
      .from('devices')
      .upsert([
        {
          device_id: 'SAMPLE-001',
          agent_id: 1,
          model_type: 'Sample Model',
          serial_number: 'SN12345',
          phone_number: '555-123-4567',
          mobile_carrier: 'Sample Carrier',
          status: 'active'
        }
      ]);
      
    results.push({
      statement: 'Insert sample devices',
      success: !devicesError,
      error: devicesError ? devicesError.message : null
    });
    
    // Insert sample accounts
    const { error: accountsError } = await supabaseAdmin
      .from('accounts')
      .upsert([
        {
          device_id: 'SAMPLE-001',
          client_id: 1,
          username: 'sample_user',
          email: 'sample@example.com',
          password: 'samplepassword',
          platform: 'tiktok',
          status: 'active',
          dob: '2000-01-01'
        }
      ]);
      
    results.push({
      statement: 'Insert sample accounts',
      success: !accountsError,
      error: accountsError ? accountsError.message : null
    });
    
    return NextResponse.json({ 
      success: results.filter(r => r.success).length > 0,
      results 
    });
    
  } catch (error) {
    console.error('Error setting up Supabase:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error) 
    }, { status: 500 });
  }
} 