/**
 * Firebase Admin SDK Setup Script
 * One-click setup for BYOK Firebase whitelist system
 * 
 * Usage:
 * 1. Run: node firebase-setup/firebase-admin-setup.js
 * 2. Follow the interactive prompts
 * 3. Your Firebase whitelist system will be configured automatically
 */

const admin = require('firebase-admin');
const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

// Default configuration
const DEFAULT_CONFIG = {
  whitelist: {
    allowedDomains: [],
    allowedEmails: [],
    allowNewUsers: true,
    requireApproval: false
  },
  admin: {
    projectName: 'BYOK Firebase System',
    createdAt: new Date().toISOString()
  }
};

// Questions for interactive setup
const questions = [
  {
    question: 'Enter your Firebase service account key file path (JSON): ',
    key: 'serviceAccountPath',
    required: true
  },
  {
    question: 'Project name (default: BYOK Firebase System): ',
    key: 'projectName',
    default: 'BYOK Firebase System'
  },
  {
    question: 'Enable email whitelist? (y/n): ',
    key: 'enableWhitelist',
    type: 'boolean'
  },
  {
    question: 'Allow new users to register? (y/n): ',
    key: 'allowNewUsers',
    type: 'boolean',
    default: true
  },
  {
    question: 'Require admin approval for new users? (y/n): ',
    key: 'requireApproval',
    type: 'boolean',
    default: false
  }
];

class FirebaseSetup {
  constructor() {
    this.answers = {};
    this.admin = null;
  }

  async askQuestion(questionObj) {
    return new Promise((resolve) => {
      const prompt = questionObj.default 
        ? `${questionObj.question} (${questionObj.default}): `
        : questionObj.question;
      
      rl.question(prompt, (answer) => {
        let finalAnswer = answer.trim() || questionObj.default;
        
        if (questionObj.type === 'boolean') {
          finalAnswer = finalAnswer.toLowerCase() === 'y' || finalAnswer === 'true';
        }
        
        resolve(finalAnswer);
      });
    });
  }

  async initializeFirebase() {
    console.log('🔧 Initializing Firebase Admin...');
    
    if (!fs.existsSync(this.answers.serviceAccountPath)) {
      throw new Error(`Service account file not found: ${this.answers.serviceAccountPath}`);
    }

    const serviceAccount = require(path.resolve(this.answers.serviceAccountPath));
    
    admin.initializeApp({
      credential: admin.credential.cert(serviceAccount)
    });

    this.admin = admin;
    console.log('✅ Firebase Admin initialized successfully');
  }

  async setupSecurityRules() {
    console.log('🔒 Setting up security rules...');
    
    const rulesPath = path.join(__dirname, 'firebase-rules.json');
    if (!fs.existsSync(rulesPath)) {
      throw new Error(`Security rules file not found: ${rulesPath}`);
    }

    const rules = JSON.parse(fs.readFileSync(rulesPath, 'utf8'));
    
    try {
      await this.admin.securityRules().releaseFirestoreRulesetFromSource(JSON.stringify(rules));
      console.log('✅ Security rules deployed successfully');
    } catch (error) {
      console.error('❌ Error deploying security rules:', error.message);
      throw error;
    }
  }

  async setupWhitelistConfig() {
    console.log('📝 Setting up whitelist configuration...');
    
    const db = this.admin.firestore();
    
    const whitelistConfig = {
      ...DEFAULT_CONFIG.whitelist,
      allowNewUsers: this.answers.allowNewUsers,
      requireApproval: this.answers.requireApproval
    };

    const adminConfig = {
      ...DEFAULT_CONFIG.admin,
      projectName: this.answers.projectName,
      createdAt: new Date().toISOString()
    };

    try {
      await db.collection('config').doc('whitelist').set(whitelistConfig);
      await db.collection('config').doc('admin').set(adminConfig);
      console.log('✅ Whitelist configuration saved');
    } catch (error) {
      console.error('❌ Error saving whitelist config:', error.message);
      throw error;
    }
  }

  async createInitialCollections() {
    console.log('📊 Creating initial collections...');
    
    const db = this.admin.firestore();
    
    const collections = [
      'whitelist_requests',
      'usage_stats',
      'users'
    ];

    try {
      for (const collectionName of collections) {
        await db.collection(collectionName).doc('_init').set({
          createdAt: new Date().toISOString(),
          initialized: true
        });
        console.log(`✅ Created ${collectionName} collection`);
      }
    } catch (error) {
      console.error('❌ Error creating collections:', error.message);
      throw error;
    }
  }

  async createSetupSummary() {
    console.log('📋 Creating setup summary...');
    
    const summary = {
      projectName: this.answers.projectName,
      setupDate: new Date().toISOString(),
      whitelistEnabled: this.answers.enableWhitelist,
      allowNewUsers: this.answers.allowNewUsers,
      requireApproval: this.answers.requireApproval,
      collections: ['config', 'whitelist_requests', 'usage_stats', 'users'],
      securityRules: 'firebase-rules.json',
      nextSteps: [
        'Configure your web app with Firebase config',
        'Test the whitelist system',
        'Add admin users to the system',
        'Customize whitelist settings as needed'
      ]
    };

    const summaryPath = path.join(__dirname, 'setup-summary.json');
    fs.writeFileSync(summaryPath, JSON.stringify(summary, null, 2));
    console.log(`✅ Setup summary saved to ${summaryPath}`);
  }

  async runInteractiveSetup() {
    console.log('🚀 BYOK Firebase Setup Wizard');
    console.log('=' .repeat(50));
    console.log('This wizard will help you set up Firebase for your BYOK system.');
    console.log('');

    for (const question of questions) {
      const answer = await this.askQuestion(question);
      this.answers[question.key] = answer;
    }

    rl.close();

    try {
      await this.initializeFirebase();
      await this.setupSecurityRules();
      await this.setupWhitelistConfig();
      await this.createInitialCollections();
      await this.createSetupSummary();

      console.log('');
      console.log('🎉 Firebase setup completed successfully!');
      console.log('');
      console.log('Next steps:');
      console.log('1. Copy the Firebase config to your web app');
      console.log('2. Test user registration and whitelist functionality');
      console.log('3. Add admin users as needed');
      console.log('');
      console.log('For support, check the documentation in docs/ folder');

    } catch (error) {
      console.error('❌ Setup failed:', error.message);
      process.exit(1);
    }
  }

  // Quick setup method for automated deployment
  async quickSetup(serviceAccountPath, options = {}) {
    this.answers = {
      serviceAccountPath,
      projectName: options.projectName || 'BYOK Firebase System',
      enableWhitelist: options.enableWhitelist || false,
      allowNewUsers: options.allowNewUsers !== false,
      requireApproval: options.requireApproval || false
    };

    await this.initializeFirebase();
    await this.setupSecurityRules();
    await this.setupWhitelistConfig();
    await this.createInitialCollections();
    await this.createSetupSummary();

    console.log('✅ Quick setup completed successfully');
  }
}

// CLI execution
if (require.main === module) {
  const setup = new FirebaseSetup();
  setup.runInteractiveSetup().catch(console.error);
}

module.exports = FirebaseSetup;