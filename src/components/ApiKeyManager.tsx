import React, { useState, useEffect } from 'react';
import { 
  testApiKey, 
  setAIConfig, 
  getCurrentProvider, 
  AIProvider, 
  getAllProviders,
  ProviderConfig
} from '../services/aiService';

const ApiKeyManager: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(getCurrentProvider());
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({
    gemini: '',
    groq: '',
    huggingface: '',
    ollama: '',
    openrouter: ''
  });
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    groq: false,
    huggingface: false,
    ollama: false,
    openrouter: false
  });
  const [testing, setTesting] = useState<Record<AIProvider, boolean>>({
    gemini: false,
    groq: false,
    huggingface: false,
    ollama: false,
    openrouter: false
  });
  const [keyStatus, setKeyStatus] = useState<Record<AIProvider, 'valid' | 'invalid' | 'untested'>>({
    gemini: 'untested',
    groq: 'untested',
    huggingface: 'untested',
    ollama: 'untested',
    openrouter: 'untested'
  });

  const providers = getAllProviders();

  useEffect(() => {
    // Load existing keys from localStorage
    const savedKeys: Record<AIProvider, string> = {
      gemini: localStorage.getItem('gemini_api_key') || '',
      groq: localStorage.getItem('groq_api_key') || '',
      huggingface: localStorage.getItem('huggingface_api_key') || '',
      ollama: localStorage.getItem('ollama_api_key') || '',
      openrouter: localStorage.getItem('openrouter_api_key') || ''
    };
    setApiKeys(savedKeys);
    
    // Test existing keys
    Object.entries(savedKeys).forEach(([provider, key]) => {
      if (key || !providers[provider as AIProvider].requiresKey) {
        testAndSetStatus(provider as AIProvider, key);
      }
    });
  }, [providers]);

  const testAndSetStatus = async (provider: AIProvider, key: string) => {
    const config = providers[provider];
    
    // For local providers that don't require keys
    if (!config.requiresKey) {
      setTesting(prev => ({ ...prev, [provider]: true }));
      try {
        const isValid = await testApiKey(provider, '');
        setKeyStatus(prev => ({ ...prev, [provider]: isValid ? 'valid' : 'invalid' }));
      } catch (error) {
        setKeyStatus(prev => ({ ...prev, [provider]: 'invalid' }));
      } finally {
        setTesting(prev => ({ ...prev, [provider]: false }));
      }
      return;
    }

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
    const config = providers[provider];
    
    // For local providers, just test connection
    if (!config.requiresKey) {
      await testAndSetStatus(provider, '');
      return;
    }

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
    const config = providers[provider];
    const isValidProvider = config.requiresKey ? keyStatus[provider] === 'valid' : keyStatus[provider] === 'valid';
    
    if (isValidProvider) {
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
        {(Object.entries(providers) as [AIProvider, ProviderConfig][]).map(([provider, config]) => (
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
              {config.requiresKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key ({config.keyPrefix}...)
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
              )}

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
                  {config.requiresKey ? 
                    (apiKeys[provider] ? 'Save & Test' : 'Remove') : 
                    'Test Connection'
                  }
                </button>
                
                {((config.requiresKey && keyStatus[provider] === 'valid') || (!config.requiresKey && keyStatus[provider] === 'valid')) && 
                 currentProvider !== provider && (
                  <button
                    onClick={() => handleSwitchProvider(provider)}
                    className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors"
                  >
                    Switch to this
                  </button>
                )}
              </div>

              {config.setupUrl && (
                <details className="text-xs text-gray-500">
                  <summary className="cursor-pointer hover:text-gray-700">Setup Guide</summary>
                  <div className="mt-2 p-3 bg-gray-50 rounded">
                    <div className="space-y-2">
                      {config.isLocal ? (
                        <div>
                          <p className="font-medium">Local Setup:</p>
                          <p>1. Install {config.name} on your machine</p>
                          <p>2. Start the local server</p>
                          <p>3. Make sure it's running on the default port</p>
                        </div>
                      ) : (
                        <div>
                          <p className="font-medium">API Key Setup:</p>
                          <p>1. Visit the provider's website</p>
                          <p>2. Create an account and generate an API key</p>
                          <p>3. Copy the key starting with '{config.keyPrefix}'</p>
                        </div>
                      )}
                    </div>
                    <a 
                      href={config.setupUrl} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:text-blue-700 text-sm mt-2 inline-block"
                    >
                      Visit {config.name} →
                    </a>
                  </div>
                </details>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ApiKeyManager;
