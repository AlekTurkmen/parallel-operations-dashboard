'use client';

import { useEffect } from 'react';

export default function Error({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Log the error to an error reporting service
    console.error('Application error:', error);
  }, [error]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen p-4 gradient-bg">
      <div className="p-8 bg-black/50 rounded-lg border border-gray-800 max-w-xl w-full">
        <h2 className="text-2xl font-bold text-white mb-4">Something went wrong!</h2>
        <div className="bg-black/30 p-4 rounded mb-4 overflow-auto max-h-48">
          <p className="text-red-400 font-mono text-sm whitespace-pre-wrap">{error.message}</p>
          {error.stack && (
            <details className="mt-2">
              <summary className="text-gray-400 cursor-pointer">Stack trace</summary>
              <p className="text-gray-400 font-mono text-xs whitespace-pre mt-2">
                {error.stack}
              </p>
            </details>
          )}
        </div>
        <button
          onClick={() => reset()}
          className="px-4 py-2 bg-purple-800 hover:bg-purple-700 text-white font-bold rounded-md transition duration-200 skeuomorphic"
        >
          Try again
        </button>
      </div>
    </div>
  );
} 