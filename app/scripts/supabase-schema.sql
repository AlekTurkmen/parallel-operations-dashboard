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