import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

// SQL statements from our schema file
const schemaSQL = `
-- Enable needed extensions
CREATE EXTENSION IF NOT EXISTS moddatetime;

-- Agents table
CREATE TABLE IF NOT EXISTS agents (
  agent_id INT2 PRIMARY KEY,
  ip_address TEXT,
  type TEXT,
  last_updated TIMESTAMPTZ DEFAULT NOW()
);

-- Devices table
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

-- Clients table
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

-- Accounts table
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

-- Set up triggers for last_updated columns
CREATE OR REPLACE TRIGGER set_agents_last_updated
BEFORE UPDATE ON agents
FOR EACH ROW EXECUTE PROCEDURE moddatetime('last_updated');

CREATE OR REPLACE TRIGGER set_devices_last_updated
BEFORE UPDATE ON devices
FOR EACH ROW EXECUTE PROCEDURE moddatetime('last_updated');

CREATE OR REPLACE TRIGGER set_clients_last_updated
BEFORE UPDATE ON clients
FOR EACH ROW EXECUTE PROCEDURE moddatetime('last_updated');

CREATE OR REPLACE TRIGGER set_accounts_last_updated
BEFORE UPDATE ON accounts
FOR EACH ROW EXECUTE PROCEDURE moddatetime('last_updated');
`;

// Sample data to initialize
const sampleData = {
  agents: [
    { agent_id: 1, ip_address: '192.168.1.1', type: 'usb-bridge' },
    { agent_id: 2, ip_address: '192.168.1.2', type: 'usb-bridge' }
  ],
  clients: [
    { client_id: 1, name: 'Sample Client', domain: 'sampleclient.com', active: true, external_emails: JSON.stringify(['contact@sampleclient.com']) }
  ]
};

export async function GET() {
  try {
    const results = [];
    
    // Step 1: Create Agents table
    const { error: agentsError } = await supabase
      .from('agents')
      .insert([
        { agent_id: 1, ip_address: '192.168.1.1', type: 'usb-bridge' },
        { agent_id: 2, ip_address: '192.168.1.2', type: 'usb-bridge' }
      ])
      .select();
      
    results.push({
      statement: 'Create agents table and insert data',
      success: !agentsError,
      error: agentsError ? agentsError.message : null
    });
    
    // Step 2: Create Clients table
    const { error: clientsError } = await supabase
      .from('clients')
      .insert([
        { 
          client_id: 1, 
          name: 'Sample Client', 
          domain: 'sampleclient.com', 
          active: true, 
          external_emails: ['contact@sampleclient.com']
        }
      ])
      .select();
      
    results.push({
      statement: 'Create clients table and insert data',
      success: !clientsError,
      error: clientsError ? clientsError.message : null
    });
    
    // Step 3: Create Devices table (depends on agents)
    const { error: devicesError } = await supabase
      .from('devices')
      .insert([
        {
          device_id: 'SAMPLE-001',
          agent_id: 1,
          model_type: 'Sample Model',
          serial_number: 'SN12345',
          phone_number: '555-123-4567',
          mobile_carrier: 'Sample Carrier',
          status: 'active'
        }
      ])
      .select();
      
    results.push({
      statement: 'Create devices table and insert data',
      success: !devicesError,
      error: devicesError ? devicesError.message : null
    });
    
    // Step 4: Create Accounts table (depends on devices and clients)
    const { error: accountsError } = await supabase
      .from('accounts')
      .insert([
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
      ])
      .select();
      
    results.push({
      statement: 'Create accounts table and insert data',
      success: !accountsError,
      error: accountsError ? accountsError.message : null
    });
    
    return NextResponse.json({ 
      success: results.filter(r => r.success).length > 0,
      results 
    });
  } catch (error) {
    console.error('Error setting up database:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 