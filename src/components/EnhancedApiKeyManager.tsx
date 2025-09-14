import React, { useState, useEffect } from 'react';
import { 
  testApiKey, 
  setAIConfig, 
  getCurrentProvider, 
  AIProvider, 
  getAllProviders, 
  getCurrentModel,
  setSelectedModel,
  ProviderConfig
} from '../services/aiService';

const EnhancedApiKeyManager: React.FC = () => {
  const [currentProvider, setCurrentProvider] = useState<AIProvider>(getCurrentProvider());
  const [selectedModels, setSelectedModels] = useState<Record<AIProvider, string>>({} as Record<AIProvider, string>);
  const [apiKeys, setApiKeys] = useState<Record<AIProvider, string>>({} as Record<AIProvider, string>);
  const [showKeys, setShowKeys] = useState<Record<AIProvider, boolean>>({} as Record<AIProvider, boolean>);
  const [testing, setTesting] = useState<Record<AIProvider, boolean>>({} as Record<AIProvider, boolean>);
  const [keyStatus, setKeyStatus] = useState<Record<AIProvider, 'valid' | 'invalid' | 'untested'>>({} as Record<AIProvider, 'valid' | 'invalid' | 'untested'>);

  const providers = getAllProviders();

  useEffect(() => {
    // Initialize states for all providers
    const initialKeys: Record<AIProvider, string> = {} as Record<AIProvider, string>;
    const initialShowKeys: Record<AIProvider, boolean> = {} as Record<AIProvider, boolean>;
    const initialTesting: Record<AIProvider, boolean> = {} as Record<AIProvider, boolean>;
    const initialKeyStatus: Record<AIProvider, 'valid' | 'invalid' | 'untested'> = {} as Record<AIProvider, 'valid' | 'invalid' | 'untested'>;
    const initialSelectedModels: Record<AIProvider, string> = {} as Record<AIProvider, string>;

    Object.keys(providers).forEach(provider => {
      const p = provider as AIProvider;
      const config = providers[p];
      
      // Load existing keys from localStorage
      initialKeys[p] = localStorage.getItem(`${p}_api_key`) || '';
      initialShowKeys[p] = false;
      initialTesting[p] = false;
      initialKeyStatus[p] = 'untested';
      
      // Load selected model or set default
      const savedModel = localStorage.getItem(`${p}_selected_model`);
      const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
      initialSelectedModels[p] = savedModel || defaultModel?.id || '';
    });

    setApiKeys(initialKeys);
    setShowKeys(initialShowKeys);
    setTesting(initialTesting);
    setKeyStatus(initialKeyStatus);
    setSelectedModels(initialSelectedModels);
    
    // Test existing keys
    Object.entries(initialKeys).forEach(([provider, key]) => {
      if (key || !providers[provider as AIProvider].requiresKey) {
        testAndSetStatus(provider as AIProvider, key);
      }
    });

    // Load current model
    const currentModel = getCurrentModel();
    if (currentModel && initialSelectedModels[currentProvider] !== currentModel) {
      setSelectedModels(prev => ({ ...prev, [currentProvider]: currentModel }));
    }
  }, []);

  const testAndSetStatus = async (provider: AIProvider, key: string) => {
    const config = providers[provider];
    
    // For local providers that don't require keys, just test connection
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

  const handleModelChange = (provider: AIProvider, modelId: string) => {
    setSelectedModels(prev => ({ ...prev, [provider]: modelId }));
    setSelectedModel(provider, modelId);
    
    // If this is the current provider, update the global selection
    if (provider === currentProvider) {
      setSelectedModel(provider, modelId);
    }
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
      setAIConfig(provider, apiKeys[provider], selectedModels[provider]);
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

  const getStatusText = (status: 'valid' | 'invalid' | 'untested', isLocal = false) => {
    switch (status) {
      case 'valid': return isLocal ? '✓ Connected' : '✓ Valid';
      case 'invalid': return isLocal ? '✗ Not running' : '✗ Invalid';
      default: return isLocal ? '○ Not tested' : '○ Not tested';
    }
  };

  const getProviderTypeIcon = (config: ProviderConfig) => {
    if (config.isLocal) return '🏠';
    if (!config.requiresKey) return '🆓';
    return '☁️';
  };

  const getProviderTypeBadge = (config: ProviderConfig) => {
    if (config.isLocal) return 'Local';
    if (!config.requiresKey) return 'Free';
    return 'Cloud';
  };

  return (
    <div className="space-y-6">
      <div className="text-center">
        <h2 className="text-2xl font-bold text-gray-800 mb-2">Enhanced AI Provider Settings</h2>
        <p className="text-gray-600">Configure AI providers, models, and API keys. Mix local and cloud providers for optimal flexibility!</p>
      </div>

      <div className="grid gap-6">
        {(Object.entries(providers) as [AIProvider, ProviderConfig][]).map(([provider, config]) => (
          <div
            key={provider}
            className={`border-2 rounded-lg p-6 transition-all ${
              currentProvider === provider
                ? 'border-blue-500 bg-blue-50'
                : 'border-gray-200 hover:border-gray-300'
            }`}
          >
            <div className="flex items-start justify-between mb-4">
              <div className="flex items-center gap-3">
                <div className="text-2xl">{getProviderTypeIcon(config)}</div>
                <div>
                  <div className="flex items-center gap-2 mb-1">
                    <h3 className="text-lg font-semibold text-gray-800">{config.name}</h3>
                    <span className={`text-xs px-2 py-1 rounded-full ${
                      config.isLocal ? 'bg-green-100 text-green-800' :
                      !config.requiresKey ? 'bg-blue-100 text-blue-800' :
                      'bg-gray-100 text-gray-800'
                    }`}>
                      {getProviderTypeBadge(config)}
                    </span>
                    {currentProvider === provider && (
                      <span className="bg-blue-500 text-white px-2 py-1 rounded text-xs font-medium">
                        ACTIVE
                      </span>
                    )}
                  </div>
                  <p className="text-sm text-gray-600">{config.description}</p>
                </div>
              </div>
            </div>

            <div className="space-y-4">
              {/* Model Selection */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Model Selection
                </label>
                <select
                  value={selectedModels[provider] || ''}
                  onChange={(e) => handleModelChange(provider, e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  {config.models.map((model) => (
                    <option key={model.id} value={model.id}>
                      {model.name} - {model.description}
                    </option>
                  ))}
                </select>
                
                {/* Model info */}
                {selectedModels[provider] && (() => {
                  const selectedModel = config.models.find(m => m.id === selectedModels[provider]);
                  return selectedModel ? (
                    <div className="mt-2 p-3 bg-gray-50 rounded-md">
                      <div className="text-sm">
                        <div className="font-medium text-gray-800 mb-1">Strengths:</div>
                        <div className="flex flex-wrap gap-1 mb-2">
                          {selectedModel.strengths.map((strength, idx) => (
                            <span key={idx} className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                              {strength}
                            </span>
                          ))}
                        </div>
                        {selectedModel.contextLength && (
                          <div className="text-xs text-gray-600">
                            Context Length: {selectedModel.contextLength.toLocaleString()} tokens
                          </div>
                        )}
                      </div>
                    </div>
                  ) : null;
                })()}
              </div>

              {/* API Key Input (only for providers that require keys) */}
              {config.requiresKey && (
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    API Key ({config.keyPrefix}...)
                  </label>
                  <div className="relative">
                    <input
                      type={showKeys[provider] ? 'text' : 'password'}
                      value={apiKeys[provider] || ''}
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

              {/* Status and Actions */}
              <div className="flex items-center justify-between">
                <span className={`text-sm font-medium ${getStatusColor(keyStatus[provider])}`}>
                  {testing[provider] ? '⏳ Testing...' : getStatusText(keyStatus[provider], config.isLocal)}
                </span>
                
                {config.isLocal && keyStatus[provider] === 'invalid' && (
                  <div className="text-xs text-orange-600">
                    Make sure {config.name} is running locally
                  </div>
                )}
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

              {/* Setup Guide */}
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

      {/* Usage Tips */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-6 border border-blue-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Pro Tips</h3>
        <div className="grid md:grid-cols-2 gap-4 text-sm text-gray-700">
          <div>
            <h4 className="font-medium mb-2">🏠 Local Providers</h4>
            <ul className="space-y-1 text-xs">
              <li>• No API costs - run models on your machine</li>
              <li>• Perfect for privacy-sensitive tasks</li>
              <li>• Works offline once models are downloaded</li>
              <li>• Great for development and experimentation</li>
            </ul>
          </div>
          <div>
            <h4 className="font-medium mb-2">☁️ Cloud Providers</h4>
            <ul className="space-y-1 text-xs">
              <li>• Latest models with cutting-edge capabilities</li>
              <li>• Fast inference without hardware requirements</li>
              <li>• Mix free tiers with paid options</li>
              <li>• Switch between providers based on your needs</li>
            </ul>
          </div>
        </div>
        <div className="mt-4 p-3 bg-white rounded border-l-4 border-blue-500">
          <p className="text-sm">
            <strong>BYOK Security:</strong> Your API keys are stored locally in your browser and never sent to our servers. 
            Each provider is called directly from your browser for maximum security and privacy.
          </p>
        </div>
      </div>
    </div>
  );
};

export default EnhancedApiKeyManager;
