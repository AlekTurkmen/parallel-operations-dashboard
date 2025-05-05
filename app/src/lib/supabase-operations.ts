import { supabase } from './supabase-client';
import { Device } from '@/types/device';

// Load all devices from the database
export async function loadDevicesData(): Promise<Device[]> {
  try {
    console.log("Attempting to connect to Supabase");
    console.log("==== SUPABASE DEBUG ====");
    
    // Try a simplified query first to test permissions
    const { data: deviceCount, count, error: countError } = await supabase
      .from('devices')
      .select('*', { count: 'exact', head: true });
      
    if (countError) {
      console.error("Permission error or connection issue:", countError);
      throw countError;
    }
    
    console.log("Connection successful, found", count || 0, "devices");
    
    // Get devices data - use all columns with * to avoid naming issues
    const { data: devices, error: devicesError } = await supabase
      .from('devices')
      .select('*');

    if (devicesError) {
      console.error("Error fetching devices:", devicesError);
      throw devicesError;
    }
    
    console.log("Devices fetched successfully:", devices?.length || 0, "devices found");
    console.log("Sample device:", devices && devices.length > 0 ? JSON.stringify(devices[0], null, 2) : "No devices");
    
    // It might be that there are no devices yet but the connection is working
    // Return an empty array if no devices were found
    if (!devices || devices.length === 0) {
      console.log("No devices found in the database");
      return [];
    }
    
    // Get accounts data - use all columns
    const { data: accounts, error: accountsError } = await supabase
      .from('accounts')
      .select('*');
      
    if (accountsError) {
      console.error("Error fetching accounts:", accountsError);
      throw accountsError;
    }
    
    console.log("Accounts fetched successfully:", accounts?.length || 0, "accounts found");
    if (accounts && accounts.length > 0) {
      console.log("Sample account:", JSON.stringify(accounts[0], null, 2));
    }
    
    // Get clients data - use all columns
    const { data: clients, error: clientsError } = await supabase
      .from('clients')
      .select('*');
      
    if (clientsError) {
      console.error("Error fetching clients:", clientsError);
      throw clientsError;
    }
    
    console.log("Clients fetched successfully:", clients?.length || 0, "clients found");
    if (clients && clients.length > 0) {
      console.log("Sample client:", JSON.stringify(clients[0], null, 2));
    }
    
    // Helper function to safely get property value regardless of key format (dash or underscore)
    const getProperty = (obj: any, key: string): any => {
      // Try all variations of the key
      if (obj[key] !== undefined) return obj[key];
      if (obj[key.replace(/-/g, '_')] !== undefined) return obj[key.replace(/-/g, '_')];
      if (obj[key.replace(/_/g, '-')] !== undefined) return obj[key.replace(/_/g, '-')];
      
      // For camelCase keys, convert to snake_case and dash-case and try again
      const snakeCase = key.replace(/([A-Z])/g, '_$1').toLowerCase();
      if (obj[snakeCase] !== undefined) return obj[snakeCase];
      
      const dashCase = key.replace(/([A-Z])/g, '-$1').toLowerCase();
      if (obj[dashCase] !== undefined) return obj[dashCase];
      
      // Return empty string if not found
      return '';
    };
    
    // Transform the data to match the Device type
    const transformedDevices: Device[] = [];
    
    // Map device data with associated accounts
    devices.forEach(device => {
      // Get device ID using helper function
      const deviceId = getProperty(device, 'device-id') || getProperty(device, 'device_id') || getProperty(device, 'deviceId');
      
      // Find all accounts associated with this device
      const deviceAccounts = accounts ? accounts.filter(account => {
        const accountDeviceId = getProperty(account, 'device-id') || getProperty(account, 'device_id') || getProperty(account, 'deviceId');
        
        // Normalize IDs for comparison - strip dashes, underscores for consistent matching
        const normalizedAccountId = accountDeviceId ? accountDeviceId.replace(/[-_]/g, '').toLowerCase() : '';
        const normalizedDeviceId = deviceId ? deviceId.replace(/[-_]/g, '').toLowerCase() : '';
        
        const isMatch = normalizedAccountId === normalizedDeviceId;
        
        // Add debugging
        if (isMatch) {
          console.log(`Found matching account for device ${deviceId}:`, account);
        }
        
        return isMatch;
      }) : [];
      
      console.log(`Device ${deviceId} has ${deviceAccounts.length} associated accounts`);
      
      if (deviceAccounts.length === 0) {
        // If no accounts, add the device with empty account data
        transformedDevices.push({
          deviceNumber: deviceId,
          serialNumber: getProperty(device, 'serial-number') || getProperty(device, 'serial_number') || '',
          model: getProperty(device, 'model-type') || getProperty(device, 'model_type') || '',
          phoneNumber: getProperty(device, 'phone-number') || getProperty(device, 'phone_number') || '',
          mobileCarrier: getProperty(device, 'mobile-carrier') || getProperty(device, 'mobile_carrier') || '',
          imei: getProperty(device, 'imei') || '',
          airDroidId: getProperty(device, 'airdroid-id') || getProperty(device, 'airdroid_id') || '',
          airDroidLink: `https://biz.airdroid.com/#/devices/list/-100/${getProperty(device, 'airdroid-id') || getProperty(device, 'airdroid_id') || ''}`,
          status: getProperty(device, 'status') || '',
          // Empty account data
          tikTokHandle: '',
          url: '',
          image: '',
          platform: '',
          client: '',
          clientEmail: '',
          notes: '',
          checked: '',
          timestamp: '',
          password: '',
        });
      } else {
        // Add an entry for each account
        deviceAccounts.forEach(account => {
          // Get client ID from account
          const clientId = getProperty(account, 'client-id') || getProperty(account, 'client_id');
          
          // Find client for this account
          const client = clients ? clients.find(c => {
            const cId = getProperty(c, 'client-id') || getProperty(c, 'client_id');
            return cId === clientId;
          }) : undefined;
          
          transformedDevices.push({
            deviceNumber: deviceId,
            serialNumber: getProperty(device, 'serial-number') || getProperty(device, 'serial_number') || '',
            model: getProperty(device, 'model-type') || getProperty(device, 'model_type') || '',
            phoneNumber: getProperty(device, 'phone-number') || getProperty(device, 'phone_number') || '',
            mobileCarrier: getProperty(device, 'mobile-carrier') || getProperty(device, 'mobile_carrier') || '',
            imei: getProperty(device, 'imei') || '',
            airDroidId: getProperty(device, 'airdroid-id') || getProperty(device, 'airdroid_id') || '',
            airDroidLink: `https://biz.airdroid.com/#/devices/list/-100/${getProperty(device, 'airdroid-id') || getProperty(device, 'airdroid_id') || ''}`,
            status: getProperty(device, 'status') || '',
            // Account data
            tikTokHandle: getProperty(account, 'username') || '',
            url: getPlatformUrl(getProperty(account, 'platform') || '', getProperty(account, 'username') || ''),
            image: '',
            platform: getProperty(account, 'platform') || '',
            client: getProperty(client, 'name') || '',
            clientEmail: getProperty(account, 'email') || '',
            notes: '',
            checked: '',
            timestamp: '',
            password: getProperty(account, 'password') || '',
          });
        });
      }
    });
    
    console.log("Data transformation completed. Returning", transformedDevices.length, "device records");
    return transformedDevices;
  } catch (error) {
    console.error('Error loading devices data from Supabase:', error);
    // Rethrow the error with more context to help debug in browser
    throw new Error(`Failed to load data: ${JSON.stringify(error)}`);
  }
}

// Get device by number
export function getDeviceByNumber(devices: Device[], deviceNumber: string): Device | undefined {
  return devices.find(device => device.deviceNumber === deviceNumber);
}

// Get associated accounts for a device
export function getAssociatedAccounts(devices: Device[], deviceNumber: string): Device[] {
  // Need to handle mixed formats (dash-separated vs underscore_separated)
  // So we do a case-insensitive comparison and handle formatting differences
  return devices.filter(device => {
    // Normalize for comparison - strip all dashes, underscores, and convert to lowercase
    const normalizedDeviceNum = device.deviceNumber.replace(/[-_]/g, '').toLowerCase();
    const normalizedTargetNum = deviceNumber.replace(/[-_]/g, '').toLowerCase();
    
    return normalizedDeviceNum === normalizedTargetNum;
  });
}

// Get unique device numbers
export function getUniqueDeviceNumbers(devices: Device[]): string[] {
  const uniqueNumbers = new Set<string>();
  
  devices.forEach(device => {
    if (device.deviceNumber) {
      uniqueNumbers.add(device.deviceNumber);
    }
  });
  
  // Sort: numeric devices first, special devices (iphone/shop) last
  return Array.from(uniqueNumbers).sort((a, b) => {
    // Special case for iphone or shop prefixes - always at the end
    const aIsSpecial = /^(iphone|shop)/i.test(a);
    const bIsSpecial = /^(iphone|shop)/i.test(b);
    
    // If one is special and the other isn't, sort accordingly
    if (aIsSpecial && !bIsSpecial) return 1;
    if (!aIsSpecial && bIsSpecial) return -1;
    
    // If both are special or both are not special, continue with normal sort
    
    // Extract numeric part if it exists
    const aMatch = a.match(/(\d+)/);
    const bMatch = b.match(/(\d+)/);
    
    // If both have numeric parts, compare them numerically
    if (aMatch && bMatch) {
      const aNum = parseInt(aMatch[0], 10);
      const bNum = parseInt(bMatch[0], 10);
      
      // If the numeric parts are different, sort by them
      if (aNum !== bNum) {
        return aNum - bNum;
      }
    }
    
    // If one has a numeric part and the other doesn't, the numeric one comes first
    if (aMatch && !bMatch) return -1;
    if (!aMatch && bMatch) return 1;
    
    // Simple string comparison as fallback
    if (a < b) return -1;
    if (a > b) return 1;
    return 0;
  });
}

// Update device data
export async function updateDeviceData(updatedDevice: Device, deviceNumber: string): Promise<boolean> {
  try {
    // Build update object dynamically based on table schema
    const updateObj: Record<string, any> = {};
    
    // Try both formats for column names
    const columnMappings: Record<string, string[]> = {
      "serialNumber": ["serial-number", "serial_number"],
      "model": ["model-type", "model_type"],
      "phoneNumber": ["phone-number", "phone_number"],
      "mobileCarrier": ["mobile-carrier", "mobile_carrier"],
      "imei": ["imei"],
      "airDroidId": ["airdroid-id", "airdroid_id"],
      "status": ["status"]
    };
    
    // Try to detect column names by first fetching a single row
    const { data, error: fetchError } = await supabase
      .from('devices')
      .select('*')
      .limit(1)
      .single();
      
    if (fetchError) {
      console.error("Error fetching device schema:", fetchError);
      throw fetchError;
    }
    
    // Determine actual column names from data
    for (const [key, possibleColumns] of Object.entries(columnMappings)) {
      const columnName = possibleColumns.find(col => data && Object.keys(data).includes(col));
      if (columnName) {
        updateObj[columnName] = (updatedDevice as any)[key];
      }
    }
    
    // Now update with detected column names
    const { error } = await supabase
      .from('devices')
      .update(updateObj)
      .or(`device_id.eq.${deviceNumber},device-id.eq.${deviceNumber}`);
      
    if (error) throw error;
    
    return true;
  } catch (error) {
    console.error('Error updating device data in Supabase:', error);
    throw error;
  }
}

// Update account data
export async function updateAccountData(
  updatedDevice: Device, 
  deviceNumber: string,
  accountIndex: number
): Promise<boolean> {
  try {
    // Helper function to find appropriate column name
    const findColumnName = (obj: any, possibleNames: string[]): string | null => {
      for (const name of possibleNames) {
        if (obj && Object.keys(obj).includes(name)) {
          return name;
        }
      }
      return null;
    };
    
    // First get all accounts for this device to find the correct account_id
    const { data: accounts, error: fetchError } = await supabase
      .from('accounts')
      .select('*')
      .or(`device_id.eq.${deviceNumber},device-id.eq.${deviceNumber}`);
      
    if (fetchError) throw fetchError;
    
    // Get the specific account to update
    if (!accounts || accounts.length <= accountIndex) {
      throw new Error(`Account at index ${accountIndex} not found`);
    }
    
    const account = accounts[accountIndex];
    
    // Determine column names from the account object
    const deviceIdColumn = findColumnName(account, ['device-id', 'device_id', 'deviceId']) || 'device_id';
    const clientIdColumn = findColumnName(account, ['client-id', 'client_id', 'clientId']) || 'client_id';
    const accountIdColumn = findColumnName(account, ['account-id', 'account_id', 'accountId']) || 'account_id';
    
    // Get client_id from client name
    let clientId = account[clientIdColumn];
    
    if (updatedDevice.client !== '') {
      const { data: clients, error: clientError } = await supabase
        .from('clients')
        .select('*')
        .eq('name', updatedDevice.client);
        
      if (clientError) throw clientError;
      
      if (clients && clients.length > 0) {
        const client = clients[0];
        clientId = client[clientIdColumn] || client['client-id'] || client['client_id'];
      }
    }
    
    // Build update object based on determined column names
    const updateObj: Record<string, any> = {
      username: updatedDevice.tikTokHandle,
      email: updatedDevice.clientEmail,
      password: updatedDevice.password,
      platform: updatedDevice.platform,
      status: updatedDevice.status
    };
    
    // Add client ID with the correct column name
    updateObj[clientIdColumn] = clientId;
    
    // Update the account
    const { error: updateError } = await supabase
      .from('accounts')
      .update(updateObj)
      .eq(accountIdColumn, account[accountIdColumn]);
      
    if (updateError) throw updateError;
    
    return true;
  } catch (error) {
    console.error('Error updating account data in Supabase:', error);
    throw error;
  }
}

// Helper function to generate platform URL
function getPlatformUrl(platform: string, handle: string): string {
  if (!handle) return '';
  
  // Remove @ symbol from handle if it exists
  const cleanHandle = handle.replace(/^@/, '');
  
  switch(platform.toLowerCase()) {
    case 'tiktok':
      return `https://www.tiktok.com/@${cleanHandle}`;
    case 'youtube':
      return `https://www.youtube.com/@${cleanHandle}`;
    case 'x-twitter':
    case 'twitter':
    case 'x':
      return `https://x.com/${cleanHandle}`;
    default:
      return '';
  }
} 