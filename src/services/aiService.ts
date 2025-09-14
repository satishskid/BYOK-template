import { GoogleGenerativeAI } from "@google/generative-ai";
import Groq from "groq-sdk";

// AI Provider types
export type AIProvider = 'gemini' | 'groq';

// Provider configuration
const PROVIDERS_CONFIG = {
  gemini: {
    model: "gemini-2.0-flash-exp",
    keyPrefix: "AIza",
    testPrompt: "Respond with exactly 'test successful' if you can process this."
  },
  groq: {
    model: "llama-3.1-8b-instant", 
    keyPrefix: "gsk_",
    testPrompt: "Respond with exactly 'test successful' if you can process this."
  }
};

// Local Storage Management
function getAIProvider(): AIProvider {
  if (typeof window !== 'undefined') {
    return localStorage.getItem('ai_provider') as AIProvider || 'gemini';
  }
  return 'gemini';
}

function getUserApiKey(provider?: AIProvider): string | null {
  if (typeof window !== 'undefined') {
    const currentProvider = provider || getAIProvider();
    return localStorage.getItem(`${currentProvider}_api_key`);
  }
  return null;
}

// Configuration Management
export function setAIConfig(provider: AIProvider, apiKey: string): void {
  if (typeof window !== 'undefined') {
    localStorage.setItem('ai_provider', provider);
    localStorage.setItem(`${provider}_api_key`, apiKey);
  }
}

// API Key Validation
export async function testApiKey(provider: AIProvider, apiKey: string): Promise<boolean> {
  const config = PROVIDERS_CONFIG[provider];
  
  if (!apiKey || !apiKey.startsWith(config.keyPrefix)) {
    return false;
  }

  try {
    switch (provider) {
      case 'gemini':
        return await testGeminiKey(apiKey, config);
      case 'groq':
        return await testGroqKey(apiKey, config);
      default:
        return false;
    }
  } catch (error) {
    console.error(`${provider} API key validation failed:`, error);
    return false;
  }
}

async function testGeminiKey(apiKey: string, config: any): Promise<boolean> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });
  
  const result = await model.generateContent(config.testPrompt);
  const text = result.response.text();
  return text.toLowerCase().includes('test successful');
}

async function testGroqKey(apiKey: string, config: any): Promise<boolean> {
  const groq = new Groq({ 
    apiKey: apiKey.trim(),
    dangerouslyAllowBrowser: true 
  });
  
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: config.testPrompt }],
    model: config.model,
    max_tokens: 50,
    temperature: 0,
  });
  
  const text = response.choices[0]?.message?.content || '';
  return text.toLowerCase().includes('test successful');
}

// Utility Functions
export function hasValidApiKey(): boolean {
  const provider = getAIProvider();
  const userKey = getUserApiKey(provider);
  return !!userKey;
}

export function getCurrentProvider(): AIProvider {
  return getAIProvider();
}

// Main AI Functions - Customize these for your use case
export async function generateContent(prompt: string): Promise<string> {
  const provider = getAIProvider();
  const apiKey = getUserApiKey(provider);
  
  if (!apiKey) {
    throw new Error("API Key not configured. Please set up your API key in settings.");
  }

  const config = PROVIDERS_CONFIG[provider];
  
  try {
    if (provider === 'gemini') {
      return await callGemini(apiKey, prompt, config);
    } else if (provider === 'groq') {
      return await callGroq(apiKey, prompt, config);
    }
    
    throw new Error('Unsupported AI provider');
  } catch (error) {
    console.error("AI generation failed:", error);
    throw error;
  }
}

async function callGemini(apiKey: string, prompt: string, config: any): Promise<string> {
  const genAI = new GoogleGenerativeAI(apiKey);
  const model = genAI.getGenerativeModel({ model: config.model });
  
  const result = await model.generateContent(prompt);
  return result.response.text() || "No response generated";
}

async function callGroq(apiKey: string, prompt: string, config: any): Promise<string> {
  const groq = new Groq({ 
    apiKey: apiKey.trim(), 
    dangerouslyAllowBrowser: true 
  });
  
  const response = await groq.chat.completions.create({
    messages: [{ role: "user", content: prompt }],
    model: config.model,
    max_tokens: 2048,
    temperature: 0.7,
  });
  
  return response.choices[0]?.message?.content || "No response generated";
}

// Chat functionality (for conversational AI)
export async function getChatResponse(messages: Array<{role: string, content: string}>): Promise<string> {
  const provider = getAIProvider();
  const apiKey = getUserApiKey(provider);
  
  if (!apiKey) {
    throw new Error("API Key not configured");
  }

  const config = PROVIDERS_CONFIG[provider];
  
  try {
    if (provider === 'groq') {
      const groq = new Groq({ apiKey, dangerouslyAllowBrowser: true });
      const response = await groq.chat.completions.create({
        messages: messages as any,
        model: config.model,
        max_tokens: 1024,
        temperature: 0.7,
      });
      return response.choices[0]?.message?.content || "No response";
    } else {
      // For Gemini, convert chat to single prompt
      const fullPrompt = messages.map(m => `${m.role}: ${m.content}`).join('\n');
      return await generateContent(fullPrompt);
    }
  } catch (error) {
    console.error("Chat response failed:", error);
    throw error;
  }
}
