"use client";

import Link from "next/link";
import { cn } from "@/lib/utils";
import { useEffect, useState } from "react";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [currentTime, setCurrentTime] = useState<string>("");

  useEffect(() => {
    // Only run on client-side to prevent hydration mismatch
    setCurrentTime(new Date().toLocaleString());
    
    // Update time every minute
    const interval = setInterval(() => {
      setCurrentTime(new Date().toLocaleString());
    }, 60000);
    
    return () => clearInterval(interval);
  }, []);

  return (
    <div className="flex flex-col min-h-screen bg-gray-900 text-white">
      <header className="bg-gray-800 border-b border-gray-700">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <Link href="/dashboard" className="text-xl font-bold">
            Operations UI
          </Link>
          <div className="flex items-center space-x-4">
            <span className="text-sm text-gray-300">Admin</span>
            <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center">
              A
            </div>
          </div>
        </div>
      </header>

      {/* Main content */}
      <main className="flex-1">{children}</main>

      {/* Footer */}
      <footer className="bg-gray-800 border-t border-gray-700 py-4">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            {/* System Status */}
            <div className="space-y-2">
              <h3 className="text-sm font-medium text-gray-400">System Status</h3>
              <div className="flex justify-between items-center text-sm">
                <span>Database Connection</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Connected
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>API Status</span>
                <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-green-100 text-green-800">
                  Operational
                </span>
              </div>
              <div className="flex justify-between items-center text-sm">
                <span>Last Data Sync</span>
                <span>{currentTime}</span>
              </div>
            </div>
            
            {/* Credits */}
            <div className="flex items-center justify-end">
              <p className="text-sm text-gray-400">Made with ❤️ by <a href="https://www.youtube.com/watch?v=dQw4w9WgXcQ" className="text-blue-400 hover:underline" target="_blank" rel="noopener noreferrer">Alek</a></p>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
} 