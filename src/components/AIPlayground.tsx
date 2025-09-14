import React, { useState } from 'react';
import { 
  generateContent, 
  getChatResponse, 
  getCurrentProvider, 
  getCurrentModel,
  getProviderConfig,
  hasValidApiKey 
} from '../services/aiService';

const AIPlayground: React.FC = () => {
  const [prompt, setPrompt] = useState('');
  const [response, setResponse] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [chatMessages, setChatMessages] = useState<Array<{role: string, content: string}>>([]);

  const currentProvider = getCurrentProvider();
  const currentModel = getCurrentModel();
  const providerConfig = getProviderConfig(currentProvider);
  const hasKey = hasValidApiKey();

  const handleGenerate = async () => {
    if (!prompt.trim()) return;
    if (!hasKey) {
      setError('Please configure an API key in the settings first.');
      return;
    }

    setIsLoading(true);
    setError(null);
    
    try {
      const result = await generateContent(prompt);
      setResponse(result);
    } catch (err: any) {
      setError(err.message || 'Failed to generate content');
    } finally {
      setIsLoading(false);
    }
  };

  const handleChatSend = async () => {
    if (!prompt.trim()) return;
    if (!hasKey) {
      setError('Please configure an API key in the settings first.');
      return;
    }

    const newMessages = [...chatMessages, { role: 'user', content: prompt }];
    setChatMessages(newMessages);
    setPrompt('');
    setIsLoading(true);
    setError(null);
    
    try {
      const result = await getChatResponse(newMessages);
      setChatMessages([...newMessages, { role: 'assistant', content: result }]);
    } catch (err: any) {
      setError(err.message || 'Failed to get chat response');
    } finally {
      setIsLoading(false);
    }
  };

  const clearChat = () => {
    setChatMessages([]);
    setResponse('');
    setError(null);
  };

  const examplePrompts = [
    "Explain quantum computing in simple terms",
    "Write a Python function to reverse a string",
    "What are the benefits of using local AI models?",
    "Compare different AI providers and their strengths",
    "Help me debug this JavaScript code: console.log('Hello World')"
  ];

  const handleExampleClick = (example: string) => {
    setPrompt(example);
  };

  return (
    <div className="max-w-4xl mx-auto p-6 space-y-6">
      {/* Header */}
      <div className="text-center">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">🤖 AI Playground</h1>
        <p className="text-gray-600">Test your AI providers and explore different models</p>
      </div>

      {/* Current Provider Info */}
      <div className="bg-gradient-to-r from-blue-50 to-purple-50 rounded-lg p-4 border border-blue-200">
        <div className="flex items-center justify-between">
          <div>
            <div className="flex items-center gap-2 mb-1">
              <span className="text-lg">{providerConfig.isLocal ? '🏠' : '☁️'}</span>
              <span className="font-semibold text-gray-800">{providerConfig.name}</span>
              <span className="text-sm bg-blue-100 text-blue-800 px-2 py-1 rounded">
                {currentModel}
              </span>
            </div>
            <p className="text-sm text-gray-600">{providerConfig.description}</p>
          </div>
          <div className={`px-3 py-1 rounded-full text-sm font-medium ${
            hasKey ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
          }`}>
            {hasKey ? '✓ Ready' : '✗ No Key'}
          </div>
        </div>
      </div>

      {/* Error Display */}
      {error && (
        <div className="bg-red-50 border border-red-200 rounded-lg p-4">
          <div className="flex">
            <div className="flex-shrink-0">
              <span className="text-red-400">⚠️</span>
            </div>
            <div className="ml-3">
              <h3 className="text-sm font-medium text-red-800">Error</h3>
              <div className="mt-2 text-sm text-red-700">{error}</div>
            </div>
          </div>
        </div>
      )}

      {/* Example Prompts */}
      <div className="bg-white rounded-lg border border-gray-200 p-4">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">💡 Example Prompts</h3>
        <div className="grid gap-2">
          {examplePrompts.map((example, idx) => (
            <button
              key={idx}
              onClick={() => handleExampleClick(example)}
              className="text-left p-3 text-sm bg-gray-50 hover:bg-gray-100 rounded-md transition-colors border border-gray-200"
            >
              {example}
            </button>
          ))}
        </div>
      </div>

      {/* Input Section */}
      <div className="bg-white rounded-lg border border-gray-200 p-6">
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Your Prompt
            </label>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder="Ask anything... Try different providers to compare responses!"
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-blue-500 focus:border-blue-500 resize-none"
              rows={4}
            />
          </div>
          
          <div className="flex gap-3">
            <button
              onClick={handleGenerate}
              disabled={isLoading || !hasKey}
              className="flex-1 bg-blue-500 text-white py-2 px-4 rounded-md hover:bg-blue-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Generating...' : '✨ Generate Response'}
            </button>
            
            <button
              onClick={handleChatSend}
              disabled={isLoading || !hasKey}
              className="flex-1 bg-green-500 text-white py-2 px-4 rounded-md hover:bg-green-600 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isLoading ? '⏳ Sending...' : '💬 Add to Chat'}
            </button>
            
            <button
              onClick={clearChat}
              className="bg-gray-500 text-white py-2 px-4 rounded-md hover:bg-gray-600 transition-colors"
            >
              🗑️ Clear
            </button>
          </div>
        </div>
      </div>

      {/* Response Display */}
      {response && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">🤖 AI Response</h3>
          <div className="bg-gray-50 rounded-md p-4">
            <pre className="whitespace-pre-wrap text-sm text-gray-700 font-mono">
              {response}
            </pre>
          </div>
        </div>
      )}

      {/* Chat History */}
      {chatMessages.length > 0 && (
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-800 mb-3">💬 Chat History</h3>
          <div className="space-y-4 max-h-96 overflow-y-auto">
            {chatMessages.map((message, idx) => (
              <div key={idx} className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}>
                <div className={`max-w-3xl px-4 py-2 rounded-lg ${
                  message.role === 'user' 
                    ? 'bg-blue-500 text-white' 
                    : 'bg-gray-100 text-gray-800'
                }`}>
                  <div className="text-xs opacity-75 mb-1">
                    {message.role === 'user' ? '👤 You' : `🤖 ${providerConfig.name}`}
                  </div>
                  <div className="text-sm whitespace-pre-wrap">{message.content}</div>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}

      {/* Feature Showcase */}
      <div className="bg-gradient-to-r from-purple-50 to-pink-50 rounded-lg p-6 border border-purple-200">
        <h3 className="text-lg font-semibold text-gray-800 mb-3">🚀 Enhanced BYOK Features</h3>
        <div className="grid md:grid-cols-3 gap-4 text-sm">
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-lg mb-2">🔄</div>
            <h4 className="font-medium mb-2">Multi-Provider Support</h4>
            <p className="text-gray-600">Switch between Gemini, Groq, HuggingFace, Ollama, and OpenRouter seamlessly.</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-lg mb-2">🎯</div>
            <h4 className="font-medium mb-2">Model Selection</h4>
            <p className="text-gray-600">Choose specific models like Llama 3.3, Gemma 2, Phi-3, and more based on your needs.</p>
          </div>
          <div className="bg-white p-4 rounded-lg border">
            <div className="text-lg mb-2">🏠</div>
            <h4 className="font-medium mb-2">Local & Cloud Mix</h4>
            <p className="text-gray-600">Combine local models (Ollama) with cloud providers for optimal flexibility and privacy.</p>
          </div>
        </div>
      </div>
    </div>
  );
};

export default AIPlayground;
