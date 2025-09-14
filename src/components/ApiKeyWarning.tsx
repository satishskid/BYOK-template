import React from 'react';
import { hasValidApiKey, getCurrentProvider } from '../services/aiService';

interface ApiKeyWarningProps {
  onOpenSettings: () => void;
  className?: string;
}

const ApiKeyWarning: React.FC<ApiKeyWarningProps> = ({ onOpenSettings, className = '' }) => {
  if (hasValidApiKey()) {
    return null;
  }

  const currentProvider = getCurrentProvider();

  return (
    <div className={`bg-amber-50 border border-amber-200 rounded-lg p-4 ${className}`}>
      <div className="flex items-center">
        <div className="flex-shrink-0">
          <svg className="h-5 w-5 text-amber-400" viewBox="0 0 20 20" fill="currentColor">
            <path fillRule="evenodd" d="M8.257 3.099c.765-1.36 2.722-1.36 3.486 0l5.58 9.92c.75 1.334-.213 2.98-1.742 2.98H4.42c-1.53 0-2.493-1.646-1.743-2.98l5.58-9.92zM11 13a1 1 0 11-2 0 1 1 0 012 0zm-1-8a1 1 0 00-1 1v3a1 1 0 002 0V6a1 1 0 00-1-1z" clipRule="evenodd" />
          </svg>
        </div>
        <div className="ml-3 flex-1">
          <h3 className="text-sm font-medium text-amber-800">
            API Key Required
          </h3>
          <p className="mt-1 text-sm text-amber-700">
            Configure your {currentProvider === 'gemini' ? 'Gemini' : 'Groq'} API key to use AI features.
          </p>
        </div>
        <div className="ml-auto">
          <button
            onClick={onOpenSettings}
            className="bg-amber-100 text-amber-800 hover:bg-amber-200 px-3 py-1 rounded-md text-sm font-medium transition-colors"
          >
            Configure
          </button>
        </div>
      </div>
    </div>
  );
};

export default ApiKeyWarning;
