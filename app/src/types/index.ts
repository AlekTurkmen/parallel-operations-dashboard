// Define common types for all Supabase entities
export interface BaseEntity {
  "last_updated": string;
}

// Entity type for dashboard tabs
export type EntityType = "agents" | "devices" | "accounts" | "clients";

// Agent entity based on the schema
export interface Agent extends BaseEntity {
  "agent_id": number;
  "ip_address": string;
  type: string;
}

// Device entity based on the schema (separate from existing Device interface)
export interface DbDevice extends BaseEntity {
  "device_id": string;
  "agent_id": number;
  "model_type": string;
  "serial_number": string;
  "phone_number": string;
  "mobile_carrier": string;
  imei: string;
  "airdroid_id": string;
  status: string;
}

// Client entity based on the schema
export interface Client extends BaseEntity {
  "client_id": number;
  name: string;
  qwilr: string;
  domain: string;
  "product_description": string;
  "contract_type": string;
  external_emails: any; // jsonb
  active: boolean;
  "view_goal": number;
  "billing_date": string;
  "billing_net_days": string;
  "billing_retainer": string;
  "billing_cpm": string;
  "billing_max": string;
  roi: string;
  sentiment: string;
  color: string; // Hex code without the # for client color
}

// Account entity based on the schema
export interface Account extends BaseEntity {
  "account_id": string;
  "device_id": string;
  "client_id": number;
  username: string;
  email: string;
  password: string;
  dob: string;
  platform: string;
  status: string;
}

// Entity counts for dashboard
export interface EntityCounts {
  agents: number;
  devices: number;
  accounts: number;
  clients: number;
} 