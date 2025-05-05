import { supabase } from './supabase-client';

/**
 * Utility to check if the required database schema exists in Supabase
 * @returns An object with information about the schema
 */
export async function checkSchema() {
  console.log("Checking database schema...");
  
  try {
    // Instead of querying pg_catalog, we'll try to select from each required table
    // and check if the operation succeeds
    const requiredTables = ['agents', 'devices', 'clients', 'accounts'];
    const tableResults = [];
    const existingTables = [];
    const missingTables = [];
    
    // Check each table by attempting to select from it
    for (const tableName of requiredTables) {
      const { count, error } = await supabase
        .from(tableName)
        .select('*', { count: 'exact', head: true });
      
      if (error) {
        // If there's an error like 'relation does not exist', the table is missing
        console.log(`Table ${tableName} check failed:`, error.message);
        missingTables.push(tableName);
        tableResults.push({ table: tableName, exists: false, error: error.message });
      } else {
        console.log(`Table ${tableName} exists`);
        existingTables.push(tableName);
        tableResults.push({ table: tableName, exists: true, count });
      }
    }
    
    return {
      success: missingTables.length === 0,
      exists: existingTables.length > 0,
      missingTables,
      allTables: existingTables,
      details: tableResults
    };
    
  } catch (error) {
    console.error("Error checking schema:", error);
    return { 
      success: false, 
      error: String(error),
      tables: []
    };
  }
} 