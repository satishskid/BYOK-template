# 🚀 BYOK Template - Quick Start Card

## 5-Minute Setup (Copy & Paste)

### 1. Install & Start
```bash
npm install
npm run dev
```

### 2. Add API Key
1. Open http://localhost:3000
2. Click Settings → Add your OpenAI key
3. Save

### 3. Done! Start chatting 🎉

---

## 📋 Essential Commands

| Command | What it does |
|---------|--------------|
| `npm run dev` | Start your app |
| `npm run build` | Build for deployment |
| `npm run setup:firebase` | Setup Firebase |
| `npm run setup:admin` | Add admin user |

---

## 🔑 Where to Get API Keys

**OpenAI:** platform.openai.com → API Keys  
**Claude:** console.anthropic.com → API Keys  
**Google:** makersuite.google.com → API Keys

---

## 🎯 Common Fixes

**App won't start:**
```bash
npm install --legacy-peer-deps
npm run dev
```

**API key error:**
- Check Settings → API Keys
- Verify key is correct
- Check billing on provider

**Port in use:**
```bash
npm run dev -- --port 3001
```

---

## 📁 Key Files

- **`.env`** - Your API keys (never share!)
- **`package.json`** - Project settings
- **`src/App.tsx`** - Main app file

---

## 📞 Need Help?

1. Check browser console (F12)
2. Read error messages
3. Restart: `npm run dev`
4. Ask with: your error message + OS (Windows/Mac/Linux)

---

**Save this card!** 📎 Pin it near your workspace.