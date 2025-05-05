"use client";

import { useState, useEffect } from 'react';
import Link from 'next/link';

export default function SetupPage() {
  const [connectionStatus, setConnectionStatus] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [setupResult, setSetupResult] = useState<any>(null);
  const [setupLoading, setSetupLoading] = useState(false);
  const [supabaseSetupLoading, setSupabaseSetupLoading] = useState(false);

  // Function to check database connection and schema
  const checkDatabase = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/check-db');
      const data = await response.json();
      setConnectionStatus(data);
    } catch (error) {
      console.error('Error checking database:', error);
      setConnectionStatus({ error: String(error) });
    } finally {
      setLoading(false);
    }
  };

  // Function to initialize database schema
  const setupDatabase = async () => {
    setSetupLoading(true);
    try {
      const response = await fetch('/api/setup-db');
      const data = await response.json();
      setSetupResult(data);
      
      // Refresh status after setup
      await checkDatabase();
    } catch (error) {
      console.error('Error setting up database:', error);
      setSetupResult({ error: String(error) });
    } finally {
      setSetupLoading(false);
    }
  };

  // Function to initialize database schema with disabled RLS
  const setupSupabaseDB = async () => {
    setSupabaseSetupLoading(true);
    try {
      const response = await fetch('/api/setup-supabase');
      const data = await response.json();
      setSetupResult(data);
      
      // Refresh status after setup
      await checkDatabase();
    } catch (error) {
      console.error('Error setting up Supabase DB:', error);
      setSetupResult({ error: String(error) });
    } finally {
      setSupabaseSetupLoading(false);
    }
  };

  // Check database on initial load
  useEffect(() => {
    checkDatabase();
  }, []);

  return (
    <div className="min-h-screen p-4 md:p-10 mx-auto max-w-7xl">
      <div className="grid gap-8">
        <div className="flex flex-col space-y-2 mb-6">
          <h1 className="text-3xl font-bold">Supabase Database Setup</h1>
          <p className="text-gray-500">
            This page helps you diagnose and set up your Supabase database connection.
          </p>
        </div>

        <div className="bg-card rounded-lg border shadow-sm p-6">
          <h2 className="text-xl font-semibold mb-4">Connection Status</h2>
          
          {loading ? (
            <div className="flex items-center space-x-2">
              <div className="animate-spin h-4 w-4 border-2 border-primary rounded-full border-t-transparent"></div>
              <p>Checking connection...</p>
            </div>
          ) : connectionStatus?.error ? (
            <div className="text-red-500">
              <p>Error: {connectionStatus.error}</p>
            </div>
          ) : (
            <div className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="bg-muted rounded p-4">
                  <h3 className="font-medium mb-2">Database Connection</h3>
                  <div className="flex items-center space-x-2">
                    <div className={`h-3 w-3 rounded-full ${connectionStatus?.connection?.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                    <p>{connectionStatus?.connection?.success ? 'Connected' : 'Failed'}</p>
                  </div>
                  {connectionStatus?.connection?.error && (
                    <p className="text-sm text-red-500 mt-2">{connectionStatus.connection.error}</p>
                  )}
                </div>
                
                <div className="bg-muted rounded p-4">
                  <h3 className="font-medium mb-2">Environment Variables</h3>
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${connectionStatus?.environment?.url ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p>URL: {connectionStatus?.environment?.url ? 'Set' : 'Missing'}</p>
                    </div>
                    <div className="flex items-center space-x-2">
                      <div className={`h-3 w-3 rounded-full ${connectionStatus?.environment?.key ? 'bg-green-500' : 'bg-red-500'}`}></div>
                      <p>API Key: {connectionStatus?.environment?.key ? 'Set' : 'Missing'}</p>
                    </div>
                  </div>
                </div>
              </div>
              
              <div className="bg-muted rounded p-4">
                <h3 className="font-medium mb-2">Schema Status</h3>
                {connectionStatus?.schema?.success ? (
                  <div className="flex items-center space-x-2">
                    <div className="h-3 w-3 rounded-full bg-green-500"></div>
                    <p>All required tables exist</p>
                  </div>
                ) : (
                  <div className="space-y-2">
                    <div className="flex items-center space-x-2">
                      <div className="h-3 w-3 rounded-full bg-red-500"></div>
                      <p>Missing required tables</p>
                    </div>
                    {connectionStatus?.schema?.missingTables?.length > 0 && (
                      <p className="text-sm text-red-500">
                        Missing tables: {connectionStatus.schema.missingTables.join(', ')}
                      </p>
                    )}
                    {connectionStatus?.schema?.exists && (
                      <p className="text-sm">
                        Found tables: {connectionStatus.schema.allTables.join(', ')}
                      </p>
                    )}
                  </div>
                )}
              </div>
              
              <div className="bg-muted rounded p-4">
                <h3 className="font-medium mb-2">Database Setup Options</h3>
                <div className="space-y-4">
                  <div>
                    <p className="text-sm mb-2">
                      You have two setup options:
                    </p>
                    <ul className="list-disc pl-5 text-sm space-y-1">
                      <li>
                        <strong>Basic Setup:</strong> Creates tables and sample data, but might have RLS issues.
                      </li>
                      <li>
                        <strong>Complete Supabase Setup:</strong> Creates tables with RLS disabled for development.
                      </li>
                    </ul>
                  </div>
                  
                  <div className="flex flex-col sm:flex-row gap-2 justify-between pt-2">
                    <button 
                      className="bg-blue-600 text-white px-4 py-2 rounded hover:bg-blue-700" 
                      onClick={checkDatabase}
                    >
                      Refresh Status
                    </button>
                    
                    <div className="flex flex-col sm:flex-row gap-2">
                      {!connectionStatus?.schema?.success && (
                        <>
                          <button 
                            className="bg-amber-600 text-white px-4 py-2 rounded hover:bg-amber-700"
                            onClick={setupDatabase}
                            disabled={setupLoading}
                          >
                            {setupLoading ? 'Setting up...' : 'Basic Setup'}
                          </button>
                          
                          <button 
                            className="bg-green-600 text-white px-4 py-2 rounded hover:bg-green-700"
                            onClick={setupSupabaseDB}
                            disabled={supabaseSetupLoading}
                          >
                            {supabaseSetupLoading ? 'Setting up...' : 'Complete Supabase Setup'}
                          </button>
                        </>
                      )}
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>
        
        {setupResult && (
          <div className="bg-card rounded-lg border shadow-sm p-6">
            <h2 className="text-xl font-semibold mb-4">Setup Results</h2>
            {setupResult.error ? (
              <div className="text-red-500">
                <p>Error: {setupResult.error}</p>
              </div>
            ) : (
              <div className="space-y-4">
                <p className="text-green-500 font-medium">Database setup completed</p>
                <div className="bg-muted rounded p-4 max-h-60 overflow-y-auto">
                  <h3 className="font-medium mb-2">Operation Results:</h3>
                  <ul className="space-y-2">
                    {setupResult.results.map((result: any, index: number) => (
                      <li key={index} className="flex items-start space-x-2">
                        <div className={`mt-1 h-3 w-3 rounded-full ${result.success ? 'bg-green-500' : 'bg-red-500'}`}></div>
                        <div>
                          <p>{result.statement}</p>
                          {result.error && <p className="text-sm text-red-500">{result.error}</p>}
                        </div>
                      </li>
                    ))}
                  </ul>
                </div>
              </div>
            )}
          </div>
        )}
        
        <div className="mt-4 flex justify-between">
          <Link href="/" className="text-blue-600 hover:underline">
            Return to Dashboard
          </Link>
          
          {connectionStatus?.schema?.success && (
            <p className="text-green-600">
              Your database is correctly set up. You can now use the application.
            </p>
          )}
        </div>
      </div>
    </div>
  );
} 