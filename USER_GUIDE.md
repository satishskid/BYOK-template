# BYOK Template - Complete User Guide

Welcome to the **Bring Your Own Key (BYOK) Template**! This guide will walk you through everything you need to know, from setup to deployment, in simple, beginner-friendly steps.

## 📋 Table of Contents

1. [What is BYOK?](#what-is-byok)
2. [Quick Start (5 minutes)](#quick-start)
3. [Developer Setup Guide](#developer-setup)
4. [User Guide](#user-guide)
5. [Advanced Configuration](#advanced-configuration)
6. [Troubleshooting](#troubleshooting)

## 🎯 What is BYOK?

**BYOK (Bring Your Own Key)** is a template that lets you:
- ✅ Use your own AI API keys (OpenAI, Claude, etc.)
- ✅ Control who can access your AI tools
- ✅ Deploy your own AI playground
- ✅ Manage users with a whitelist system
- ✅ Get started in minutes, not hours

## 🚀 Quick Start (5 minutes)

### For Complete Beginners

#### Step 1: Get the Template
```bash
# Option 1: Download ZIP
- Go to the repository
- Click "Download ZIP"
- Extract to your computer

# Option 2: Clone with Git
# (If you have git installed)
git clone [repository-url]
cd BYOK-template
```

#### Step 2: Install Required Tools

**You need:**
- **Node.js** (Download from [nodejs.org](https://nodejs.org))
- **A code editor** (VS Code recommended - [Download here](https://code.visualstudio.com))

**Check if Node.js is installed:**
```bash
node --version
# Should show version like v18.x.x
```

#### Step 3: Install Dependencies
```bash
# Open terminal/command prompt
cd BYOK-template
npm install
```

#### Step 4: Start the App
```bash
npm run dev
```

**You'll see:**
- A local website at `http://localhost:3000`
- Your AI playground is ready!

#### Step 5: Add Your API Key
1. Open the website (http://localhost:3000)
2. Click "Settings" in the top right
3. Paste your OpenAI API key
4. Click "Save"

**You're done!** 🎉 Start using your AI playground.

## 👨‍💻 Developer Setup Guide

### Prerequisites Checklist
- [ ] Node.js installed (version 16+)
- [ ] Git installed (optional)
- [ ] Code editor (VS Code recommended)
- [ ] Terminal/Command prompt access

### Detailed Setup Steps

#### 1. Get Your AI API Keys

**OpenAI:**
1. Go to [platform.openai.com](https://platform.openai.com)
2. Sign up/log in
3. Click "API keys"
4. Create new secret key
5. **Save it somewhere safe!**

**Claude (Anthropic):**
1. Go to [console.anthropic.com](https://console.anthropic.com)
2. Sign up/log in
3. Go to API keys section
4. Create new key

#### 2. Configure Your Template

**Option A: CLI Setup (Recommended)**
```bash
# Run the interactive setup
npm run setup:firebase

# Follow the prompts:
# - Enter your Firebase details
# - Set your Netlify domain
# - Configure admin email
```

**Option B: Manual Setup**
```bash
# Copy example file
cp .env.example .env

# Edit .env file with your details
# Use any text editor to fill in your API keys
```

#### 3. Firebase Setup (Optional but Recommended)

**Why Firebase?**
- User authentication
- Whitelist management
- Analytics
- Secure data storage

**Setup Steps:**
1. Go to [firebase.google.com](https://firebase.google.com)
2. Create new project
3. Enable Authentication (Google sign-in)
4. Enable Firestore Database
5. Copy your Firebase configuration
6. Run: `npm run setup:firebase`

#### 4. Deploy to Netlify (Free Hosting)

**Method 1: Drag & Drop**
1. Run: `npm run build`
2. Go to [netlify.com](https://netlify.com)
3. Drag the `dist` folder to Netlify
4. Done!

**Method 2: CLI Deployment**
```bash
# Install Netlify CLI
npm install -g netlify-cli

# Deploy
netlify deploy --prod
```

## 👤 User Guide

### How to Use Your AI Playground

#### Basic Usage
1. **Open your website** (localhost:3000 or your Netlify URL)
2. **Sign in** with Google (if Firebase is enabled)
3. **Select AI Provider** (OpenAI, Claude, etc.)
4. **Type your question** in the chat box
5. **Press Enter** or click send

#### Settings & Configuration

**Adding API Keys:**
1. Click the **Settings** button (top right)
2. Choose your AI provider
3. Paste your API key
4. Click **Save Settings**

**Managing Users (Admin):**
1. Click **Admin Dashboard**
2. Sign in as admin
3. Add email addresses to whitelist
4. Users can now sign in with those emails

#### Available Features

| Feature | How to Use |
|---------|------------|
| **Chat with AI** | Type in the main input box |
| **Change AI Model** | Use dropdown in settings |
| **View History** | Check the sidebar |
| **Clear Chat** | Click "New Chat" button |
| **Export Conversation** | Click "Export" button |
| **Share** | Click "Share" button |

## ⚙️ Advanced Configuration

### Environment Variables Reference

Create a `.env` file in your project root:

```bash
# AI Provider Keys
VITE_OPENAI_API_KEY=your-openai-key-here
VITE_ANTHROPIC_API_KEY=your-claude-key-here
VITE_GOOGLE_API_KEY=your-gemini-key-here

# Firebase Configuration (Optional)
VITE_FIREBASE_API_KEY=your-firebase-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id

# App Settings
VITE_APP_NAME=My AI Playground
VITE_REQUIRE_API_KEY=true
VITE_ENABLE_WHITELIST=true
```

### Customization Options

#### Change App Name
1. Open `src/App.tsx`
2. Find: `<title>BYOK Template</title>`
3. Change to your app name

#### Add New AI Provider
1. Open `src/services/aiService.ts`
2. Add new provider configuration
3. Update the provider dropdown

#### Customize Colors
1. Open `tailwind.config.js`
2. Modify the color scheme
3. Rebuild: `npm run build`

## 🔧 Troubleshooting

### Common Issues & Solutions

#### "npm install fails"
**Problem:** Permission errors or network issues
**Solution:**
```bash
# Try this instead
npm install --legacy-peer-deps

# Or use yarn
npm install -g yarn
yarn install
```

#### "API key not working"
**Problem:** Invalid API key or rate limits
**Solution:**
1. Check your API key is correct
2. Verify billing is enabled on your AI provider
3. Check rate limits in your AI provider dashboard

#### "Firebase errors"
**Problem:** Configuration issues
**Solution:**
1. Run: `npm run setup:firebase`
2. Check your Firebase project settings
3. Verify Firestore rules are set to allow reads/writes

#### "Website won't load"
**Problem:** Port already in use
**Solution:**
```bash
# Try a different port
npm run dev -- --port 3001
```

### Getting Help

**Stuck? Try these resources:**

1. **Check the console** (F12 in browser) for error messages
2. **Read the error messages** - they often tell you exactly what's wrong
3. **Restart the development server**:
   ```bash
   # Stop current server (Ctrl+C)
   npm run dev
   ```

4. **Ask for help** with this information:
   - What step you're on
   - Exact error message
   - Your operating system (Windows/Mac/Linux)

## 📚 Additional Resources

### Learning Links
- **Node.js Tutorial**: [nodejs.dev](https://nodejs.dev)
- **React Basics**: [react.dev](https://react.dev)
- **Firebase Tutorial**: [firebase.google.com/docs](https://firebase.google.com/docs)
- **Netlify Guide**: [docs.netlify.com](https://docs.netlify.com)

### Example Projects
- **Basic Chat App**: Uses OpenAI only
- **Multi-Provider**: Supports OpenAI + Claude
- **Team Version**: With user management

### Next Steps After Setup
1. **Customize the UI** to match your brand
2. **Add your logo** and colors
3. **Test with friends** or team members
4. **Deploy to production** when ready
5. **Monitor usage** and add more features

---

## 🎯 Quick Reference Card

**Essential Commands:**
```bash
npm install          # Install dependencies
npm run dev          # Start development server
npm run build        # Build for production
npm run setup        # Run setup wizard
```

**Key Files to Know:**
- `.env` - Your configuration (API keys)
- `src/App.tsx` - Main app file
- `src/components/` - UI components
- `package.json` - Project settings

**Need Help?** 
- Check `CLI_SETUP.md` for CLI issues
- Check `FIREBASE_SETUP_GUIDE.md` for Firebase setup
- Check browser console for JavaScript errors

---

**Happy building!** 🚀 Your AI playground is ready to use.