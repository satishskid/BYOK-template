# 🚀 Quick Start Guide - Enhanced BYOK Template

## Get Started in 5 Minutes

### 1. **Clone & Install**
```bash
git clone https://github.com/satishskid/BYOK-template.git my-ai-app
cd my-ai-app
npm install
```

### 2. **Firebase Setup (Required)**
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Create a new project
3. Enable Authentication → Google provider
4. Update `src/services/firebaseService.ts`:

```typescript
const firebaseConfig = {
  apiKey: "your-api-key",
  authDomain: "your-project.firebaseapp.com",
  projectId: "your-project-id",
  // ... rest of config
};
```

### 3. **Start Development**
```bash
npm run dev
```

### 4. **Configure AI Providers**
1. Sign in with Google
2. Go to **Setup** tab
3. Choose your preferred providers:

#### **🆓 Start Free (No Credit Card)**
- **Ollama (Local)**: Download from [ollama.ai](https://ollama.ai)
- **HuggingFace**: Free token from [huggingface.co](https://huggingface.co/settings/tokens)
- **Groq**: Free tier at [console.groq.com](https://console.groq.com)

#### **💳 Premium Options**
- **Google Gemini**: 60 free requests/min at [aistudio.google.com](https://aistudio.google.com)
- **OpenRouter**: Multiple models at [openrouter.ai](https://openrouter.ai)

### 5. **Test AI Features**
1. Go to **Playground** tab
2. Try example prompts
3. Switch between providers/models
4. Compare responses!

## 🎯 Recommended Setup by Use Case

### **👨‍💻 Developers**
```
1. Ollama (local) → CodeLlama for private code
2. Groq → Llama 3.1 8B for quick questions  
3. Gemini → Flash for documentation
```

### **📚 Students/Learning**
```
1. HuggingFace → Free models for practice
2. Groq → Free tier for experiments
3. Gemini → Free tier for explanations
```

### **💼 Business/Professional**
```
1. Gemini → 1.5 Pro for complex analysis
2. Groq → Llama 3.3 70B for reasoning
3. Ollama → Local for confidential data
```

### **🔒 Privacy-Focused**
```
1. Ollama → All models local (100% private)
2. No cloud providers needed
3. Works completely offline
```

## 🛠 Build & Deploy

### **Development**
```bash
npm run dev      # Start dev server
npm run build    # Build for production
npm run preview  # Preview production build
```

### **Deploy Anywhere**
```bash
# Deploy to Netlify (drag & drop dist/ folder)
# Deploy to Vercel (connect GitHub repo)  
# Deploy to Firebase Hosting
firebase init hosting
firebase deploy
```

## 🎮 Usage Examples

### **Basic AI Request**
```typescript
import { generateContent } from './services/aiService';

const response = await generateContent('Explain React hooks');
console.log(response);
```

### **Chat Conversation**
```typescript
import { getChatResponse } from './services/aiService';

const messages = [
  { role: 'user', content: 'Hello!' },
  { role: 'assistant', content: 'Hi! How can I help?' },
  { role: 'user', content: 'Explain async/await' }
];

const response = await getChatResponse(messages);
```

### **Switch Providers**
```typescript
import { setAIConfig } from './services/aiService';

// Switch to Groq with Llama 3.3 70B
setAIConfig('groq', 'your-api-key', 'llama-3.3-70b-versatile');

// Switch to local Ollama
setAIConfig('ollama', '', 'llama3.2');
```

## 🔧 Customization

### **Add New Provider**
1. Update `AIProvider` type in `aiService.ts`
2. Add to `PROVIDERS_CONFIG`
3. Add validation function
4. Update components

### **Add New Model**
1. Add to provider's `models` array
2. Include description and strengths
3. Test with your API key

### **Customize UI**
- Modify Tailwind classes
- Update colors and styling
- Add your own components

## 🆘 Troubleshooting

### **Common Issues**

**"Firebase not configured"**
```bash
# Update src/services/firebaseService.ts with your config
```

**"Ollama not working"**
```bash
# Install Ollama first
curl -fsSL https://ollama.ai/install.sh | sh

# Pull a model
ollama pull llama3.2

# Check if running
curl http://localhost:11434
```

**"API key invalid"**
```bash
# Check key format:
# Gemini: AIza...
# Groq: gsk_...
# HuggingFace: hf_...
# OpenRouter: sk-or-...
```

**"Build errors"**
```bash
# Clear cache and reinstall
rm -rf node_modules package-lock.json
npm install

# Check TypeScript
npx tsc --noEmit
```

## 🎉 You're Ready!

Your enhanced BYOK template now supports:
- ✅ 5 AI providers
- ✅ 20+ models  
- ✅ Local + cloud options
- ✅ Privacy-first design
- ✅ Production deployment

**Happy coding with AI! 🚀**

---

Need help? Check the [README](./README-Enhanced.md) or open an issue on GitHub.
