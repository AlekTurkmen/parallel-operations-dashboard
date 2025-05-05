/**
 * This script is a utility to initialize some sample data in Supabase.
 * Run with: npx ts-node scripts/init-supabase-data.ts
 */

import { createClient } from '@supabase/supabase-js';
import fs from 'fs';
import path from 'path';
import Papa from 'papaparse';

// Supabase client setup
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || 
                   process.env.SUPABASE_PROJECT_URL || 
                   'https://fhnrrxlyxllbnxhjzaqq.supabase.co';

const supabaseServiceKey = process.env.SUPABASE_SERVICE_KEY || 
                          process.env.SUPABSE_SERVICE_ROLE_KEY || 
                          '';

// Create a supabase client with the service key
const supabase = createClient(supabaseUrl, supabaseServiceKey);

async function initializeData() {
  try {
    console.log('Starting data initialization...');

    // Check if CSV file exists and read it
    const publicDir = path.join(process.cwd(), 'public');
    const csvPath = path.join(publicDir, 'devices.csv');
    
    if (!fs.existsSync(csvPath)) {
      console.error('CSV file not found at:', csvPath);
      return;
    }
    
    const csvText = fs.readFileSync(csvPath, 'utf8');
    
    // Parse CSV
    const result = Papa.parse(csvText, {
      header: true,
      skipEmptyLines: true,
    });
    
    console.log(`Parsed ${result.data.length} rows from CSV`);
    
    // First, insert agents
    const agentIds = [1, 2, 3]; // Sample agent IDs
    
    for (const agentId of agentIds) {
      const { error } = await supabase
        .from('agents')
        .upsert({
          agent_id: agentId,
          ip_address: `192.168.1.${agentId}`,
          type: 'usb-bridge'
        });
        
      if (error) {
        console.error('Error inserting agent:', error);
      }
    }
    
    console.log('Agents initialized');
    
    // Insert clients
    const clientsMap = new Map();
    let clientCounter = 1;
    
    result.data.forEach((row: any) => {
      const clientName = row['Client'];
      if (clientName && !clientsMap.has(clientName)) {
        clientsMap.set(clientName, clientCounter++);
      }
    });
    
    for (const [clientName, clientId] of clientsMap.entries()) {
      const { error } = await supabase
        .from('clients')
        .upsert({
          client_id: clientId,
          name: clientName,
          domain: `${clientName.toLowerCase().replace(/\s+/g, '')}.com`,
          active: true,
          external_emails: JSON.stringify([`contact@${clientName.toLowerCase().replace(/\s+/g, '')}.com`])
        });
        
      if (error) {
        console.error('Error inserting client:', error);
      }
    }
    
    console.log('Clients initialized');
    
    // Process device data
    const deviceMap = new Map();
    const processedDeviceNumbers = new Set();
    
    // First pass: Insert devices
    for (const row of result.data as any[]) {
      const deviceNumber = row['Device Number'];
      
      if (!deviceNumber || processedDeviceNumbers.has(deviceNumber)) {
        continue;
      }
      
      const randomAgent = agentIds[Math.floor(Math.random() * agentIds.length)];
      
      const { data, error } = await supabase
        .from('devices')
        .upsert({
          device_id: deviceNumber,
          agent_id: randomAgent,
          model_type: row['Model'] || '',
          serial_number: row['Serial Number'] || '',
          phone_number: row['Phone Number'] || '',
          mobile_carrier: row['Mobile Carrier'] || '',
          imei: row['IMEI'] || '',
          airdroid_id: row['AirDroid ID'] || '',
          status: row['Status'] || 'active'
        })
        .select();
        
      if (error) {
        console.error('Error inserting device:', error);
      } else {
        deviceMap.set(deviceNumber, data[0]);
        processedDeviceNumbers.add(deviceNumber);
      }
    }
    
    console.log('Devices initialized');
    
    // Second pass: Insert accounts
    for (const row of result.data as any[]) {
      const deviceNumber = row['Device Number'];
      const device = deviceMap.get(deviceNumber);
      
      if (!device) {
        continue;
      }
      
      const clientName = row['Client'];
      const clientId = clientsMap.get(clientName);
      
      if (!clientId) {
        continue;
      }
      
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
        
      const platform = row['Platform'] || 'tiktok';
      
      const { error } = await supabase
        .from('accounts')
        .insert({
          device_id: deviceNumber,
          client_id: clientId,
          username: tikTokHandle,
          email: email,
          password: password,
          platform: platform,
          status: 'active',
          dob: '2000-01-01' // Default DOB
        });
        
      if (error) {
        console.error('Error inserting account:', error);
      }
    }
    
    console.log('Accounts initialized');
    console.log('Data initialization complete!');

  } catch (error) {
    console.error('Error initializing data:', error);
  }
}

// Run the initialization
initializeData(); 