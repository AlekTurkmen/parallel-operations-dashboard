import { createClient } from '@supabase/supabase-js';

// Supabase client setup
// Using environment variables or hardcoded values for client-side execution
const supabaseUrl = 'https://fhnrrxlyxllbnxhjzaqq.supabase.co';

const supabaseAnonKey = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpc3MiOiJzdXBhYmFzZSIsInJlZiI6ImZobnJyeGx5eGxsYm54aGp6YXFxIiwicm9sZSI6ImFub24iLCJpYXQiOjE3NDYzOTA4NjYsImV4cCI6MjA2MTk2Njg2Nn0.iBoGOep6tDDx09ZOkSOHTQW_GuLdJHBgLRG7vscXoyQ';

// Create better error objects from Supabase errors
export function formatSupabaseError(error: any): Error {
  // If it's already an Error instance, just return it
  if (error instanceof Error) return error;
  
  // Create a descriptive error message
  let message = 'Supabase operation failed';
  
  if (error?.message) {
    message = `Supabase error: ${error.message}`;
  } else if (error?.code) {
    message = `Supabase error code: ${error.code}`;
  } else if (typeof error === 'string') {
    message = error;
  } else if (error) {
    // Try to stringify the error object
    try {
      message = `Supabase error: ${JSON.stringify(error)}`;
    } catch (e) {
      message = `Supabase error: (Unstringifiable error object)`;
    }
  }
  
  const formattedError = new Error(message);
  
  // Add original error properties to the error object
  if (error && typeof error === 'object') {
    formattedError.name = 'SupabaseError';
    formattedError.cause = error;
    
    // Add all properties from the original error
    Object.getOwnPropertyNames(error).forEach(prop => {
      try {
        // @ts-ignore
        formattedError[prop] = error[prop];
      } catch (e) {
        // Ignore errors during property copying
      }
    });
  }
  
  return formattedError;
}

// Create a single supabase client for interacting with the database
export const supabase = createClient(supabaseUrl, supabaseAnonKey, {
  auth: {
    persistSession: true,
    autoRefreshToken: true,
  },
});

// Export a helper to check if the connection is valid
export const checkConnection = async () => {
  try {
    const response = await supabase.from('agents').select('*', { count: 'exact', head: true });
    
    if (response.error) {
      console.error('Supabase connection error:', response.error);
      throw formatSupabaseError(response.error);
    }
    
    return { connected: true, count: response.count || 0 };
  } catch (error) {
    // Log the full error object for debugging
    console.error('Supabase connection failed with error:', error);
    
    const formattedError = formatSupabaseError(error);
    
    return { 
      connected: false, 
      error: formattedError
    };
  }
}; 