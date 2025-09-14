import { useState, useEffect } from 'react';
import { User, onAuthStateChange, signInWithGoogle, signOut } from './services/firebaseService';
import { getCurrentProvider, getProviderConfig } from './services/aiService';
import SettingsView from './components/SettingsView';
import ApiKeyWarning from './components/ApiKeyWarning';
import EnhancedApiKeyManager from './components/EnhancedApiKeyManager';
import AIPlayground from './components/AIPlayground';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [currentView, setCurrentView] = useState<'playground' | 'setup'>('playground');

  const currentProvider = getCurrentProvider();
  const providerConfig = getProviderConfig(currentProvider);

  useEffect(() => {
    const unsubscribe = onAuthStateChange((user) => {
      setUser(user);
      setLoading(false);
    });

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

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center">
        <div className="text-lg">Loading...</div>
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
      </main>

      <SettingsView 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
