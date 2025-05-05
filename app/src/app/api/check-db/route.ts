import { NextResponse } from 'next/server';
import { supabase } from '@/lib/supabase-client';
import { checkSchema } from '@/lib/schema-checker';

export async function GET() {
  try {
    // Check Supabase connection by making a simple request
    // We'll just try to access the system schema version which is always available
    const { data: connectionTest, error: connectionError } = await supabase
      .rpc('get_system_schema_version');
      
    // If that fails, try a simpler query
    let connectionSuccess = !connectionError;
    let connectionErrorMsg = connectionError ? connectionError.message : null;
    
    if (connectionError) {
      // Try a simpler test - just get the service status
      const { error: statusError } = await supabase.from('_service_status').select('*').limit(1);
      connectionSuccess = !statusError;
      connectionErrorMsg = statusError ? statusError.message : connectionErrorMsg;
    }
      
    // Check schema
    const schemaResult = await checkSchema();
    
    return NextResponse.json({
      connection: {
        success: connectionSuccess,
        error: connectionErrorMsg,
        data: connectionTest
      },
      schema: schemaResult,
      environment: {
        url: !!process.env.NEXT_PUBLIC_SUPABASE_URL || !!process.env.SUPABASE_PROJECT_URL,
        key: !!process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY || !!process.env.SUPABASE_ANON_PUBLIC_KEY
      }
    });
  } catch (error) {
    console.error('Error checking database:', error);
    return NextResponse.json({ 
      success: false, 
      error: String(error)
    }, { status: 500 });
  }
} 