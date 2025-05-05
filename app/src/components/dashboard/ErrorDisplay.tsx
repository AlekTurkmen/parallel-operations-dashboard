import { FaExclamationTriangle } from "react-icons/fa";

interface ErrorDisplayProps {
  error: Error;
  entityName: string;
  onRetry: () => void;
}

export default function ErrorDisplay({ error, entityName, onRetry }: ErrorDisplayProps) {
  return (
    <div className="bg-red-900/40 border border-red-700 rounded-lg p-4 mb-6">
      <div className="flex items-start">
        <FaExclamationTriangle className="text-red-500 text-xl mr-3 mt-1" />
        <div>
          <h3 className="text-lg font-semibold text-red-500 mb-2">Error Loading {entityName}</h3>
          <p className="text-white mb-2">{error.message}</p>
          <details className="text-gray-300">
            <summary className="cursor-pointer text-sm">See details</summary>
            <pre className="mt-2 p-3 bg-black/30 rounded text-xs overflow-auto max-h-48 whitespace-pre-wrap">
              {error.stack || JSON.stringify(error, null, 2)}
            </pre>
          </details>
          <button 
            onClick={onRetry}
            className="mt-3 bg-red-800 hover:bg-red-700 text-white px-4 py-2 rounded-lg transition-colors text-sm"
          >
            Retry
          </button>
        </div>
      </div>
    </div>
  );
} 