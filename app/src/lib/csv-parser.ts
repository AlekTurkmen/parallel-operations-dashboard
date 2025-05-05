import Papa from 'papaparse';
import { Device } from '@/types/device';

export async function loadDevicesData(): Promise<Device[]> {
  try {
    const response = await fetch('/devices.csv');
    if (!response.ok) {
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    
    const csvText = await response.text();
    
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    const devices = result.data.map((row: any) => {
      // Try different potential column names for TikTok handle
      const tikTokHandle = 
        row['TikTok @handle'] || 
        row['TikTok Handle'] || 
        row['@handle'] || 
        row['tikTokHandle'] || 
        '';
        
      // Try different potential column names for email
      const email = 
        row['Email'] || 
        row['Client Email'] || 
        row['clientEmail'] || 
        '';
      
      // Try different potential column names for password
      const password =
        row['Password'] ||
        row['password'] ||
        '';
      
      return {
        tikTokHandle: tikTokHandle,
        url: row['URL'] || '',
        airDroidLink: `https://biz.airdroid.com/#/devices/list/-100/${row['AirDroid ID'] || ''}`,
        image: row['Image'] || '',
        serialNumber: row['Serial Number'] || '',
        deviceNumber: row['Device Number'] || '',
        platform: row['Platform'] || '',
        model: row['Model'] || '',
        client: row['Client'] || '',
        clientEmail: email,
        phoneNumber: row['Phone Number'] || '',
        mobileCarrier: row['Mobile Carrier'] || '',
        imei: row['IMEI'] || '',
        notes: row['Notes'] || '',
        checked: row['Checked'] || '',
        status: row['Status'] || '',
        timestamp: row['Timestamp'] || '',
        airDroidId: row['AirDroid ID'] || '',
        password: password,
      };
    }) as Device[];
    
    return devices;
  } catch (error) {
    console.error('Error loading devices data:', error);
    return [];
  }
}

// Helper to clean device number (remove # prefix)
const cleanDeviceNumber = (deviceNumber: string): string => {
  return deviceNumber.replace(/^#/, '');
};

export function getDeviceByNumber(devices: Device[], deviceNumber: string): Device | undefined {
  return devices.find(device => device.deviceNumber === deviceNumber);
}

export function getAssociatedAccounts(devices: Device[], deviceNumber: string): Device[] {
  return devices.filter(device => device.deviceNumber === deviceNumber);
}

export function getUniqueDeviceNumbers(devices: Device[]): string[] {
  const uniqueNumbers = new Set<string>();
  
  devices.forEach(device => {
    if (device.deviceNumber) {
      uniqueNumbers.add(device.deviceNumber);
    }
  });
  
  // Sort numerically (after removing the # prefix)
  return Array.from(uniqueNumbers).sort((a, b) => {
    const numA = parseInt(cleanDeviceNumber(a));
    const numB = parseInt(cleanDeviceNumber(b));
    return numA - numB;
  });
} 