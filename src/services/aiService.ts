import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// AI Provider types
export type AIProvider = 'gemini' | 'groq' | 'huggingface' | 'ollama' | 'openrouter';

// Model configuration for each provider
export interface ModelConfig {
  id: string;
  name: string;
  description: string;
  strengths: string[];
  contextLength?: number;
  isDefault?: boolean;
}

export interface ProviderConfig {
  name: string;
  description: string;
  keyPrefix: string;
  testPrompt: string;
  requiresKey: boolean;
  models: ModelConfig[];
  setupUrl?: string;
  isLocal?: boolean;
  setupInstructions: string[];
}

// Enhanced provider configuration with multiple models and setup instructions
const PROVIDERS_CONFIG: Record<AIProvider, ProviderConfig> = {
  gemini: {
    name: "Google Gemini",
    description: "Google's most capable AI model with strong reasoning and multimodal capabilities",
    keyPrefix: "AIza",
    testPrompt: "Respond with exactly 'test successful' if you can process this.",
    requiresKey: true,
    setupUrl: "https://aistudio.google.com",
    setupInstructions: [
      "Visit https://aistudio.google.com",
      "Sign in with your Google account",
      "Click 'Get API key' in the left sidebar",
      "Create a new API key (starts with 'AIza')",
      "Copy the key and paste it below"
    ],
    models: [
      {
        id: "gemini-2.0-flash-exp",
        name: "Gemini 2.0 Flash (Experimental)",
        description: "Latest experimental model with enhanced speed and capabilities",
        strengths: ["Fast responses", "Latest features", "Multimodal"],
        contextLength: 1000000,
        isDefault: true
      },
      {
        id: "gemini-1.5-pro-latest",
        name: "Gemini 1.5 Pro",
        description: "Most capable production model for complex reasoning",
        strengths: ["Complex reasoning", "Long context", "Code generation"],
        contextLength: 2000000
      },
      {
        id: "gemini-1.5-flash",
        name: "Gemini 1.5 Flash",
        description: "Fast and efficient model for most tasks",
        strengths: ["Speed", "Efficiency", "General purpose"],
        contextLength: 1000000
      }
    ]
  },
  groq: {
    name: "Groq",
    description: "Ultra-fast AI inference with open-source models",
    keyPrefix: "gsk_",
    testPrompt: "Respond with exactly 'test successful' if you can process this.",
    requiresKey: true,
    setupUrl: "https://console.groq.com",
    setupInstructions: [
      "Visit https://console.groq.com",
      "Sign up for a free account",
      "Go to API Keys section",
      "Create a new API key (starts with 'gsk_')",
      "Copy the key and paste it below"
    ],
    models: [
      {
        id: "llama-3.3-70b-versatile",
        name: "Llama 3.3 70B",
        description: "Most capable Llama model with excellent reasoning",
        strengths: ["Complex reasoning", "Instruction following", "Math and code"],
        contextLength: 32768,
        isDefault: true
      },
      {
        id: "llama-3.1-8b-instant",
        name: "Llama 3.1 8B Instant",
        description: "Fast and efficient model for quick responses",
        strengths: ["Speed", "Efficiency", "Chat"],
        contextLength: 131072
      },
      {
        id: "gemma2-9b-it",
        name: "Gemma 2 9B",
        description: "Google's open model optimized for instruction following",
        strengths: ["Instruction following", "Safety", "Efficient"],
        contextLength: 8192
      },
      {
        id: "phi-3-medium-4k-instruct",
        name: "Phi-3 Medium",
        description: "Microsoft's compact model with strong performance",
        strengths: ["Efficiency", "Reasoning", "Code"],
        contextLength: 4096
      }
    ]
  },
  huggingface: {
    name: "Hugging Face",
    description: "Access to various open-source models via Hugging Face Inference API",
    keyPrefix: "hf_",
    testPrompt: "Respond with exactly 'test successful' if you can process this.",
    requiresKey: true,
    setupUrl: "https://huggingface.co/settings/tokens",
    setupInstructions: [
      "Visit https://huggingface.co/settings/tokens",
      "Sign in with your Hugging Face account",
      "Click 'New token' to create a new API token",
      "Give your token a name and select 'Read' scope",
      "Copy the token (starts with 'hf_') and paste it below"
    ],
    models: [
      {
        id: "meta-llama/Llama-3.2-3B-Instruct",
        name: "Llama 3.2 3B Instruct",
        description: "Compact instruction-tuned model for efficient inference",
        strengths: ["Efficiency", "Instruction following", "Low resource"],
        contextLength: 131072,
        isDefault: true
      },
      {
        id: "microsoft/Phi-3.5-mini-instruct",
        name: "Phi-3.5 Mini",
        description: "Microsoft's small but capable instruction model",
        strengths: ["Compact", "Fast", "Reasoning"],
        contextLength: 131072
      },
      {
        id: "google/gemma-2-2b-it",
        name: "Gemma 2 2B",
        description: "Google's lightweight instruction-tuned model",
        strengths: ["Very fast", "Low resource", "Safety"],
        contextLength: 8192
      }
    ]
  },
  ollama: {
    name: "Ollama (Local)",
    description: "Run AI models locally on your machine - no API key needed",
    keyPrefix: "",
    testPrompt: "Respond with exactly 'test successful' if you can process this.",
    requiresKey: false,
    isLocal: true,
    setupUrl: "https://ollama.ai",
    setupInstructions: [
      "Visit https://ollama.ai to download Ollama",
      "Install Ollama on your system",
      "Run 'ollama run llama3.2' to download and start the default model",
      "Ollama will run on http://localhost:11434",
      "No API key required - just select this provider"
    ],
    models: [
      {
        id: "llama3.2",
        name: "Llama 3.2",
        description: "Meta's latest model running locally",
        strengths: ["Privacy", "No API costs", "Offline capable"],
        isDefault: true
      },
      {
        id: "phi3.5",
        name: "Phi 3.5",
        description: "Microsoft's efficient model for local use",
        strengths: ["Small size", "Fast", "Good reasoning"]
      },
      {
        id: "gemma2",
        name: "Gemma 2",
        description: "Google's open model for local deployment",
        strengths: ["Safety", "Instruction following", "Efficient"]
      },
      {
        id: "codellama",
        name: "CodeLlama",
        description: "Specialized for code generation and programming",
        strengths: ["Code generation", "Programming help", "Technical tasks"]
      }
    ]
  },
  openrouter: {
    name: "OpenRouter",
    description: "Access to multiple AI models through a single API",
    keyPrefix: "sk-or-",
    testPrompt: "Respond with exactly 'test successful' if you can process this.",
    requiresKey: true,
    setupUrl: "https://openrouter.ai",
    setupInstructions: [
      "Visit https://openrouter.ai",
      "Sign up for an account",
      "Go to Keys section in your dashboard",
      "Create a new API key (starts with 'sk-or-')",
      "Copy the key and paste it below"
    ],
    models: [
      {
        id: "google/gemini-flash-1.5",
        name: "Gemini Flash 1.5",
        description: "Google's fast model via OpenRouter",
        strengths: ["Speed", "Cost-effective", "Reliable"],
        isDefault: true
      },
      {
        id: "anthropic/claude-3-haiku",
        name: "Claude 3 Haiku",
        description: "Anthropic's fast and efficient model",
        strengths: ["Speed", "Efficiency", "Helpful"]
      },
      {
        id: "meta-llama/llama-3.1-8b-instruct:free",
        name: "Llama 3.1 8B (Free)",
        description: "Free tier access to Llama 3.1",
        strengths: ["Free", "Open source", "Good performance"]
      }
    ]
  }
};

// Local Storage Management
export function getAIProvider(): AIProvider {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_provider') as AIProvider || 'gemini';
  }
  return 'gemini';
}

export function getSelectedModel(provider: AIProvider): string {
  if (typeof window !== 'undefined') {
    const saved = localStorage.getItem(`${provider}_selected_model`);
    if (saved) return saved;
  }
  // Return default model for provider
  const defaultModel = PROVIDERS_CONFIG[provider].models.find(m => m.isDefault);
  return defaultModel?.id || PROVIDERS_CONFIG[provider].models[0]?.id || '';
}

export function getUserApiKey(provider?: AIProvider): string | null {
  if (typeof window !== 'undefined') {
    const currentProvider = provider || getAIProvider();
    return localStorage.getItem(`${currentProvider}_api_key`);
  }
  return null;
}

// Configuration Management
export function setAIConfig(provider: AIProvider, apiKey: string, modelId?: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ai_provider', provider);
    if (apiKey) {
      localStorage.setItem(`${provider}_api_key`, apiKey);
    }
    if (modelId) {
      localStorage.setItem(`${provider}_selected_model`, modelId);
    }
  }
}

export function setSelectedModel(provider: AIProvider, modelId: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem(`${provider}_selected_model`, modelId);
  }
}

// Get provider configuration
export function getProviderConfig(provider: AIProvider): ProviderConfig {
  return PROVIDERS_CONFIG[provider];
}

export function getAllProviders(): Record<AIProvider, ProviderConfig> {
  return PROVIDERS_CONFIG;
}

// API Key Validation
export async function testApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  const config = PROVIDERS_CONFIG[provider];
  
  // Local providers don't need API keys
  if (!config.requiresKey) {
    return await testLocalProvider(provider);
  }
  
  if (!apiKey || !apiKey.startsWith(config.keyPrefix)) {
    return false;
  }

  try {
    switch (provider) {
      case 'gemini':
        return await testGeminiKey(apiKey, config);
      case 'groq':
        return await testGroqKey(apiKey, config);
      case 'huggingface':
        return await testHuggingFaceKey(apiKey, config);
      case 'openrouter':
        return await testOpenRouterKey(apiKey, config);
      case 'ollama':
        return await testLocalProvider(provider);
      default:
        return false;
    }
  } catch (error) {
    console.error(`${provider} API key validation failed:`, error);
    return false;
  }
}

async function testGeminiKey(apiKey: string, config: ProviderConfig): Promise<boolean> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
  const model = genAI.getGenerativeModel({ model: defaultModel.id });
  
  const result = await model.generateContent(config.testPrompt);
  const text = result.response.text();
  return text.toLowerCase().includes('test successful');
}

async function testGroqKey(apiKey: string, config: ProviderConfig): Promise<boolean> {
  const groq = new Groq({ 
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true 
  });
  
  const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: config.testPrompt }],
    model: defaultModel.id,
    max_tokens: 50,
    temperature: 0,
  });
  
  const text = response.choices[0]?.message?.content || '';
  return text.toLowerCase().includes('test successful');
}

async function testHuggingFaceKey(apiKey: string, config: ProviderConfig): Promise<boolean> {
  const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
  const response = await fetch(`https://api-inference.huggingface.co/models/${defaultModel.id}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: config.testPrompt,
      parameters: { max_new_tokens: 50, temperature: 0.1 }
    }),
  });
  
  if (!response.ok) return false;
  const result = await response.json();
  const text = Array.isArray(result) ? result[0]?.generated_text || '' : result.generated_text || '';
  return text.toLowerCase().includes('test successful');
}

async function testOpenRouterKey(apiKey: string, config: ProviderConfig): Promise<boolean> {
  const defaultModel = config.models.find(m => m.isDefault) || config.models[0];
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: defaultModel.id,
      messages: [{ role: 'user', content: config.testPrompt }],
      max_tokens: 50,
      temperature: 0,
    }),
  });
  
  if (!response.ok) return false;
  const result = await response.json();
  const text = result.choices?.[0]?.message?.content || '';
  return text.toLowerCase().includes('test successful');
}

async function testLocalProvider(provider: AIProvider): Promise<boolean> {
  try {
    if (provider === 'ollama') {
      // Test Ollama connection
      const response = await fetch('http://localhost:11434/api/tags');
      return response.ok;
    }
    return false;
  } catch (error) {
    return false;
  }
}

// Utility Functions
export function hasValidApiKey(): boolean {
  const provider = getAIProvider();
  const config = PROVIDERS_CONFIG[provider];
  
  // Local providers don't need API keys
  if (!config.requiresKey) {
    return true;
  }
  
  const userKey = getUserApiKey(provider);
  return !!userKey && userKey.startsWith(config.keyPrefix);
}

export function getApiKeyConfigMessage(): string {
  const provider = getAIProvider();
  const config = PROVIDERS_CONFIG[provider];
  
  if (config.requiresKey) {
    return `🔑 API Configuration Required

To use ${config.name}, please:
1. Click Settings ⚙️ in the top-right
2. Choose ${config.name} as your provider
3. Add your API key from ${config.setupUrl}
4. Save and return to start chatting

This BYOK (Bring Your Own Key) approach ensures your privacy and gives you control over AI costs.`;
  }
  
  return `✅ ${config.name} is ready to use! No API key required.`;
}

export function getProviderSetupInstructions(provider: AIProvider): string[] {
  return PROVIDERS_CONFIG[provider].setupInstructions;
}

export function getCurrentProvider(): AIProvider {
  return getAIProvider();
}

export function getCurrentModel(): string {
  const provider = getAIProvider();
  return getSelectedModel(provider);
}

export function getAvailableModels(provider: AIProvider): ModelConfig[] {
  return PROVIDERS_CONFIG[provider].models;
}

// Main AI Functions - Customize these for your use case
export async function generateContent(prompt: string): Promise<string> {
  const provider = getAIProvider();
  const config = PROVIDERS_CONFIG[provider];
  
  // Enhanced validation for API key
  if (config.requiresKey) {
    const apiKey = getUserApiKey(provider);
    if (!apiKey) {
      throw new Error(`API Key not configured for ${config.name}. Please set up your API key in settings.`);
    }
    if (!apiKey.startsWith(config.keyPrefix)) {
      throw new Error(`Invalid API key format for ${config.name}. Please check your API key starts with '${config.keyPrefix}'.`);
    }
  }
  
  const modelId = getSelectedModel(provider);
  
  try {
    switch (provider) {
      case 'gemini':
        return await callGemini(getUserApiKey(provider)!, prompt, modelId);
      case 'groq':
        return await callGroq(getUserApiKey(provider)!, prompt, modelId);
      case 'huggingface':
        return await callHuggingFace(getUserApiKey(provider)!, prompt, modelId);
      case 'openrouter':
        return await callOpenRouter(getUserApiKey(provider)!, prompt, modelId);
      case 'ollama':
        return await callOllama(prompt, modelId);
      default:
        throw new Error('Unsupported AI provider');
    }
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
  }
}

async function callGemini(apiKey: string, prompt: string, modelId: string): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });
  
  const result = await model.generateContent(prompt);
  return result.response.text() || "No response generated";
}

async function callGroq(apiKey: string, prompt: string, modelId: string): Promise<string> {
  const groq = new Groq({ 
    apiKey: apiKey.trim(), 
    dangerouslyAllowBrowser: true 
  });
  
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: modelId,
    max_tokens: 2048,
    temperature: 0.7,
  });
  
  return response.choices[0]?.message?.content || "No response generated";
}

async function callHuggingFace(apiKey: string, prompt: string, modelId: string): Promise<string> {
  const response = await fetch(`https://api-inference.huggingface.co/models/${modelId}`, {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      inputs: prompt,
      parameters: { max_new_tokens: 1024, temperature: 0.7 }
    }),
  });
  
  if (!response.ok) {
    throw new Error(`HuggingFace API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return Array.isArray(result) ? result[0]?.generated_text || "No response generated" : result.generated_text || "No response generated";
}

async function callOpenRouter(apiKey: string, prompt: string, modelId: string): Promise<string> {
  const response = await fetch('https://openrouter.ai/api/v1/chat/completions', {
    method: 'POST',
    headers: {
      'Authorization': `Bearer ${apiKey}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: [{ role: 'user', content: prompt }],
      max_tokens: 1024,
      temperature: 0.7,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`OpenRouter API error: ${response.statusText}`);
  }
  
  const result = await response.json();
  return result.choices?.[0]?.message?.content || "No response generated";
}

async function callOllama(prompt: string, modelId: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/generate', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      prompt: prompt,
      stream: false,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}. Make sure Ollama is running locally.`);
  }
  
  const result = await response.json();
  return result.response || "No response generated";
}

// Chat functionality (for conversational AI)
export async function getChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
  const provider = getAIProvider();
  const config = PROVIDERS_CONFIG[provider];
  const modelId = getSelectedModel(provider);
  
  // Enhanced validation for API key
  if (config.requiresKey) {
    const apiKey = getUserApiKey(provider);
    if (!apiKey) {
      throw new Error(`API Key not configured for ${config.name}. Please set up your API key in settings.`);
    }
    if (!apiKey.startsWith(config.keyPrefix)) {
      throw new Error(`Invalid API key format for ${config.name}. Please check your API key starts with '${config.keyPrefix}'.`);
    }
  }
  
  try {
    switch (provider) {
      case 'groq':
      case 'openrouter':
        return await getChatResponseOpenAIFormat(provider, messages, modelId);
      case 'gemini':
        return await getChatResponseGemini(messages, modelId);
      case 'ollama':
        return await getChatResponseOllama(messages, modelId);
      case 'huggingface':
        // Convert chat to single prompt for HuggingFace
        const fullPrompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
        return await generateContent(fullPrompt);
      default:
        throw new Error('Unsupported provider for chat');
    }
  } catch (error) {
    console.error("Chat response failed:", error);
    throw error;
  }
}

async function getChatResponseOpenAIFormat(provider: AIProvider, messages: Array<{role: string, content: string}>, modelId: string): Promise<string> {
  const apiKey = getUserApiKey(provider)!;
  const baseUrl = provider === 'groq' ? 'https://api.groq.com/openai/v1' : 'https://openrouter.ai/api/v1';
  
  const groq = new Groq({ 
    apiKey, 
    dangerouslyAllowBrowser: true,
    baseURL: baseUrl
  });
  
  const response = await groq.chat.completions.create({
    messages: messages as any,
    model: modelId,
    max_tokens: 1024,
    temperature: 0.7,
  });
  
  return response.choices[0]?.message?.content || "No response";
}

async function getChatResponseGemini(messages: Array<{role: string, content: string}>, modelId: string): Promise<string> {
  const apiKey = getUserApiKey('gemini')!;
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: modelId });
  
  // Convert messages to Gemini format
  const chat = model.startChat({
    history: messages.slice(0, -1).map(msg => ({
      role: msg.role === 'user' ? 'user' : 'model',
      parts: [{ text: msg.content }]
    }))
  });
  
  const lastMessage = messages[messages.length - 1];
  const result = await chat.sendMessage(lastMessage.content);
  return result.response.text() || "No response";
}

async function getChatResponseOllama(messages: Array<{role: string, content: string}>, modelId: string): Promise<string> {
  const response = await fetch('http://localhost:11434/api/chat', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
    },
    body: JSON.stringify({
      model: modelId,
      messages: messages,
      stream: false,
    }),
  });
  
  if (!response.ok) {
    throw new Error(`Ollama API error: ${response.statusText}. Make sure Ollama is running locally.`);
  }
  
  const result = await response.json();
  return result.message?.content || "No response generated";
}
