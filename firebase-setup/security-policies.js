/**
 * Security Policies for BYOK Firebase Whitelist System
 * Comprehensive security configuration with validation and monitoring
 */

const securityPolicies = {
  // Authentication policies
  authentication: {
    requireEmailVerification: true,
    allowedDomains: [],
    allowedEmails: [],
    maxLoginAttempts: 5,
    lockoutDuration: 15 * 60 * 1000, // 15 minutes
    sessionTimeout: 24 * 60 * 60 * 1000, // 24 hours
  },

  // Firestore security rules
  firestoreRules: {
    whitelist: {
      read: "request.auth != null && request.auth.token.email_verified == true",
      write: "request.auth != null && request.auth.token.admin == true"
    },
    config: {
      read: "request.auth != null",
      write: "request.auth != null && request.auth.token.admin == true"
    },
    users: {
      read: "request.auth != null && request.auth.uid == resource.id",
      write: "request.auth != null && request.auth.uid == resource.id"
    },
    usage_stats: {
      read: "request.auth != null && request.auth.token.admin == true",
      write: "request.auth != null && request.auth.token.admin == true"
    }
  },

  // Rate limiting
  rateLimiting: {
    loginAttempts: {
      window: 15 * 60 * 1000, // 15 minutes
      maxAttempts: 5
    },
    apiCalls: {
      window: 60 * 1000, // 1 minute
      maxRequests: 100
    },
    whitelistChecks: {
      window: 60 * 1000, // 1 minute
      maxChecks: 50
    }
  },

  // Validation rules
  validation: {
    email: {
      pattern: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
      maxLength: 254,
      blacklist: ['test@test.com', 'admin@example.com']
    },
    domain: {
      pattern: /^[a-zA-Z0-9][a-zA-Z0-9-]*[a-zA-Z0-9]*$/,
      maxLength: 253,
      blacklist: ['test.com', 'example.com']
    }
  },

  // Monitoring and logging
  monitoring: {
    logAuthAttempts: true,
    logWhitelistChecks: true,
    logFailedLogins: true,
    logPermissionDenied: true,
    retentionPeriod: 30 * 24 * 60 * 60 * 1000 // 30 days
  },

  // Error handling
  errorHandling: {
    genericErrorMessage: "Authentication failed. Please try again.",
    detailedErrors: false,
    contactSupport: "Contact support@byok.ai for assistance"
  }
};

// Helper functions for security validation
const securityHelpers = {
  // Check if email is whitelisted
  isEmailWhitelisted: (email, allowedEmails, allowedDomains) => {
    if (!email || typeof email !== 'string') return false;
    
    // Check specific email whitelist
    if (allowedEmails && allowedEmails.includes(email)) {
      return true;
    }
    
    // Check domain whitelist
    if (allowedDomains && allowedDomains.length > 0) {
      const emailDomain = email.split('@')[1];
      return allowedDomains.includes(emailDomain);
    }
    
    return false;
  },

  // Validate email format
  isValidEmail: (email) => {
    if (!email || typeof email !== 'string') return false;
    return securityPolicies.validation.email.pattern.test(email);
  },

  // Validate domain format
  isValidDomain: (domain) => {
    if (!domain || typeof domain !== 'string') return false;
    return securityPolicies.validation.domain.pattern.test(domain);
  },

  // Check rate limiting
  checkRateLimit: (key, limit, window) => {
    // Implementation would use Firebase Realtime Database or Redis
    return true; // Placeholder for actual implementation
  },

  // Log security events
  logSecurityEvent: (event, userId, details) => {
    if (securityPolicies.monitoring.logAuthAttempts) {
      console.log(`Security Event: ${event}`, {
        userId,
        details,
        timestamp: new Date().toISOString()
      });
    }
  }
};

// Firestore security rules template
const firestoreRulesTemplate = `rules_version = '2';
service cloud.firestore {
  match /databases/{database}/documents {
    // Whitelist configuration
    match /whitelist/config {
      allow read: if request.auth != null 
        && request.auth.token.email_verified == true;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // User whitelist entries
    match /whitelist/users/{userId} {
      allow read: if request.auth != null 
        && request.auth.uid == userId;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // Admin users
    match /admins/{adminId} {
      allow read: if request.auth != null 
        && request.auth.token.admin == true;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // Whitelist requests
    match /whitelist_requests/{requestId} {
      allow create: if request.auth != null;
      allow read: if request.auth != null 
        && (request.auth.uid == resource.data.userId || 
            request.auth.token.admin == true);
      allow update: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // Usage statistics
    match /usage_stats/{statId} {
      allow read: if request.auth != null 
        && request.auth.token.admin == true;
      allow write: if request.auth != null 
        && request.auth.token.admin == true;
    }
    
    // User profiles
    match /users/{userId} {
      allow read: if request.auth != null 
        && request.auth.uid == userId;
      allow write: if request.auth != null 
        && request.auth.uid == userId;
    }
  }
}`;

// Export for use in other modules
module.exports = {
  securityPolicies,
  securityHelpers,
  firestoreRulesTemplate
};