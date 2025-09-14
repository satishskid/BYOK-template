# 🔑 Enhanced BYOK (Bring Your Own Key) AI Template

**Complete, production-ready template for multi-provider AI integration with embedded models, local AI support, and enhanced model selection.**

> *Based on the proven neurospark educational platform - now enhanced with support for 5+ AI providers, embedded models, and local AI capabilities.*

## 🌟 What's New in the Enhanced Version

### 🚀 **Multi-Provider Support**
- **Google Gemini** - Latest models including Gemini 2.0 Flash
- **Groq** - Ultra-fast inference with Llama, Gemma, and Phi models
- **HuggingFace** - Access to open-source models via Inference API
- **Ollama** - Local AI models running on your machine
- **OpenRouter** - Gateway to multiple AI providers

### 🎯 **Enhanced Model Selection**
- Choose specific models for each provider
- Embedded models: Gemma 2, Phi-3, Llama 3.2/3.3
- Model descriptions and strength indicators
- Context length and capability information

### 🏠 **Local + Cloud Hybrid**
- Run models locally with Ollama (privacy-first)
- Mix local and cloud providers seamlessly
- No API costs for local models
- Offline capability when using local models

## 🎮 Features

### ✨ **Core Features**
- 🔐 **Pure Client-Side Security** - API keys never leave your browser
- 🔄 **Provider Switching** - Switch between providers instantly
- 🎯 **Model Selection** - Choose the best model for each task
- 💬 **Chat & Generation** - Both single-shot and conversational AI
- 🏠 **Local AI Support** - Privacy-first local model execution
- 📱 **Modern UI** - Beautiful, responsive interface with Tailwind CSS

### 🛠 **Technical Features**
- ⚛️ React 18 + TypeScript + Vite
- 🔥 Firebase Authentication (Google OAuth)
- 💾 localStorage-based key management
- 🎨 Tailwind CSS styling
- 📦 Zero server dependencies

## 🚀 Quick Start

### 1. Clone and Install
```bash
git clone https://github.com/satishskid/BYOK-template.git
cd BYOK-template
npm install
```

### 2. Firebase Setup
1. Create a Firebase project at [Firebase Console](https://console.firebase.google.com)
2. Enable Google Authentication
3. Copy your config to `src/firebaseConfig.js`

### 3. Start Development
```bash
npm run dev
```

### 4. Configure Providers
1. Sign in with Google
2. Go to "Setup" tab
3. Add API keys for your preferred providers
4. Select models for each provider
5. Start using AI!

## 🔧 Supported Providers & Models

### ☁️ **Cloud Providers**

#### Google Gemini (Free Tier Available)
- **Gemini 2.0 Flash (Experimental)** - Latest with enhanced capabilities
- **Gemini 1.5 Pro** - Complex reasoning and long context
- **Gemini 1.5 Flash** - Fast and efficient for most tasks
- 🆓 60 requests/minute free

#### Groq (Fast Inference)
- **Llama 3.3 70B** - Most capable with excellent reasoning
- **Llama 3.1 8B Instant** - Fast and efficient responses
- **Gemma 2 9B** - Google's open model optimized for instructions
- **Phi-3 Medium** - Microsoft's compact but powerful model
- 🆓 Generous free tier

#### HuggingFace (Open Source Hub)
- **Llama 3.2 3B Instruct** - Compact instruction-tuned model
- **Phi-3.5 Mini** - Microsoft's efficient instruction model  
- **Gemma 2 2B** - Google's lightweight safety-focused model
- 🆓 Free inference API

#### OpenRouter (Multi-Provider Gateway)
- **Gemini Flash 1.5** - Google's fast model via OpenRouter
- **Claude 3 Haiku** - Anthropic's efficient model
- **Llama 3.1 8B (Free)** - Free tier access to Llama
- 🆓 Free tier available

### 🏠 **Local Provider**

#### Ollama (Privacy-First)
- **Llama 3.2** - Meta's latest model running locally
- **Phi 3.5** - Microsoft's efficient local model
- **Gemma 2** - Google's open model for local deployment
- **CodeLlama** - Specialized for code generation
- 🔒 100% private, no API costs, offline capable

## 🎯 Use Cases & Model Recommendations

### 💼 **Business & Professional**
- **Complex Analysis**: Gemini 1.5 Pro, Llama 3.3 70B
- **Quick Tasks**: Gemini Flash, Llama 3.1 8B Instant
- **Cost-Sensitive**: HuggingFace models, Ollama local

### 👨‍💻 **Development & Code**
- **Code Generation**: CodeLlama (local), Phi-3 models
- **Code Review**: Gemini 1.5 Pro, Llama 3.3 70B
- **Quick Snippets**: Phi-3.5 Mini, Gemma 2

### 🔒 **Privacy-Sensitive**
- **Confidential Data**: Ollama local models
- **Personal Projects**: Any local Ollama model
- **Offline Work**: Ollama (works without internet)

### 📚 **Learning & Education**
- **Explanations**: Gemini models (great at teaching)
- **Practice**: Free tier models (Groq, HuggingFace)
- **Experimentation**: Ollama local models

## 🏗 Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    CLIENT-SIDE ONLY                        │
├─────────────────────────────────────────────────────────────┤
│  Firebase Auth  │  localStorage Keys  │  Direct AI Calls    │
│  ┌─────────────┐│  ┌─────────────────┐│  ┌─────────────────┐│
│  │   Google    ││  │ Provider Keys   ││  │   Multi-AI      ││
│  │   Sign-In   ││  │ Model Settings  ││  │   Providers     ││
│  └─────────────┘│  │ User Prefs      ││  │   • Gemini      ││
│                 │  └─────────────────┘│  │   • Groq        ││
│                 │                     │  │   • HuggingFace ││
│                 │                     │  │   • Ollama      ││
│                 │                     │  │   • OpenRouter  ││
│                 │                     │  └─────────────────┘│
└─────────────────────────────────────────────────────────────┘
```

## 📁 File Structure

```
src/
├── services/
│   ├── aiService.ts              # 🧠 Enhanced multi-provider AI service
│   └── firebaseService.ts        # 🔐 Authentication wrapper
├── components/
│   ├── EnhancedApiKeyManager.tsx # ⚙️  Multi-provider + model management
│   ├── AIPlayground.tsx          # 🎮 Interactive AI testing interface
│   ├── ApiKeyWarning.tsx         # ⚠️  Missing key notifications
│   └── SettingsView.tsx          # 🎛️  Settings modal
├── App.tsx                       # 🏠 Enhanced main app with tabs
└── firebaseConfig.js             # 🔥 Firebase configuration
```

## 🔧 Configuration Examples

### Adding a New Provider
```typescript
// In aiService.ts - Add to PROVIDERS_CONFIG
newprovider: {
  name: "New Provider",
  description: "Description of capabilities",
  keyPrefix: "np_",
  testPrompt: "Test prompt",
  requiresKey: true,
  setupUrl: "https://newprovider.com",
  models: [
    {
      id: "model-id",
      name: "Model Name",
      description: "What this model is good at",
      strengths: ["Strength 1", "Strength 2"],
      isDefault: true
    }
  ]
}
```

### Custom Model Selection
```typescript
// Switch provider and model
setAIConfig('groq', 'your-api-key', 'llama-3.3-70b-versatile');

// Generate with specific provider
const response = await generateContent("Your prompt");
```

## 🚀 Deployment

### Environment Variables
**None required!** This is a pure BYOK system - all configuration is client-side.

### Build & Deploy
```bash
# Build for production
npm run build

# Deploy to Netlify, Vercel, or any static host
npm run preview
```

### Netlify Configuration
```toml
# netlify.toml
[build]
  command = "npm run build"
  publish = "dist"

[[redirects]]
  from = "/*"
  to = "/index.html"
  status = 200
```

## 🔒 Security & Privacy

### 🛡️ **Security Features**
- API keys stored only in browser localStorage
- Direct API calls from browser to providers
- No server-side key storage or proxying
- Firebase Auth for user management only

### 🔐 **Privacy Options**
- **Full Privacy**: Use Ollama local models only
- **Hybrid**: Mix local models for sensitive tasks, cloud for others
- **Cloud**: Use any combination of cloud providers

### 🚨 **Best Practices**
- Use local models (Ollama) for confidential data
- Rotate API keys regularly
- Use free tiers for experimentation
- Mix providers based on task requirements

## 📚 Usage Examples

### Basic AI Request
```typescript
import { generateContent } from './services/aiService';

const response = await generateContent('Explain quantum computing');
console.log(response);
```

### Chat Conversation
```typescript
import { getChatResponse } from './services/aiService';

const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi there!' },
  { role: 'user', content: 'How are you?' }
];

const response = await getChatResponse(messages);
```

### Provider Management
```typescript
import { setAIConfig, switchProvider } from './services/aiService';

// Switch to Groq with specific model
setAIConfig('groq', 'gsk_your_key', 'llama-3.3-70b-versatile');

// Test if Ollama is running locally
const isOllamaReady = await testApiKey('ollama', '');
```

## 🤝 Contributing

1. Fork the repository
2. Create a feature branch
3. Make your changes
4. Test with multiple providers
5. Submit a pull request

## 📄 License

MIT License - feel free to use this template in your projects!

## 🙏 Acknowledgments

- Based on the neurospark educational platform
- Inspired by the BYOK (Bring Your Own Key) philosophy
- Built with modern React, TypeScript, and Vite
- UI powered by Tailwind CSS

---

**Ready to build with AI? Clone this template and start creating! 🚀**
