import React, { useState, useEffect } from 'react';
import { testApiKey, setAIConfig, getCurrentProvider, AIProvider } from '../services/aiService';

interface ProviderConfig {
  name: string;
  description: string;
  keyFormat: string;
  setupGuide: string;
  website: string;
}

const PROVIDERS: Record<AIProvider, ProviderConfig> = {
  gemini: {
    name: "Google Gemini",
    description: "Google's most capable AI model with strong reasoning",
    keyFormat: "AIza...",
    setupGuide: "1. Go to Google AI Studio\n2. Create a new API key\n3. Copy the key starting with 'AIza'",
    website: "https://aistudio.google.com"
  },
  groq: {
    name: "Groq",
    description: "Ultra-fast AI inference with Llama models",
    keyFormat: "gsk_...", 
    setupGuide: "1. Go to Groq Console\n2. Create a new API key\n3. Copy the key starting with 'gsk_'",
    website: "https://console.groq.com"
  }
};

const ApiKeyManager: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(getCurrentProvider());
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    gemini: '',
    groq: ''
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    groq: false
  });
  const [testing, setTesting] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    groq: false
  });
  const [keyStatus, setKeyStatus] = useState<Record<AIProvider, 'valid' | 'invalid' | 'untested'>>({
    gemini: 'untested',
    groq: 'untested'
  });

  useEffect(() => {
    // Load existing keys from localStorage
    const savedKeys: Record<AIProvider, string> = {
      gemini: localStorage.getItem('gemini_api_key') || '',
      groq: localStorage.getItem('groq_api_key') || ''
    };
    setApiKeys(savedKeys);
    
    // Test existing keys
    Object.entries(savedKeys).forEach(([provider, key]) => {
      if (key) {
        testAndSetStatus(provider as AIProvider, key);
      }
    });
  }, []);

  const testAndSetStatus = async (provider: AIProvider, key: string) => {
    if (!key.trim()) {
      setKeyStatus(prev => ({ ...prev, [provider]: 'untested' }));
      return;
    }

    setTesting(prev => ({ ...prev, [provider]: true }));
    
    try {
      const isValid = await testApiKey(provider, key);
      setKeyStatus(prev => ({ ...prev, [provider]: isValid ? 'valid' : 'invalid' }));
    } catch (error) {
      setKeyStatus(prev => ({ ...prev, [provider]: 'invalid' }));
    } finally {
      setTesting(prev => ({ ...prev, [provider]: false }));
    }
  };

  const handleKeyChange = (provider: AIProvider, value: string) => {
    setApiKeys(prev => ({ ...prev, [provider]: value }));
    setKeyStatus(prev => ({ ...prev, [provider]: 'untested' }));
  };

  const handleSaveKey = async (provider: AIProvider) => {
    const key = apiKeys[provider].trim();
    if (key) {
      localStorage.setItem(`${provider}_api_key`, key);
      await testAndSetStatus(provider, key);
    } else {
      localStorage.removeItem(`${provider}_api_key`);
      setKeyStatus(prev => ({ ...prev, [provider]: 'untested' }));
    }
  };

  const handleSwitchProvider = (provider: AIProvider) => {
    if (keyStatus[provider] === 'valid') {
      setAIConfig(provider, apiKeys[provider]);
      setCurrentProvider(provider);
    }
  };

  const getStatusColor = (status: 'valid' | 'invalid' | 'untested') => {
    switch (status) {
      case 'valid': return 'text-green-600';
      case 'invalid': return 'text-red-600';
      default: return 'text-gray-500';
    }
  };

  const getStatusText = (status: 'valid' | 'invalid' | 'untested') => {
    switch (status) {
      case 'valid': return '✓ Valid';
      case 'invalid': return '✗ Invalid';
      default: return '○ Not tested';
    }
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">AI Provider Settings</h2>
        <p className="text-gray-600">Configure your API keys for AI features</p>
      </div>

      <div className="grid gap-6 md:grid-cols-2">
        {(Object.entries(PROVIDERS) as [AIProvider, ProviderConfig][]).map(([provider, config]) => (
          <div
            key={provider}
            className={`border-2 rounded-lg p-6 transition-all ${
              currentProvider === provider
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-center justify-between mb-4">
              <h3 className="text-lg font-semibold text-gray-800">{config.name}</h3>
              {currentProvider === provider && (
                <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                  ACTIVE
                </span>
              )}
            </div>

            <p className="text-sm text-gray-600 mb-4">{config.description}</p>

            <div className="space-y-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  API Key ({config.keyFormat})
                </label>
                <div className="relative">
                  <input
                    type={showKeys[provider] ? 'text' : 'password'}
                    value={apiKeys[provider]}
                    onChange={(e) => handleKeyChange(provider, e.target.value)}
                    placeholder="Enter your API key"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 pr-10"
                  />
                  <button
                    type="button"
                    onClick={() => setShowKeys(prev => ({ ...prev, [provider]: !prev[provider] }))}
                    className="absolute right-2 top-1/2 transform -translate-y-1/2 text-gray-400 hover:text-gray-600"
                  >
                    {showKeys[provider] ? '👁️' : '👁️‍🗨️'}
                  </button>
                </div>
              </div>

              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getStatusColor(keyStatus[provider])}`}>
                  {testing[provider] ? '⏳ Testing...' : getStatusText(keyStatus[provider])}
                </span>
              </div>

              <div className="flex gap-2">
                <button
                  onClick={() => handleSaveKey(provider)}
                  disabled={testing[provider]}
                  className="flex-1 bg-gray-100 text-gray-700 py-2 px-4 rounded-md hover:bg-gray-200 transition-colors disabled:opacity-50"
                >
                  {apiKeys[provider] ? 'Save & Test' : 'Remove'}
                </button>
                
                {keyStatus[provider] === 'valid' && currentProvider !== provider && (
                  <button
                    onClick={() => handleSwitchProvider(provider)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Switch to this
                  </button>
                )}
              </div>

              <details className="text-xs text-gray-500">
                <summary className="cursor-pointer hover:text-gray-700">Setup Guide</summary>
                <div className="mt-2 p-3 bg-gray-50 rounded">
                  <div className="whitespace-pre-line">{config.setupGuide}</div>
                  <a 
                    href={config.website} 
                    target="_blank" 
                    rel="noopener noreferrer"
                    className="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
                  >
                    Visit {config.name} →
                  </a>
                </div>
              </details>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeyManager;
