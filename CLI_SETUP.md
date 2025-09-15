# BYOK CLI Setup Guide

This guide covers how to use the CLI tools for easy Firebase configuration and admin management.

## Quick Start

### 1. Firebase & Netlify Setup via CLI

```bash
# Interactive setup
npm run setup:firebase

# Or use the CLI directly
node cli/setup.js firebase
```

You'll be prompted for:
- Firebase Project ID
- Firebase API Key
- Firebase Messaging Sender ID
- Firebase App ID
- Netlify Domain
- Admin Email

### 2. Add Admin User

```bash
# Add admin for whitelist management
npm run setup:admin

# Or use the CLI directly
node cli/setup.js admin
```

## CLI Commands

### Available Scripts

- `npm run setup` - Show help and available commands
- `npm run setup:firebase` - Setup Firebase & Netlify configuration
- `npm run setup:admin` - Add admin user for whitelist management

### Manual CLI Usage

```bash
# Show all commands
node cli/setup.js

# Setup Firebase configuration
node cli/setup.js firebase

# Add admin user
node cli/setup.js admin
```

## Web Admin Dashboard

The BYOK template includes a web-based admin dashboard for managing whitelist users:

### Accessing Admin Dashboard

1. **Sign in to the app** with your Google account
2. **Click "Admin Dashboard"** button in the header
3. **Sign in with admin credentials** (email/password)
4. **Manage whitelist users** through the interface

### Admin Dashboard Features

- **Whitelisted Users**: Add/remove users from whitelist
- **Pending Requests**: Approve/reject whitelist requests
- **Domain Management**: Configure domain-based whitelisting
- **Analytics**: View user activity and request statistics

### Setting Up Admin Access

1. **Create admin user**:
   ```bash
   npm run setup:admin
   ```

2. **Configure admin email** in Firebase Authentication
   - Go to Firebase Console → Authentication → Users
   - Add your admin email as a user
   - Update `firebase-setup/admin-config.json` with admin emails

3. **Enable admin dashboard**:
   - The admin dashboard is automatically available when Firebase is configured
   - Access via the "Admin Dashboard" button in the app header

## Configuration Files

### Environment Variables (.env)

The CLI creates a `.env` file with all necessary configuration:

```bash
# Firebase Configuration
VITE_FIREBASE_API_KEY=your-api-key
VITE_FIREBASE_AUTH_DOMAIN=your-project.firebaseapp.com
VITE_FIREBASE_PROJECT_ID=your-project-id
VITE_FIREBASE_STORAGE_BUCKET=your-project.appspot.com
VITE_FIREBASE_MESSAGING_SENDER_ID=123456789
VITE_FIREBASE_APP_ID=1:123456789:web:abcdef123456

# Netlify Configuration
VITE_NETLIFY_DOMAIN=your-app.netlify.app

# Admin Configuration
VITE_ADMIN_EMAIL=admin@yourdomain.com
```

### Admin Configuration (firebase-setup/admin-config.json)

```json
{
  "admins": ["admin@yourdomain.com"],
  "createdAt": "2024-01-01T00:00:00.000Z"
}
```

## Netlify Deployment

### Automatic Setup

The CLI includes Netlify configuration in the setup process:

1. **During Firebase setup**, provide your Netlify domain
2. **Environment variables** are automatically configured
3. **Deploy scripts** are added to package.json

### Manual Netlify Setup

If you need to configure Netlify separately:

1. **Install Netlify CLI**:
   ```bash
   npm install -g netlify-cli
   ```

2. **Login to Netlify**:
   ```bash
   netlify login
   ```

3. **Deploy**:
   ```bash
   npm run build
   netlify deploy --prod
   ```

## Troubleshooting

### Common Issues

1. **Firebase configuration not loading**:
   - Check that `.env` file exists and has correct values
   - Verify Firebase project settings match your configuration
   - Ensure Firebase Authentication is enabled in console

2. **Admin dashboard not accessible**:
   - Verify admin email is added to `firebase-setup/admin-config.json`
   - Check Firebase Authentication rules allow admin access
   - Ensure the admin user exists in Firebase Authentication

3. **Netlify domain issues**:
   - Verify domain matches your Netlify site settings
   - Check that environment variables are set in Netlify dashboard
   - Ensure custom domain is properly configured

### Verification Steps

1. **Check configuration**:
   ```bash
   cat .env
   ```

2. **Test admin access**:
   - Open the app in browser
   - Click "Admin Dashboard"
   - Try to sign in with admin credentials

3. **Verify whitelist functionality**:
   - Add a test email via admin dashboard
   - Check that the user can access the app

## Security Notes

- **Admin emails** are stored in `firebase-setup/admin-config.json`
- **Whitelist users** are managed through Firebase Firestore
- **Environment variables** should never be committed to version control
- **Admin dashboard** requires authentication and proper admin permissions

## Support

For issues with CLI setup or admin dashboard:

1. Check the troubleshooting section above
2. Verify all configuration files exist and have correct values
3. Check browser console for any JavaScript errors
4. Review Firebase console for authentication and database rules