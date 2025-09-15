#!/usr/bin/env node

const fs = require('fs');
const path = require('path');
const readline = require('readline');

const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function ask(question) {
  return new Promise(resolve => {
    rl.question(question, resolve);
  });
}

async function setupFirebase() {
  console.log('\n🔧 BYOK Firebase & Netlify Setup\n');
  
  const projectId = await ask('Firebase Project ID: ');
  const apiKey = await ask('Firebase API Key: ');
  const messagingSenderId = await ask('Firebase Messaging Sender ID: ');
  const appId = await ask('Firebase App ID: ');
  const netlifyDomain = await ask('Netlify Domain (e.g., your-app.netlify.app): ');
  const adminEmail = await ask('Admin Email: ');
  
  const envContent = `# Firebase Configuration
VITE_FIREBASE_API_KEY=${apiKey}
VITE_FIREBASE_AUTH_DOMAIN=${projectId}.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=${projectId}
VITE_FIREBASE_STORAGE_BUCKET=${projectId}.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=${messagingSenderId}
VITE_FIREBASE_APP_ID=${appId}

# Netlify Configuration
VITE_NETLIFY_DOMAIN=${netlifyDomain}

# Admin Configuration
VITE_ADMIN_EMAIL=${adminEmail}

# BYOK System Settings
VITE_ENABLE_WHITELIST=true
VITE_REQUIRE_API_KEY=true
VITE_ENABLE_FIREBASE_AUTH=true`;

  fs.writeFileSync('.env', envContent);
  console.log('\n✅ .env file created successfully!');
  console.log('✅ Firebase and Netlify configuration complete!');
  
  rl.close();
}

async function setupAdmin() {
  console.log('\n👤 Add Admin User\n');
  const email = await ask('Admin Email: ');
  
  const adminConfig = {
    admins: [email],
    createdAt: new Date().toISOString()
  };
  
  fs.writeFileSync('firebase-setup/admin-config.json', JSON.stringify(adminConfig, null, 2));
  console.log('\n✅ Admin user added successfully!');
  
  rl.close();
}

const command = process.argv[2];

if (command === 'firebase') {
  setupFirebase();
} else if (command === 'admin') {
  setupAdmin();
} else {
  console.log('\nBYOK CLI Commands:');
  console.log('  node cli/setup.js firebase  - Setup Firebase & Netlify');
  console.log('  node cli/setup.js admin     - Add admin user');
  console.log('');
  console.log('After setup, run:');
  console.log('  npm run dev');
  rl.close();
}