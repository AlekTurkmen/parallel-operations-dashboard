import Papa from 'papaparse';
import { Device } from '../types/device';
import { loadDevicesData } from './csv-parser';

// Function to update a single device and save changes to the CSV file
export async function updateDeviceData(updatedDevice: Device, deviceNumber: string): Promise<boolean> {
  try {
    // 1. Fetch the current CSV data
    const response = await fetch('/devices.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();

    // 2. Parse the CSV to get all rows
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    // 3. Update the rows that match the device number
    const updatedRows = result.data.map((row: any) => {
      // If this row is for the device we're updating
      if (row['Device Number'] === deviceNumber) {
        // Only update specific fields that should be shared across all entries
        // with the same device number
        row['Phone Number'] = updatedDevice.phoneNumber;
        row['Mobile Carrier'] = updatedDevice.mobileCarrier;
        row['IMEI'] = updatedDevice.imei;
        row['Serial Number'] = updatedDevice.serialNumber;
        row['Model'] = updatedDevice.model;
        row['AirDroid ID'] = updatedDevice.airDroidId;
      }
      return row;
    });
    
    // 4. Convert back to CSV
    const updatedCsv = Papa.unparse(updatedRows);
    
    // 5. Save the updated CSV using the API
    const saveResponse = await fetch('/api/update-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csvData: updatedCsv,
      }),
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save CSV: ${saveResponse.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating device data:', error);
    throw error;
  }
}

// Function to update a specific account detail
export async function updateAccountData(
  updatedDevice: Device, 
  deviceNumber: string,
  accountIndex: number
): Promise<boolean> {
  try {
    // 1. Load all devices data
    const allDevices = await loadDevicesData();
    
    // 2. Find all rows for this device
    const deviceRows = allDevices.filter(device => device.deviceNumber === deviceNumber);
    
    // 3. Get the specific account to update
    if (!deviceRows[accountIndex]) {
      throw new Error(`Account at index ${accountIndex} not found`);
    }
    
    // 4. Fetch the current CSV data
    const response = await fetch('/devices.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();

    // 5. Parse the CSV
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    // 6. Find and update the specific row
    // We need to find the specific row that matches both device number and other key details
    let rowsUpdated = 0;
    const updatedRows = result.data.map((row: any) => {
      if (row['Device Number'] === deviceNumber) {
        // For TikTok Handle, check possible column names
        const tikTokHandle = 
          row['TikTok @handle'] || 
          row['TikTok Handle'] || 
          row['@handle'] || 
          row['tikTokHandle'] || 
          '';
          
        // For Email, check possible column names  
        const email = 
          row['Email'] || 
          row['Client Email'] || 
          row['clientEmail'] || 
          '';
          
        // Check if this is the specific account we want to update
        // We can match using a combination of fields
        if (tikTokHandle === deviceRows[accountIndex].tikTokHandle &&
            email === deviceRows[accountIndex].clientEmail &&
            row['Client'] === deviceRows[accountIndex].client) {
          
          // Update account-specific fields
          if (row['TikTok @handle']) row['TikTok @handle'] = updatedDevice.tikTokHandle;
          if (row['TikTok Handle']) row['TikTok Handle'] = updatedDevice.tikTokHandle;
          if (row['@handle']) row['@handle'] = updatedDevice.tikTokHandle;
          if (row['tikTokHandle']) row['tikTokHandle'] = updatedDevice.tikTokHandle;
          
          if (row['Email']) row['Email'] = updatedDevice.clientEmail;
          if (row['Client Email']) row['Client Email'] = updatedDevice.clientEmail;
          if (row['clientEmail']) row['clientEmail'] = updatedDevice.clientEmail;
          
          row['Client'] = updatedDevice.client;
          row['URL'] = updatedDevice.url;
          
          // Update password if it exists in the CSV
          if (row['Password']) row['Password'] = updatedDevice.password;
          if (row['password']) row['password'] = updatedDevice.password;
          
          rowsUpdated++;
        }
        
        // Always update shared device properties
        row['Phone Number'] = updatedDevice.phoneNumber;
        row['Mobile Carrier'] = updatedDevice.mobileCarrier;
        row['IMEI'] = updatedDevice.imei;
        row['Serial Number'] = updatedDevice.serialNumber;
        row['Model'] = updatedDevice.model;
        row['AirDroid ID'] = updatedDevice.airDroidId;
      }
      
      return row;
    });
    
    if (rowsUpdated === 0) {
      console.warn('No rows were updated for the account');
    }
    
    // 7. Convert back to CSV
    const updatedCsv = Papa.unparse(updatedRows);
    
    // 8. Save the updated CSV
    const saveResponse = await fetch('/api/update-csv', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        csvData: updatedCsv,
      }),
    });
    
    if (!saveResponse.ok) {
      throw new Error(`Failed to save CSV: ${saveResponse.statusText}`);
    }
    
    return true;
  } catch (error) {
    console.error('Error updating account data:', error);
    throw error;
  }
} 