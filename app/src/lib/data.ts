import { supabase, checkConnection, formatSupabaseError } from './supabase-client';
import { Agent, DbDevice, Account, Client, EntityCounts } from '@/types';

/**
 * Fetch counts for all entities (agents, devices, accounts, clients)
 */
export async function getEntityCounts(): Promise<EntityCounts> {
  try {
    // Check connection
    const connectionStatus = await checkConnection();
    if (!connectionStatus.connected) {
      console.error('Connection check failed:', connectionStatus.error);
      return { agents: 0, devices: 0, accounts: 0, clients: 0 };
    }
    
    // Create parallel queries to get counts from each table
    const [agentsResult, devicesResult, accountsResult, clientsResult] = await Promise.all([
      supabase.from('agents').select('*', { count: 'exact', head: true }),
      supabase.from('devices').select('*', { count: 'exact', head: true }),
      supabase.from('accounts').select('*', { count: 'exact', head: true }),
      supabase.from('clients').select('*', { count: 'exact', head: true })
    ]);

    // Check for errors in any of the results
    if (agentsResult.error) console.error('Error counting agents:', agentsResult.error);
    if (devicesResult.error) console.error('Error counting devices:', devicesResult.error);
    if (accountsResult.error) console.error('Error counting accounts:', accountsResult.error);
    if (clientsResult.error) console.error('Error counting clients:', clientsResult.error);

    return {
      agents: agentsResult.error ? 0 : (agentsResult.count || 0),
      devices: devicesResult.error ? 0 : (devicesResult.count || 0),
      accounts: accountsResult.error ? 0 : (accountsResult.count || 0),
      clients: clientsResult.error ? 0 : (clientsResult.count || 0)
    };
  } catch (error) {
    console.error('Error fetching entity counts:', error);
    return { agents: 0, devices: 0, accounts: 0, clients: 0 };
  }
}

/**
 * Fetch all agents
 */
export async function getAgents(): Promise<Agent[]> {
  try {
    // First check if agents table exists and what columns it has
    const { data: columns, error: columnsError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
      
    if (columnsError) {
      console.error('Error checking agents table structure:', columnsError);
      throw formatSupabaseError(columnsError);
    }
    
    const orderColumn = columns && columns.length > 0 && 'agent_id' in columns[0] 
      ? 'agent_id' 
      : 'id';
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .order(orderColumn);

    if (error) {
      console.error('Supabase error fetching agents:', error);
      throw formatSupabaseError(error);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching agents:', error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch all devices
 */
export async function getDevices(): Promise<DbDevice[]> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .order('device_id');

    if (error) {
      console.error('Supabase error fetching devices:', error);
      throw formatSupabaseError(error);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching devices:', error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch all accounts
 */
export async function getAccounts(): Promise<Account[]> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .order('account_id');

    if (error) {
      console.error('Supabase error fetching accounts:', error);
      throw formatSupabaseError(error);
    }
    
    return data || [];
  } catch (error) {
    console.error('Error fetching accounts:', error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch all clients
 */
export async function getClients(): Promise<Client[]> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .order('client_id');

    if (error) {
      console.error('Supabase error fetching clients:', error);
      throw formatSupabaseError(error);
    }
    
    // Process data to handle jsonb external_emails field
    const processedData = (data || []).map(client => {
      // Ensure external_emails is always an array, even if null or undefined
      if (!client.external_emails) {
        client.external_emails = [];
      } else if (typeof client.external_emails === 'string') {
        // Try to parse JSON string to array
        try {
          client.external_emails = JSON.parse(client.external_emails);
        } catch (e) {
          client.external_emails = [client.external_emails];
        }
      }
      
      // Ensure view_goal is never null
      client.view_goal = client.view_goal || 0;
      
      return client;
    });
    
    return processedData;
  } catch (error) {
    console.error('Error fetching clients:', error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch a single agent by ID
 */
export async function getAgentById(agentId: number): Promise<Agent | null> {
  try {
    // First check if agents table exists and what columns it has
    const { data: columns, error: columnsError } = await supabase
      .from('agents')
      .select('*')
      .limit(1);
      
    if (columnsError) {
      console.error('Error checking agents table structure:', columnsError);
      throw formatSupabaseError(columnsError);
    }
    
    const idColumn = columns && columns.length > 0 && 'agent_id' in columns[0] 
      ? 'agent_id' 
      : 'id';
    
    const { data, error } = await supabase
      .from('agents')
      .select('*')
      .eq(idColumn, agentId)
      .single();

    if (error) {
      console.error(`Error fetching agent with ID ${agentId}:`, error);
      throw formatSupabaseError(error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching agent with ID ${agentId}:`, error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch a single device by ID
 */
export async function getDeviceById(deviceId: string): Promise<DbDevice | null> {
  try {
    const { data, error } = await supabase
      .from('devices')
      .select('*')
      .eq('device_id', deviceId)
      .single();

    if (error) {
      console.error(`Error fetching device with ID ${deviceId}:`, error);
      throw formatSupabaseError(error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching device with ID ${deviceId}:`, error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch a single account by ID
 */
export async function getAccountById(accountId: string): Promise<Account | null> {
  try {
    const { data, error } = await supabase
      .from('accounts')
      .select('*')
      .eq('account_id', accountId)
      .single();

    if (error) {
      console.error(`Error fetching account with ID ${accountId}:`, error);
      throw formatSupabaseError(error);
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching account with ID ${accountId}:`, error);
    throw formatSupabaseError(error);
  }
}

/**
 * Fetch a single client by ID
 */
export async function getClientById(clientId: number): Promise<Client | null> {
  try {
    const { data, error } = await supabase
      .from('clients')
      .select('*')
      .eq('client_id', clientId)
      .single();

    if (error) {
      console.error(`Error fetching client with ID ${clientId}:`, error);
      throw formatSupabaseError(error);
    }
    
    // Process data for external_emails and view_goal
    if (data) {
      if (!data.external_emails) {
        data.external_emails = [];
      } else if (typeof data.external_emails === 'string') {
        try {
          data.external_emails = JSON.parse(data.external_emails);
        } catch (e) {
          data.external_emails = [data.external_emails];
        }
      }
      
      data.view_goal = data.view_goal || 0;
    }
    
    return data;
  } catch (error) {
    console.error(`Error fetching client with ID ${clientId}:`, error);
    throw formatSupabaseError(error);
  }
} 