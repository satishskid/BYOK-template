# 🔧 Firebase Setup Scripts & Tools

This directory contains automated tools for seamless Firebase configuration.

## 📁 Files Overview

| File | Purpose | Usage |
|---|---|---|
| `firebase-admin-setup.js` | One-click admin setup | `node firebase-admin-setup.js` |
| `security-policies.js` | Security configuration | Imported by setup script |
| `firebase-rules.json` | Firestore security rules | Auto-deployed |
| `service-account.json` | Firebase service account | Download from console |

## 🚀 Quick Start Commands

### 1. Initial Setup
```bash
# Install dependencies
npm install firebase-admin

# Run interactive setup
node firebase-admin-setup.js
```

### 2. Advanced Commands
```bash
# Check current setup
node firebase-admin-setup.js --check

# Reset configuration
node firebase-admin-setup.js --reset

# Deploy only security rules
node firebase-admin-setup.js --deploy-rules

# Generate sample data
node firebase-admin-setup.js --sample-data
```

### 3. Manual Steps (If Needed)
```bash
# Deploy security rules manually
firebase deploy --only firestore:rules

# Check Firebase status
firebase projects:list
```

## 🔧 Service Account Setup

1. **Go to Firebase Console** → Project Settings → Service Accounts
2. **Click "Generate new private key"**
3. **Save as** `service-account.json` in this directory
4. **Run setup script**: `node firebase-admin-setup.js`

## 📊 Setup Summary

After running setup, check these files:
- `setup-summary.json` - Complete setup log
- `whitelist-config.json` - Whitelist configuration
- `security-report.json` - Security rules status

## 🛠️ Troubleshooting

### Common Issues

| Issue | Solution |
|---|---|
| "Service account not found" | Check `service-account.json` exists |
| "Permission denied" | Verify Firebase project permissions |
| "Rules deployment failed" | Run `firebase deploy --only firestore:rules` |
| "Network error" | Check internet connection |

### Debug Mode
```bash
# Enable debug logging
DEBUG=firebase:* node firebase-admin-setup.js

# Verbose output
node firebase-admin-setup.js --verbose
```

## 🎯 Testing Your Setup

### 1. Configuration Test
```bash
node firebase-admin-setup.js --test-config
```

### 2. Security Rules Test
```bash
node firebase-admin-setup.js --test-rules
```

### 3. Whitelist Test
```bash
node firebase-admin-setup.js --test-whitelist
```

## 📱 Integration Examples

### React Component
```javascript
import { firebaseConfigService } from '../services/firebaseConfig';

// Check setup status
const isConfigured = await firebaseConfigService.isConfigured();

// Get whitelist config
const config = await firebaseConfigService.getWhitelistConfig();
```

### Node.js Backend
```javascript
const { initializeFirebase } = require('./firebase-admin-setup');

// Initialize with custom config
await initializeFirebase({
  projectId: 'your-project',
  whitelist: ['user@domain.com']
});
```

## 🔄 Updates & Maintenance

### Updating Security Rules
```bash
# Pull latest rules
node firebase-admin-setup.js --update-rules

# Backup current rules
node firebase-admin-setup.js --backup-rules
```

### Monitoring
```bash
# Check usage stats
node firebase-admin-setup.js --stats

# Security audit
node firebase-admin-setup.js --audit
```