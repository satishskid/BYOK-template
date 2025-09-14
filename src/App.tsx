import React, { useState, useEffect } from 'react';
import { User, onAuthStateChange, signInWithGoogle, signOut } from './services/firebaseService';
import { hasValidApiKey, generateContent } from './services/aiService';
import SettingsView from './components/SettingsView';
import ApiKeyWarning from './components/ApiKeyWarning';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [showSettings, setShowSettings] = useState(false);
  const [loading, setLoading] = useState(true);
  const [aiResponse, setAiResponse] = useState('');
  const [testPrompt, setTestPrompt] = useState('Hello, how are you?');

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

  const testAI = async () => {
    if (!hasValidApiKey()) {
      setShowSettings(true);
      return;
    }

    try {
      setAiResponse('Generating...');
      const response = await generateContent(testPrompt);
      setAiResponse(response);
    } catch (error: any) {
      setAiResponse(`Error: ${error.message}`);
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
            <h2 className="text-3xl font-bold text-gray-900">Welcome to BYOK AI</h2>
            <p className="mt-2 text-gray-600">Sign in to get started with AI features</p>
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
            <h1 className="text-2xl font-bold text-gray-900">BYOK AI App</h1>
            <div className="flex items-center space-x-4">
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

      <main className="max-w-4xl mx-auto py-6 px-4 sm:px-6 lg:px-8">
        <ApiKeyWarning 
          onOpenSettings={() => setShowSettings(true)}
          className="mb-6"
        />

        <div className="bg-white rounded-lg shadow p-6">
          <h2 className="text-xl font-semibold mb-4">AI Test</h2>
          
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Test Prompt
              </label>
              <textarea
                value={testPrompt}
                onChange={(e) => setTestPrompt(e.target.value)}
                className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                rows={3}
              />
            </div>

            <button
              onClick={testAI}
              disabled={!hasValidApiKey()}
              className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Test AI
            </button>

            {aiResponse && (
              <div className="mt-4 p-4 bg-gray-50 rounded-md">
                <h3 className="font-medium text-gray-900 mb-2">AI Response:</h3>
                <p className="text-gray-700 whitespace-pre-wrap">{aiResponse}</p>
              </div>
            )}
          </div>
        </div>
      </main>

      <SettingsView 
        isOpen={showSettings}
        onClose={() => setShowSettings(false)}
      />
    </div>
  );
}

export default App;
