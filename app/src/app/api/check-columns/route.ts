import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';

export async function GET() {
  try {
    console.log("Starting database schema inspection");
    
    // Test connection with a simple query
    const { data: testData, error: testError } = await supabase
      .from('devices')
      .select('*')
      .limit(1);
      
    if (testError) {
      console.error("Connection test failed:", testError);
      return NextResponse.json({ 
        error: `Database connection failed: ${testError.message}` 
      }, { status: 500 });
    }
    
    // Show sample row structure for debugging
    console.log("Sample device row structure:", testData && testData.length > 0 ? Object.keys(testData[0]) : "No data");
    
    // Query to get all table names in the public schema
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public' 
      AND table_type = 'BASE TABLE'
    `;
    
    const { data: tables, error: tableError } = await supabase.rpc('pg_query', { 
      query: tableQuery 
    });
    
    if (tableError) {
      return NextResponse.json({ 
        error: `Failed to get tables: ${tableError.message}` 
      }, { status: 500 });
    }
    
    const tableNames = tables.map((row: any) => row.table_name);
    
    // For each table, get its column names and data types
    const tableInfo: Record<string, any[]> = {};
    
    for (const tableName of tableNames) {
      const columnQuery = `
        SELECT column_name, data_type, column_default
        FROM information_schema.columns
        WHERE table_schema = 'public'
        AND table_name = '${tableName}'
        ORDER BY ordinal_position
      `;
      
      const { data: columns, error: columnError } = await supabase.rpc('pg_query', { 
        query: columnQuery 
      });
      
      if (columnError) {
        return NextResponse.json({ 
          error: `Failed to get columns for ${tableName}: ${columnError.message}` 
        }, { status: 500 });
      }
      
      tableInfo[tableName] = columns;
    }
    
    // Also fetch some sample data for debugging relationships
    const sampleData: Record<string, any> = {};

    // Get a sample device and its accounts
    const { data: sampleDevice, error: sampleDeviceError } = await supabase
      .from('devices')
      .select('*')
      .limit(1)
      .single();
      
    if (!sampleDeviceError && sampleDevice) {
      sampleData.device = sampleDevice;
      
      // Try getting accounts for this device
      const deviceId = sampleDevice['device-id'] || sampleDevice.device_id;
      if (deviceId) {
        // Try both formats
        const { data: deviceAccounts, error: accountsError } = await supabase
          .from('accounts')
          .select('*')
          .or(`device_id.eq.${deviceId},device-id.eq.${deviceId}`);
          
        if (!accountsError) {
          sampleData.accountsFound = deviceAccounts?.length || 0;
          sampleData.accounts = deviceAccounts;
        } else {
          sampleData.accountsError = accountsError.message;
        }
      }
    }

    return NextResponse.json({ 
      tables: tableNames, 
      columns: tableInfo,
      sampleData
    });
    
  } catch (error) {
    console.error('Error checking column names:', error);
    return NextResponse.json({ 
      error: `Unexpected error: ${String(error)}` 
    }, { status: 500 });
  }
} 