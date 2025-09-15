import React, { useState, useEffect } from 'react';
import { firebaseConfigService, FirebaseConfig, WhitelistConfig } from '../services/firebaseConfig';

interface FirebaseSetupWizardProps {
  isOpen: boolean;
  onClose: () => void;
  onComplete: (config: FirebaseConfig) => void;
}

interface SetupStep {
  id: string;
  title: string;
  description: string;
  component: React.ComponentType<any>;
}

const FirebaseSetupWizard: React.FC<FirebaseSetupWizardProps> = ({
  isOpen,
  onClose,
  onComplete
}) => {
  const [currentStep, setCurrentStep] = useState(0);
  const [config, setConfig] = useState<FirebaseConfig>({
    apiKey: '',
    authDomain: '',
    projectId: '',
    storageBucket: '',
    messagingSenderId: '',
    appId: ''
  });
  const [whitelistConfig, setWhitelistConfig] = useState<WhitelistConfig>({
    allowedDomains: [],
    allowedEmails: [],
    allowNewUsers: true,
    requireApproval: false
  });
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const steps: SetupStep[] = [
    {
      id: 'welcome',
      title: 'Welcome to Firebase Setup',
      description: 'Let\'s configure your Firebase project for the BYOK system',
      component: WelcomeStep
    },
    {
      id: 'config',
      title: 'Firebase Configuration',
      description: 'Enter your Firebase project configuration',
      component: ConfigStep
    },
    {
      id: 'whitelist',
      title: 'Whitelist Settings',
      description: 'Configure who can access your system',
      component: WhitelistStep
    },
    {
      id: 'verify',
      title: 'Verify Setup',
      description: 'Test your configuration',
      component: VerifyStep
    }
  ];

  const handleNext = () => {
    if (currentStep < steps.length - 1) {
      setCurrentStep(currentStep + 1);
    }
  };

  const handlePrevious = () => {
    if (currentStep > 0) {
      setCurrentStep(currentStep - 1);
    }
  };

  const handleComplete = async () => {
    setIsLoading(true);
    setError(null);

    try {
      // Validate configuration
      if (!firebaseConfigService.validateConfig(config)) {
        throw new Error('Invalid Firebase configuration');
      }

      // Initialize Firebase
      firebaseConfigService.initializeFirebase(config);
      firebaseConfigService.saveConfig(config);

      // Setup whitelist if enabled
      await firebaseConfigService.setupFirebaseWithWhitelist({
        projectName: 'BYOK Firebase System',
        enableWhitelist: true,
        whitelistConfig,
        createSampleData: true
      });

      onComplete(config);
      onClose();
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Setup failed');
    } finally {
      setIsLoading(false);
    }
  };

  const CurrentStepComponent = steps[currentStep].component;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto">
      <div className="flex items-center justify-center min-h-screen px-4 pt-4 pb-20 text-center sm:block sm:p-0">
        <div className="fixed inset-0 transition-opacity bg-gray-500 bg-opacity-75" onClick={onClose} />

        <div className="inline-block w-full max-w-2xl p-6 my-8 overflow-hidden text-left align-middle transition-all transform bg-white shadow-xl rounded-2xl">
          {/* Progress indicator */}
          <div className="mb-6">
            <div className="flex justify-between items-center mb-2">
              <h2 className="text-2xl font-bold text-gray-900">Firebase Setup Wizard</h2>
              <span className="text-sm text-gray-500">
                Step {currentStep + 1} of {steps.length}
              </span>
            </div>
            <div className="w-full bg-gray-200 rounded-full h-2">
              <div
                className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
              />
            </div>
          </div>

          {/* Step content */}
          <div className="mb-6">
            <CurrentStepComponent
              config={config}
              setConfig={setConfig}
              whitelistConfig={whitelistConfig}
              setWhitelistConfig={setWhitelistConfig}
              error={error}
            />
          </div>

          {/* Navigation buttons */}
          <div className="flex justify-between">
            <button
              onClick={handlePrevious}
              disabled={currentStep === 0}
              className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50 disabled:opacity-50"
            >
              Previous
            </button>

            <div className="flex space-x-3">
              <button
                onClick={onClose}
                className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
              >
                Cancel
              </button>
              
              {currentStep < steps.length - 1 ? (
                <button
                  onClick={handleNext}
                  className="px-4 py-2 text-sm font-medium text-white bg-blue-600 rounded-md hover:bg-blue-700"
                >
                  Next
                </button>
              ) : (
                <button
                  onClick={handleComplete}
                  disabled={isLoading}
                  className="px-4 py-2 text-sm font-medium text-white bg-green-600 rounded-md hover:bg-green-700 disabled:opacity-50"
                >
                  {isLoading ? 'Setting up...' : 'Complete Setup'}
                </button>
              )}
            </div>
          </div>

          {error && (
            <div className="mt-4 p-3 bg-red-50 border border-red-200 rounded-md">
              <p className="text-sm text-red-600">{error}</p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

// Welcome step component
const WelcomeStep: React.FC<any> = () => (
  <div className="text-center">
    <div className="mx-auto flex items-center justify-center h-12 w-12 rounded-full bg-blue-100 mb-4">
      <svg className="h-6 w-6 text-blue-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
        <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 10V3L4 14h7v7l9-11h-7z" />
      </svg>
    </div>
    <h3 className="text-lg font-medium text-gray-900 mb-2">Welcome to Firebase Setup</h3>
    <p className="text-sm text-gray-600 mb-4">
      This wizard will help you configure Firebase for your BYOK (Bring Your Own Key) system.
      You'll need your Firebase project configuration and can optionally set up user whitelisting.
    </p>
    <div className="bg-blue-50 p-4 rounded-md">
      <h4 className="text-sm font-medium text-blue-900 mb-2">What you'll need:</h4>
      <ul className="text-sm text-blue-700 space-y-1">
        <li>• Firebase project configuration (from Firebase Console)</li>
        <li>• Optional: List of allowed email domains or specific emails</li>
        <li>• Optional: Service account key for admin features</li>
      </ul>
    </div>
  </div>
);

// Configuration step component
const ConfigStep: React.FC<any> = ({ config, setConfig, error }) => {
  const [showHelp, setShowHelp] = useState(false);

  const handleInputChange = (field: keyof FirebaseConfig, value: string) => {
    setConfig({ ...config, [field]: value });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Firebase Configuration</h3>
      
      <div className="mb-4">
        <button
          onClick={() => setShowHelp(!showHelp)}
          className="text-sm text-blue-600 hover:text-blue-800 flex items-center"
        >
          <svg className="h-4 w-4 mr-1" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
          </svg>
          How to get Firebase configuration
        </button>
        
        {showHelp && (
          <div className="mt-2 p-3 bg-gray-50 rounded-md text-sm text-gray-600">
            <ol className="list-decimal list-inside space-y-1">
              <li>Go to <a href="https://console.firebase.google.com" className="text-blue-600 underline" target="_blank" rel="noopener noreferrer">Firebase Console</a></li>
              <li>Select your project or create a new one</li>
              <li>Click "Project settings" (gear icon)</li>
              <li>Scroll down to "Your apps" section</li>
              <li>Copy the configuration values from the SDK snippet</li>
            </ol>
          </div>
        )}
      </div>

      <div className="space-y-4">
        {Object.keys(config).map((key) => (
          <div key={key}>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              {key.replace(/([A-Z])/g, ' $1').replace(/^./, str => str.toUpperCase())}
            </label>
            <input
              type="text"
              value={config[key as keyof FirebaseConfig]}
              onChange={(e) => handleInputChange(key as keyof FirebaseConfig, e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder={`Enter your ${key}`}
            />
          </div>
        ))}
      </div>
    </div>
  );
};

// Whitelist step component
const WhitelistStep: React.FC<any> = ({ whitelistConfig, setWhitelistConfig }) => {
  const [newDomain, setNewDomain] = useState('');
  const [newEmail, setNewEmail] = useState('');

  const addDomain = () => {
    if (newDomain && !whitelistConfig.allowedDomains.includes(newDomain)) {
      setWhitelistConfig({
        ...whitelistConfig,
        allowedDomains: [...whitelistConfig.allowedDomains, newDomain]
      });
      setNewDomain('');
    }
  };

  const addEmail = () => {
    if (newEmail && !whitelistConfig.allowedEmails.includes(newEmail)) {
      setWhitelistConfig({
        ...whitelistConfig,
        allowedEmails: [...whitelistConfig.allowedEmails, newEmail]
      });
      setNewEmail('');
    }
  };

  const removeDomain = (domain: string) => {
    setWhitelistConfig({
      ...whitelistConfig,
      allowedDomains: whitelistConfig.allowedDomains.filter(d => d !== domain)
    });
  };

  const removeEmail = (email: string) => {
    setWhitelistConfig({
      ...whitelistConfig,
      allowedEmails: whitelistConfig.allowedEmails.filter(e => e !== email)
    });
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Whitelist Settings</h3>
      
      <div className="space-y-6">
        {/* Allow new users */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={whitelistConfig.allowNewUsers}
              onChange={(e) => setWhitelistConfig({ ...whitelistConfig, allowNewUsers: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Allow new users to register</span>
          </label>
        </div>

        {/* Require approval */}
        <div>
          <label className="flex items-center">
            <input
              type="checkbox"
              checked={whitelistConfig.requireApproval}
              onChange={(e) => setWhitelistConfig({ ...whitelistConfig, requireApproval: e.target.checked })}
              className="mr-2"
            />
            <span className="text-sm text-gray-700">Require admin approval for new users</span>
          </label>
        </div>

        {/* Allowed domains */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Domains</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="text"
              value={newDomain}
              onChange={(e) => setNewDomain(e.target.value)}
              placeholder="example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={addDomain}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {whitelistConfig.allowedDomains.map(domain => (
              <span key={domain} className="px-3 py-1 bg-blue-100 text-blue-800 rounded-full text-sm">
                {domain}
                <button
                  onClick={() => removeDomain(domain)}
                  className="ml-2 text-blue-600 hover:text-blue-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>

        {/* Allowed emails */}
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-2">Allowed Emails</label>
          <div className="flex space-x-2 mb-2">
            <input
              type="email"
              value={newEmail}
              onChange={(e) => setNewEmail(e.target.value)}
              placeholder="user@example.com"
              className="flex-1 px-3 py-2 border border-gray-300 rounded-md"
            />
            <button
              onClick={addEmail}
              className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
            >
              Add
            </button>
          </div>
          <div className="flex flex-wrap gap-2">
            {whitelistConfig.allowedEmails.map(email => (
              <span key={email} className="px-3 py-1 bg-green-100 text-green-800 rounded-full text-sm">
                {email}
                <button
                  onClick={() => removeEmail(email)}
                  className="ml-2 text-green-600 hover:text-green-800"
                >
                  ×
                </button>
              </span>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
};

// Verify step component
const VerifyStep: React.FC<any> = ({ config }) => {
  const [isTesting, setIsTesting] = useState(false);
  const [testResult, setTestResult] = useState<string | null>(null);

  const testConfiguration = async () => {
    setIsTesting(true);
    setTestResult(null);

    try {
      if (!firebaseConfigService.validateConfig(config)) {
        throw new Error('Invalid configuration');
      }

      // Test Firebase initialization
      firebaseConfigService.initializeFirebase(config);
      setTestResult('✅ Firebase configuration is valid');
    } catch (error) {
      setTestResult(`❌ ${error instanceof Error ? error.message : 'Configuration test failed'}`);
    } finally {
      setIsTesting(false);
    }
  };

  return (
    <div>
      <h3 className="text-lg font-medium text-gray-900 mb-4">Verify Setup</h3>
      
      <div className="bg-gray-50 p-4 rounded-md mb-4">
        <h4 className="text-sm font-medium text-gray-900 mb-2">Configuration Summary:</h4>
        <div className="text-sm text-gray-600 space-y-1">
          <p><strong>Project ID:</strong> {config.projectId}</p>
          <p><strong>Auth Domain:</strong> {config.authDomain}</p>
          <p><strong>Configuration:</strong> {firebaseConfigService.validateConfig(config) ? 'Valid' : 'Invalid'}</p>
        </div>
      </div>

      <button
        onClick={testConfiguration}
        disabled={isTesting}
        className="w-full px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 disabled:opacity-50"
      >
        {isTesting ? 'Testing...' : 'Test Configuration'}
      </button>

      {testResult && (
        <div className={`mt-4 p-3 rounded-md text-sm ${
          testResult.startsWith('✅') ? 'bg-green-50 text-green-800' : 'bg-red-50 text-red-800'
        }`}>
          {testResult}
        </div>
      )}
    </div>
  );
};

export default FirebaseSetupWizard;

  const validateConfig = (config: FirebaseConfig): ValidationResult => {
    const errors: string[] = [];
    const warnings: string[] = [];

    // Validate required fields
    if (!config.apiKey) errors.push('API Key is required');
    if (!config.authDomain) errors.push('Auth Domain is required');
    if (!config.projectId) errors.push('Project ID is required');
    if (!config.storageBucket) warnings.push('Storage Bucket is recommended');
    if (!config.messagingSenderId) warnings.push('Messaging Sender ID is recommended');
    if (!config.appId) warnings.push('App ID is recommended');

    return {
      isValid: errors.length === 0,
      errors,
      warnings
    };
  };

  const handleDomainAdd = () => {
    const domain = newDomain.trim().toLowerCase();
    if (domain && !whitelistConfig.allowedDomains.includes(domain)) {
      if (isValidDomain(domain)) {
        setWhitelistConfig(prev => ({
          ...prev,
          allowedDomains: [...prev.allowedDomains, domain]
        }));
        setNewDomain('');
      }
    }
  };

  const handleDomainRemove = (domainToRemove: string) => {
    setWhitelistConfig(prev => ({
      ...prev,
      allowedDomains: prev.allowedDomains.filter((d: string) => d !== domainToRemove)
    }));
  };

  const handleEmailAdd = () => {
    const email = newEmail.trim().toLowerCase();
    if (email && !whitelistConfig.allowedEmails.includes(email)) {
      if (isValidEmail(email)) {
        setWhitelistConfig(prev => ({
          ...prev,
          allowedEmails: [...prev.allowedEmails, email]
        }));
        setNewEmail('');
      }
    }
  };

  const handleEmailRemove = (emailToRemove: string) => {
    setWhitelistConfig(prev => ({
      ...prev,
      allowedEmails: prev.allowedEmails.filter((e: string) => e !== emailToRemove)
    }));
  };