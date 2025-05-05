# Overview.md

> Purpose
> 
> 
> This document gives engineers or AI agents the full context they need to build, test, and maintain application code that performs **CRUD** (Create‑Read‑Update‑Delete) operations against our Supabase‑hosted PostgreSQL database. Keep this file at the root of the repository so generators and humans can reference the same single source of truth.
> 

---

## 1. High‑level System Picture

| Entity | Cardinality | Core purpose |
| --- | --- | --- |
| `agents` | ~15 | Physical Mac hosts controlling phone banks. |
| `devices` | ~425 | Individual phones/emulators that post on social. |
| `accounts` | ~3 302 | Social‑media handles running on a device for a client. |
| `clients` | ~31 | Paying brands / advertisers. |

The tables are **highly normalized**; no duplicate business data should live outside its home entity. All operational writes therefore cascade through foreign‑key relations so referential integrity is guaranteed at the database layer.

---

## 2. Connection & Environment

| Variable | Description |
| --- | --- |
| `SUPABASE_URL` | Project REST endpoint - [https://fhnrrxlyxllbnxhjzaqq.supabase.co](https://fhnrrxlyxllbnxhjzaqq.supabase.co/) Found in .env file |
| `SUPABASE_ANON_KEY` | Public client key for front‑end read/write via RLS. Found in .env file |
| `SUPABASE_SERVICE_KEY` | *Backend‑only* key that bypasses RLS – **never** ship to browsers. Found in .env file |

### Client libraries

- **TypeScript/JavaScript** → [`@supabase/supabase-js`](https://supabase.com/docs/reference/javascript)
- **Python** → [`supabase-py`](https://supabase.com/docs/reference/python)

> 💡 Sample instantiation (TS):
> 
> 
> ```
> import { createClient } from '@supabase/supabase-js';
> export const supabase = createClient(process.env.SUPABASE_URL!, process.env.SUPABASE_ANON_KEY!);
> 
> ```
> 

---

## 3. Schema Cheat‑Sheet

### 3.1 `agents`

| column | type | constraints |
| --- | --- | --- |
| `agent_id` | `int2` | **PK** |
| `ip_address` | `text` |  |
| `type` | `text` | e.g. usb-bridge, unassigned |
| `last_updated` | `timestamptz` | auto‑maintained trigger |

### 3.2 `devices`

| column | type | constraints |
| --- | --- | --- |
| `device_id` | `text` | **PK** |
| `agent_id` | `int2` | **FK → agents.agent_id** (`ON DELETE CASCADE`) |
| `model_type`  | `text` |  |
| serial-number | text |  |
| phone-number | text |  |
| mobile-carrier | text | T-Mobile, Verizon, AT&T |
| imei | text | ex: b9b626f00c6d4a1015d013197c9e5107 |
| airdroid-id | text |  |
| `status` | `text` | active / retired / repair |
| `last_updated` | `timestamptz` | auto‑maintained trigger |

### 3.3 `clients`

| column | type | notes |
| --- | --- | --- |
| `client_id` | `int4` | **PK** |
| `name` | `text` | Brand display name |
| qwilr | text | url for qwilr agreement |
| domain | text | url for domain |
| product_description | text |  |
| contract_type | text | Retainer or CPM |
| `external_emails` | `jsonb` | misc contacts |
| `active` | `boolean` | TRUE or FALSE |
| view_goal | int8 |  |
| billing_date | text |  |
| billing_net_days | text |  |
| billing_retainer | text |  |
| billing_cpm | text |  |
| billing_max | text |  |
| roi | text |  |
| sentiment | text |  |
| `last_updated` | `timestamptz` | auto‑maintained trigger |

### 3.4 `accounts`

| column | type | constraints |
| --- | --- | --- |
| `account_id` | `uuid` | **PK** – default `gen_random_uuid()` |
| `device_id` | `text` | **FK → devices.device_id** |
| `client_id` | `int4` | **FK → clients.client_id** (`ON DELETE SET NULL`) |
| username | text |  |
| email | text |  |
| password | text |  |
| `dob` | `date` | user DOB |
| platform | text | tiktok, youtube, X-twitter |
| status | text | Idle, Does Not Exist, Manual Posting, etc. |
| `last_updated` | `timestamptz` | auto‑maintained trigger |

---

## 4. Database Automation

### 4.1 `last_updated` trigger

We enabled the extension and attached it to every table (agents, devices, accounts, and clients)

```sql
create extension if not exists moddatetime;
create or replace trigger set_last_updated
before update on <table_name>
for each row execute procedure moddatetime('last_updated');

```

This fires on **all UPDATEs**, including REST / RPC / Edge Function calls.

### 4.2 Row‑Level Security (RLS)

All tables have RLS **enabled but no policies defined** by default → queries require an explicit policy or a Service Role key. Common patterns:

- Back‑end services (Edge Functions) run with `SUPABASE_SERVICE_KEY` → unrestricted.
- Front‑end reads need a `SELECT` policy per table scoped by `auth.uid()` or role.

---

## 5. CRUD Patterns

### 5.1 Insert new account

```
const { data, error } = await supabase
  .from('accounts')
  .insert({
    device_id: 'iphonex‑abc123',
    client_id: 17,
    username: 'brand_handle_42',
    email: 'foo@example.com',
    platform: 'tiktok',
    status: 'active',
    dob: '2000-05-02'
  })
  .select();   // returns row incl. auto‑generated account_id

```

### 5.2 Soft‑delete a device (mark inactive)

```
await supabase.from('devices')
  .update({ status: 'retired' })
  .eq('device_id', 'iphonex‑abc123');

```

Trigger automatically updates `last_updated`.

### 5.3 Cascading behaviour

- **Delete agent** → all dependent devices auto‑delete (`ON DELETE CASCADE`) → their accounts orphan → you may run periodic cleanup or use database rules.

---

## 6. Suggested Project Layout

```
/overview.md        ← you are here
/.env               ← Supabase env vars (do not commit)
/src/
  db/
    supabaseClient.ts
    accounts.ts      ← CRUD helpers per table
    devices.ts
    agents.ts
    clients.ts
  api/
    accounts/
      create.ts
      list.ts
      update.ts
    …
/tests/

```

> Keep all DB‑specific code inside src/db so swapping data layers remains possible.
> 

---

## 7. To‑Dos

- [ ]  Connect existing Next js app UI (frontend) with the supabase database (backend)
- [ ]  Create CRUD operations that frontend can make to backend data

---

## 8. Quick SQL Reference

```sql
-- Example: list active TikTok accounts for a client
select a.*
from accounts a
join clients c on c.client_id = a.client_id
where c.name = 'ACME Co.'
  and a.platform = 'tiktok'
  and a.status = 'active';

```