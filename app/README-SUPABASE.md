# Supabase Integration Guide

This guide provides instructions for setting up and using the Supabase integration with the Operations UI.

## Prerequisites

1. A Supabase account with a project created
2. The Supabase URL and API keys

## Setup

1. Create a `.env.local` file in the root of the app directory with the following content:

```
NEXT_PUBLIC_SUPABASE_URL=https://fhnrrxlyxllbnxhjzaqq.supabase.co
NEXT_PUBLIC_SUPABASE_ANON_KEY=<your-anon-key>
SUPABASE_SERVICE_KEY=<your-service-key>
```

Replace `<your-anon-key>` and `<your-service-key>` with your actual Supabase API keys.

2. Set up the database schema in Supabase:

Create the following tables with their respective columns:

### `agents` table

- `agent_id` (int2, Primary Key)
- `ip_address` (text)
- `type` (text)
- `last_updated` (timestamptz)

### `devices` table

- `device_id` (text, Primary Key)
- `agent_id` (int2, Foreign Key -> agents.agent_id)
- `model_type` (text)
- `serial_number` (text)
- `phone_number` (text)
- `mobile_carrier` (text)
- `imei` (text)
- `airdroid_id` (text)
- `status` (text)
- `last_updated` (timestamptz)

### `clients` table

- `client_id` (int4, Primary Key)
- `name` (text)
- `domain` (text)
- `external_emails` (jsonb)
- `active` (boolean)
- `last_updated` (timestamptz)

### `accounts` table

- `account_id` (uuid, Primary Key, default: gen_random_uuid())
- `device_id` (text, Foreign Key -> devices.device_id)
- `client_id` (int4, Foreign Key -> clients.client_id)
- `username` (text)
- `email` (text)
- `password` (text)
- `dob` (date)
- `platform` (text)
- `status` (text)
- `last_updated` (timestamptz)

3. Set up the `last_updated` trigger for each table:

```sql
create extension if not exists moddatetime;

create or replace trigger set_last_updated
before update on agents
for each row execute procedure moddatetime('last_updated');

-- Repeat for devices, clients, and accounts tables
```

## Initializing Sample Data

If you have an existing CSV file with data, you can use the initialization script to create sample data in Supabase:

1. Make sure you have `ts-node` installed:

```bash
npm install -g ts-node typescript
```

2. Place your CSV file at `public/devices.csv`

3. Run the initialization script:

```bash
SUPABASE_SERVICE_KEY=<your-service-key> NEXT_PUBLIC_SUPABASE_URL=<your-supabase-url> npx ts-node scripts/init-supabase-data.ts
```

## Development

The application now uses Supabase as the data source instead of CSV files. The operations are handled through the following files:

- `src/lib/supabase-client.ts`: Initializes the Supabase client
- `src/lib/supabase-operations.ts`: Contains CRUD operations for devices and accounts

## API Routes

- The previous CSV-updating API endpoint has been replaced with a stub that can be extended for more complex operations.
- Direct database interactions happen through the Supabase client in the browser. 