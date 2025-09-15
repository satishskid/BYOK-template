#!/usr/bin/env node

/**
 * BYOK CLI Tool
 * Easy Firebase configuration and whitelist management via command line
 * Usage: node cli/byok-cli.js [command] [options]
 */

const fs = require('fs');
const path = require('path');
const readline = require('readline');
const { execSync } = require('child_process');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

class BYOKCLI {
  constructor() {
    this.configPath = path.join(__dirname, '..', '.env');
    this.firebaseConfigPath = path.join(__dirname, '..', 'src', 'services', 'firebaseConfig.ts');
  }

  async run() {
    const command = process.argv[2];
    const options = process.argv.slice(3);

    switch (command) {
      case 'init':
        await this.initFirebase();
        break;
      case 'config':
        await this.configureFirebase();
        break;
      case 'whitelist':
        await this.manageWhitelist();
        break;
      case 'deploy':
        await this.deployToNetlify();
        break;
      case 'admin':
        await this.createAdminUser();
        break;
      case 'help':
      default:
        this.showHelp();
        break;
    }
  }

  showHelp() {
    console.log(`
🚀 BYOK CLI Tool - Easy Firebase & Netlify Setup

Usage: node cli/byok-cli.js [command] [options]

Commands:
  init              Initialize Firebase project and create .env file
  config            Configure Firebase settings interactively
  whitelist         Manage whitelist users (add/remove/list)
  deploy            Deploy to Netlify with custom domain
  admin             Create admin user for dashboard access
  help              Show this help message

Examples:
  node cli/byok-cli.js init
  node cli/byok-cli.js config --project-id my-project
  node cli/byok-cli.js whitelist add user@company.com
  node cli/byok-cli.js deploy --domain myapp.netlify.app
    `);
  }

  async initFirebase() {
    console.log('🔧 Initializing BYOK Firebase Setup...');
    
    const answers = await this.askQuestions([
      {
        question: 'Enter your Firebase Project ID: ',
        key: 'projectId',
        required: true
      },
      {
        question: 'Enter your Firebase API Key: ',
        key: 'apiKey',
        required: true
      },
      {
        question: 'Enter your Firebase Auth Domain: ',
        key: 'authDomain',
        required: true
      },
      {
        question: 'Enter your Firebase Storage Bucket: ',
        key: 'storageBucket',
        required: false
      },
      {
        question: 'Enter your Firebase Messaging Sender ID: ',
        key: 'messagingSenderId',
        required: false
      },
      {
        question: 'Enter your Firebase App ID: ',
        key: 'appId',
        required: false
      }
    ]);

    await this.createEnvFile(answers);
    await this.createFirebaseConfig(answers);
    
    console.log('✅ Firebase configuration completed!');
    console.log('📝 Check .env file for your configuration');
  }

  async configureFirebase() {
    console.log('⚙️  Configuring Firebase Settings...');
    
    if (!fs.existsSync(this.configPath)) {
      console.log('❌ No .env file found. Run "init" command first.');
      return;
    }

    const answers = await this.askQuestions([
      {
        question: 'Enable whitelist feature? (y/n): ',
        key: 'whitelistEnabled',
        type: 'boolean',
        default: 'y'
      },
      {
        question: 'Admin email for dashboard access: ',
        key: 'adminEmail',
        required: true
      },
      {
        question: 'Enable debug mode? (y/n): ',
        key: 'debugMode',
        type: 'boolean',
        default: 'n'
      }
    ]);

    await this.updateEnvFile(answers);
    console.log('✅ Firebase configuration updated!');
  }

  async manageWhitelist() {
    const action = process.argv[3];
    const email = process.argv[4];

    switch (action) {
      case 'add':
        await this.addToWhitelist(email);
        break;
      case 'remove':
        await this.removeFromWhitelist(email);
        break;
      case 'list':
        await this.listWhitelist();
        break;
      default:
        console.log(`
Whitelist Management:
  add <email>     Add user to whitelist
  remove <email>   Remove user from whitelist
  list             Show all whitelisted users
        `);
    }
  }

  async addToWhitelist(email) {
    if (!email) {
      console.log('❌ Please provide an email address');
      return;
    }

    if (!this.isValidEmail(email)) {
      console.log('❌ Invalid email format');
      return;
    }

    console.log(`✅ Adding ${email} to whitelist...`);
    
    // Add to whitelist via Firebase Admin SDK
    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('../firebase-setup/service-account.json');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      const db = admin.firestore();
      await db.collection('whitelist').doc('users').set({
        [email]: {
          email: email,
          isWhitelisted: true,
          addedAt: new Date().toISOString(),
          addedBy: 'cli-tool'
        }
      }, { merge: true });

      console.log(`✅ ${email} has been added to whitelist`);
    } catch (error) {
      console.log(`❌ Error adding to whitelist: ${error.message}`);
    }
  }

  async removeFromWhitelist(email) {
    if (!email) {
      console.log('❌ Please provide an email address');
      return;
    }

    console.log(`🗑️  Removing ${email} from whitelist...`);
    
    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('../firebase-setup/service-account.json');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      const db = admin.firestore();
      await db.collection('whitelist').doc('users').update({
        [email]: admin.firestore.FieldValue.delete()
      });

      console.log(`✅ ${email} has been removed from whitelist`);
    } catch (error) {
      console.log(`❌ Error removing from whitelist: ${error.message}`);
    }
  }

  async listWhitelist() {
    console.log('📋 Whitelisted Users:');
    
    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('../firebase-setup/service-account.json');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      const db = admin.firestore();
      const whitelistDoc = await db.collection('whitelist').doc('users').get();
      
      if (whitelistDoc.exists) {
        const data = whitelistDoc.data();
        Object.keys(data).forEach(email => {
          console.log(`  📧 ${email} - ${data[email].isWhitelisted ? 'Whitelisted' : 'Pending'}`);
        });
      } else {
        console.log('  📝 No whitelisted users found');
      }
    } catch (error) {
      console.log(`❌ Error listing whitelist: ${error.message}`);
    }
  }

  async deployToNetlify() {
    console.log('🚀 Deploying to Netlify...');
    
    const domain = process.argv[4] || await this.askQuestion('Enter Netlify domain (e.g., myapp.netlify.app): ');
    
    if (!domain) {
      console.log('❌ Please provide a domain name');
      return;
    }

    // Update environment variables
    await this.updateEnvFile({ VITE_NETLIFY_DOMAIN: domain });
    
    // Build and deploy
    try {
      console.log('📦 Building project...');
      execSync('npm run build', { stdio: 'inherit' });
      
      console.log('🚀 Deploying to Netlify...');
      execSync('netlify deploy --prod --dir=dist', { stdio: 'inherit' });
      
      console.log(`✅ Successfully deployed to ${domain}`);
    } catch (error) {
      console.log(`❌ Error deploying to Netlify: ${error.message}`);
    }
  }

  async createAdminUser() {
    console.log('👑 Creating Admin User...');
    
    const email = process.argv[4] || await this.askQuestion('Enter admin email: ');
    
    if (!email || !this.isValidEmail(email)) {
      console.log('❌ Please provide a valid email address');
      return;
    }

    try {
      const admin = require('firebase-admin');
      const serviceAccount = require('../firebase-setup/service-account.json');
      
      if (!admin.apps.length) {
        admin.initializeApp({
          credential: admin.credential.cert(serviceAccount)
        });
      }

      const db = admin.firestore();
      
      // Create admin user
      await db.collection('admins').doc(email).set({
        email: email,
        role: 'admin',
        createdAt: new Date().toISOString(),
        isActive: true,
        permissions: {
          manageWhitelist: true,
          viewAnalytics: true,
          manageUsers: true
        }
      });

      // Also add to whitelist
      await db.collection('whitelist').doc('users').set({
        [email]: {
          email: email,
          isWhitelisted: true,
          addedAt: new Date().toISOString(),
          role: 'admin'
        }
      }, { merge: true });

      console.log(`✅ Admin user ${email} created successfully`);
      console.log('🔗 Access admin dashboard at: /admin');
    } catch (error) {
      console.log(`❌ Error creating admin user: ${error.message}`);
    }
  }

  async askQuestions(questions) {
    const answers = {};
    
    for (const q of questions) {
      const answer = await this.askQuestion(q.question);
      
      if (q.type === 'boolean') {
        answers[q.key] = answer.toLowerCase().startsWith('y');
      } else {
        answers[q.key] = answer || q.default || '';
      }
    }
    
    return answers;
  }

  askQuestion(question) {
    return new Promise(resolve => {
      rl.question(question, resolve);
    });
  }

  async createEnvFile(config) {
    const envContent = `
# Firebase Configuration
VITE_FIREBASE_API_KEY=${config.apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${config.authDomain}
VITE_FIREBASE_PROJECT_ID=${config.projectId}
VITE_FIREBASE_STORAGE_BUCKET=${config.storageBucket || ''}
VITE_FIREBASE_MESSAGING_SENDER_ID=${config.messagingSenderId || ''}
VITE_FIREBASE_APP_ID=${config.appId || ''}

# BYOK Configuration
VITE_FIREBASE_WHITELIST_ENABLED=true
VITE_FIREBASE_ADMIN_EMAIL=admin@yourdomain.com
VITE_DEBUG_MODE=false

# Netlify Configuration
VITE_NETLIFY_DOMAIN=
`;

    fs.writeFileSync(this.configPath, envContent.trim());
  }

  async updateEnvFile(updates) {
    let envContent = fs.readFileSync(this.configPath, 'utf8');
    
    Object.keys(updates).forEach(key => {
      const regex = new RegExp(`^${key}=.*$`, 'gm');
      const newLine = `${key}=${updates[key]}`;
      
      if (regex.test(envContent)) {
        envContent = envContent.replace(regex, newLine);
      } else {
        envContent += `\n${newLine}`;
      }
    });
    
    fs.writeFileSync(this.configPath, envContent);
  }

  isValidEmail(email) {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  }
}

// Run CLI if called directly
if (require.main === module) {
  const cli = new BYOKCLI();
  cli.run().then(() => {
    rl.close();
  }).catch(error => {
    console.error('❌ CLI Error:', error);
    rl.close();
  });
}

module.exports = BYOKCLI;