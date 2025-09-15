import { useState, useEffect } from 'react';
import { User, onAuthStateChange, signInWithGoogle, signOut } from './services/firebaseService';
import { getCurrentProvider, getProviderConfig } from './services/aiService';
import { firebaseConfigService } from './services/firebaseConfig';
import SettingsView from './components/SettingsView';
import ApiKeyWarning from './components/ApiKeyWarning';
import EnhancedApiKeyManager from './components/EnhancedApiKeyManager';
import AIPlayground from './components/AIPlayground';
import FirebaseSetupWizard from './components/FirebaseSetupWizard';
import { AdminDashboard } from './components/AdminDashboard';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [showFirebaseSetup, setShowFirebaseSetup] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'playground' | 'setup' | 'firebase-setup'>('playground');
  const [firebaseConfigured, setFirebaseConfigured] = useState(false);
  const [showAdminDashboard, setShowAdminDashboard] = useState(false);

  const currentProvider = getCurrentProvider();
  const providerConfig = getProviderConfig(currentProvider);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

    // Check if Firebase is already configured
    const savedConfig = firebaseConfigService.loadConfig();
    setFirebaseConfigured(!!savedConfig);

    return () => unsubscribe();
  }, []);

  const handleSignIn = async () => {
    try {
      await signInWithGoogle();
    } catch (error) {
      console.error('Sign in failed:', error);
    }
  };

  const handleSignOut = async () => {
    try {
      await signOut();
    } catch (error) {
      console.error('Sign out failed:', error);
    }
  };

  const handleFirebaseSetupComplete = (config: any) => {
    setFirebaseConfigured(true);
    setShowFirebaseSetup(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
      </div>
    );
  }

  if (!firebaseConfigured) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-2xl w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🔧 Firebase Setup Required</h2>
            <p className="mt-2 text-gray-600">Let's configure Firebase for your BYOK system</p>
          </div>
          <button
            onClick={() => setShowFirebaseSetup(true)}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Configure Firebase
          </button>
        </div>
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50">
        <div className="max-w-md w-full space-y-8 p-8 bg-white rounded-lg shadow">
          <div className="text-center">
            <h2 className="text-3xl font-bold text-gray-900">🔑 Enhanced BYOK AI</h2>
            <p className="mt-2 text-gray-600">Multi-provider AI with local and cloud models</p>
          </div>
          <button
            onClick={handleSignIn}
            className="w-full flex justify-center py-3 px-4 border border-transparent rounded-md shadow-sm text-sm font-medium text-white bg-blue-600 hover:bg-blue-700 transition-colors"
          >
            Sign in with Google
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <header className="bg-white shadow">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center py-6">
            <div className="flex items-center gap-3">
              <h1 className="text-2xl font-bold text-gray-900">🚀 Enhanced BYOK AI</h1>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {providerConfig.name}
              </span>
            </div>
            <div className="flex items-center space-x-4">
              <nav className="flex space-x-4">
                <button
                  onClick={() => setCurrentView('playground')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentView === 'playground' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🤖 Playground
                </button>
                <button
                  onClick={() => setCurrentView('setup')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentView === 'setup' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  ⚙️ Setup
                </button>
                <button
                  onClick={() => setCurrentView('firebase-setup')}
                  className={`px-3 py-2 text-sm rounded-md transition-colors ${
                    currentView === 'firebase-setup' 
                      ? 'bg-blue-100 text-blue-800' 
                      : 'text-gray-500 hover:text-gray-700'
                  }`}
                >
                  🔧 Firebase
                </button>
              </nav>
              <span className="text-sm text-gray-600">
                {user.displayName || user.email}
              </span>
              <button
                onClick={() => setShowSettings(true)}
                className="text-gray-500 hover:text-gray-700 p-2"
                title="Settings"
              >
                ⚙️
              </button>
              <button
                onClick={handleSignOut}
                className="text-gray-500 hover:text-gray-700 text-sm"
              >
                Sign Out
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ApiKeyWarning 
          onOpenSettings={() => setShowSettings(true)}
          className="mb-6"
        />

        {currentView === 'playground' && <AIPlayground />}
        {currentView === 'setup' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <EnhancedApiKeyManager />
            </div>
          </div>
        )}
        {currentView === 'firebase-setup' && (
          <div className="bg-white rounded-lg shadow">
            <div className="p-6">
              <h2 className="text-2xl font-bold mb-4">Firebase Configuration</h2>
              <p className="text-gray-600 mb-4">
                Use the setup wizard below to configure your Firebase project with whitelist support.
              </p>
              <button
                onClick={() => setShowFirebaseSetup(true)}
                className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700"
              >
                Open Setup Wizard
              </button>
            </div>
          </div>
        )}
      </main>

      <SettingsView 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
      
      <FirebaseSetupWizard
        isOpen={showFirebaseSetup}
        onClose={() => setShowFirebaseSetup(false)}
        onComplete={handleFirebaseSetupComplete}
      />
    </div>
  );
}

export default App;

// Add admin dashboard button in header
            <div className="flex items-center space-x-4">
              <button
                onClick={() => setShowAdminDashboard(true)}
                className="inline-flex items-center px-4 py-2 border border-transparent text-sm font-medium rounded-md text-white bg-purple-600 hover:bg-purple-700 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-purple-500"
              >
                Admin Dashboard
              </button>
              <button
                onClick={() => setShowSettings(true)}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Settings
              </button>
              <button
                onClick={handleSignOut}
                className="inline-flex items-center px-4 py-2 border border-gray-300 text-sm font-medium rounded-md text-gray-700 bg-white hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-indigo-500"
              >
                Sign Out
              </button>
            </div>

// Add AdminDashboard modal
      {showAdminDashboard && (
        <AdminDashboard onClose={() => setShowAdminDashboard(false)} />
      )}
