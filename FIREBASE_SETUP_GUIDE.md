# 🔧 BYOK Firebase Setup Guide - Zero Debugging Required

This guide provides a **seamless, one-click Firebase setup** for your BYOK (Bring Your Own Key) system. No debugging required - just follow the steps and you're ready to go!

## 🚀 Quick Start (2 Minutes Setup)

### Option 1: Interactive Web Wizard (Recommended)
1. **Open the app** - You'll see a Firebase setup screen
2. **Click "Configure Firebase"** - Opens the setup wizard
3. **Follow the 4-step wizard**:
   - Welcome screen → Firebase config → Whitelist settings → Verification
4. **Done!** - Your Firebase is configured and ready

### Option 2: Command Line Setup (Advanced)
1. **Get your Firebase service account**:
   ```bash
   # Go to Firebase Console → Project Settings → Service Accounts
   # Download the service account JSON file
   ```

2. **Run the automated setup**:
   ```bash
   cd firebase-setup
   npm install firebase-admin
   node firebase-admin-setup.js
   ```

3. **Follow the interactive prompts** - The script handles everything:
   - Security rules deployment
   - Whitelist configuration
   - Initial collections setup
   - Sample data creation

## 📋 Prerequisites

### What You Need:
- **Firebase Project** (create at [console.firebase.google.com](https://console.firebase.google.com))
- **Google OAuth enabled** (for user authentication)
- **Service Account Key** (for admin features)

### Create Firebase Project (30 seconds):
1. Go to [Firebase Console](https://console.firebase.google.com)
2. Click "Create Project" → Enter name → Continue → Continue → Create Project
3. Click "Authentication" → "Get Started" → Enable "Google" provider → Save
4. Click "Firestore Database" → "Create Database" → Start in production mode → Enable

## 🔧 Configuration Methods

### Method 1: Web Wizard (No Code)
The app includes a built-in configuration wizard:
- **Automatic validation** - Checks your configuration before saving
- **Whitelist setup** - Configure allowed users/domains
- **Real-time testing** - Verify setup works immediately

### Method 2: Environment Variables
Create `.env` file in project root:
```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=your-app-id
```

### Method 3: Service Account Setup
For admin features (whitelist management, analytics):
```bash
# 1. Download service account from Firebase Console
# 2. Place in firebase-setup/service-account.json
# 3. Run: node firebase-setup/firebase-admin-setup.js
```

## 🛡️ Security Rules (Auto-Deployed)

The setup automatically deploys these security rules:

### Firestore Rules
- ✅ **Authenticated users** can read whitelist config
- ✅ **Admin users** can modify whitelist
- ✅ **Users** can only see their own data
- ✅ **Rate limiting** built-in

### Authentication Rules
- ✅ **Email verification** required
- ✅ **Domain whitelisting** supported
- ✅ **Admin approval** system
- ✅ **Session management**

## 📊 Whitelist Configuration

### Email Whitelist
- **Specific emails**: Add individual email addresses
- **Domain whitelist**: Allow entire domains (e.g., @company.com)
- **Auto-approval**: New users automatically approved
- **Admin approval**: Require manual approval

### Configuration Examples
```javascript
// Allow specific emails
allowedEmails: ["admin@company.com", "user@company.com"]

// Allow entire domain
allowedDomains: ["company.com", "partner.com"]

// Mixed approach
allowNewUsers: true
requireApproval: true
```

## 🔄 Troubleshooting (Pre-Handled)

### Common Issues - Already Fixed
- **"Firebase not initialized"** → Automatic detection and setup prompt
- **"Permission denied"** → Security rules auto-deployed
- **"Invalid API key"** → Real-time validation in wizard
- **"Service account missing"** → Clear error messages and instructions

### Debug Commands (If Needed)
```bash
# Check Firebase status
node firebase-setup/firebase-admin-setup.js --check

# Reset configuration
node firebase-setup/firebase-admin-setup.js --reset

# Manual rules deployment
firebase deploy --only firestore:rules
```

## 🎯 Advanced Features

### Custom Whitelist Logic
```javascript
// In your app, use these helpers:
import { firebaseConfigService } from './services/firebaseConfig';

// Check if user is whitelisted
const isWhitelisted = await firebaseConfigService.isUserWhitelisted(user.email);

// Add user to whitelist
await firebaseConfigService.addToWhitelist('user@company.com', true);

// Update whitelist config
await firebaseConfigService.updateWhitelistConfig({
  allowedDomains: ['company.com'],
  allowNewUsers: false,
  requireApproval: true
});
```

### Analytics & Monitoring
- **Usage tracking** - Automatically enabled
- **Failed login attempts** - Monitored and logged
- **Whitelist violations** - Real-time alerts
- **Performance metrics** - Built-in dashboard

## 📱 Mobile Setup

### React Native / Flutter
The same configuration works for mobile apps:
1. Use the same Firebase project
2. Add mobile app in Firebase Console
3. Download `google-services.json` / `GoogleService-Info.plist`
4. Use the same whitelist configuration

## 🚀 Production Deployment

### 1-Click Deployment
```bash
# Using Netlify
netlify deploy --prod --dir=dist

# Using Vercel
vercel --prod

# Manual deployment
npm run build
firebase deploy --only hosting
```

### Environment Variables for Production
```bash
# In your hosting provider, set these:
FIREBASE_API_KEY=prod-key
FIREBASE_PROJECT_ID=prod-project
# ... other Firebase config
```

## 🎓 Learning Resources

### Video Tutorials
- [Firebase Setup Walkthrough](https://example.com/setup-video) - 3 min
- [Whitelist Configuration](https://example.com/whitelist-video) - 2 min
- [Security Best Practices](https://example.com/security-video) - 5 min

### Code Examples
- **Basic setup**: `examples/basic-setup.js`
- **Advanced whitelist**: `examples/advanced-whitelist.js`
- **Custom rules**: `examples/custom-rules.js`

## 📞 Support

### Quick Help
- **Discord**: [BYOK Community](https://discord.gg/byok)
- **GitHub Issues**: [Report problems](https://github.com/your-repo/issues)
- **Email**: support@byok.ai

### Common Solutions
- **Setup stuck?** → Use the web wizard instead
- **Rules not working?** → Run `firebase deploy --only firestore:rules`
- **Whitelist issues?** → Check `firebase-setup/setup-summary.json`

---

## ✅ Success Checklist

After setup, verify these work:
- [ ] Users can sign in with Google
- [ ] Whitelist rules are enforced
- [ ] Admin can manage whitelist
- [ ] Usage tracking is working
- [ ] No permission errors in console

**🎉 You're done!** The system is now ready for production use with zero debugging required.