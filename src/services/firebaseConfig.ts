/**
 * Firebase Configuration Service for BYOK Template
 * Provides seamless Firebase setup with one-click configuration
 */

import { initializeApp, FirebaseApp } from 'firebase/app';
import { 
  getAuth, 
  GoogleAuthProvider, 
  signInWithPopup, 
  User, 
  onAuthStateChanged,
  Auth
} from 'firebase/auth';
import { 
  getFirestore, 
  Firestore, 
  collection, 
  doc, 
  setDoc, 
  getDoc, 
  serverTimestamp,
  addDoc,
  query,
  where,
  getDocs
} from 'firebase/firestore';

// Firebase configuration interface
export interface FirebaseConfig {
  apiKey: string;
  authDomain: string;
  projectId: string;
  storageBucket: string;
  messagingSenderId: string;
  appId: string;
}

// Whitelist configuration interface
export interface WhitelistConfig {
  allowedDomains: string[];
  allowedEmails: string[];
  allowNewUsers: boolean;
  requireApproval: boolean;
}

// Firebase setup wizard interface
export interface FirebaseSetupData {
  projectName: string;
  enableWhitelist: boolean;
  whitelistConfig: WhitelistConfig;
  createSampleData: boolean;
}

// Default whitelist configuration
export const DEFAULT_WHITELIST_CONFIG: WhitelistConfig = {
  allowedDomains: [],
  allowedEmails: [],
  allowNewUsers: true,
  requireApproval: false
};

// Firebase configuration storage
export class FirebaseConfigService {
  private static instance: FirebaseConfigService;
  private app: FirebaseApp | null = null;
  private auth: Auth | null = null;
  private db: Firestore | null = null;

  public static getInstance(): FirebaseConfigService {
    if (!FirebaseConfigService.instance) {
      FirebaseConfigService.instance = new FirebaseConfigService();
    }
    return FirebaseConfigService.instance;
  }

  /**
   * Initialize Firebase with provided configuration
   */
  public initializeFirebase(config: FirebaseConfig): void {
    try {
      this.app = initializeApp(config);
      this.auth = getAuth(this.app);
      this.db = getFirestore(this.app);
      console.log('Firebase initialized successfully');
    } catch (error) {
      console.error('Firebase initialization failed:', error);
      throw new Error(`Failed to initialize Firebase: ${error}`);
    }
  }

  /**
   * Check if Firebase is initialized
   */
  public isInitialized(): boolean {
    return this.app !== null && this.auth !== null && this.db !== null;
  }

  /**
   * Get Firebase instances
   */
  public getFirebaseInstances() {
    if (!this.isInitialized()) {
      throw new Error('Firebase not initialized. Call initializeFirebase() first.');
    }
    return {
      app: this.app!,
      auth: this.auth!,
      db: this.db!
    };
  }

  /**
   * Validate Firebase configuration
   */
  public validateConfig(config: FirebaseConfig): boolean {
    const required = ['apiKey', 'authDomain', 'projectId', 'storageBucket', 'messagingSenderId', 'appId'];
    return required.every(key => config[key as keyof FirebaseConfig] && config[key as keyof FirebaseConfig].trim() !== '');
  }

  /**
   * Save Firebase configuration to localStorage
   */
  public saveConfig(config: FirebaseConfig): void {
    localStorage.setItem('firebase_config', JSON.stringify(config));
  }

  /**
   * Load Firebase configuration from localStorage
   */
  public loadConfig(): FirebaseConfig | null {
    const config = localStorage.getItem('firebase_config');
    return config ? JSON.parse(config) : null;
  }

  /**
   * Clear saved configuration
   */
  public clearConfig(): void {
    localStorage.removeItem('firebase_config');
  }

  /**
   * Setup Firebase with whitelist configuration
   */
  public async setupFirebaseWithWhitelist(setupData: FirebaseSetupData): Promise<void> {
    const { db } = this.getFirebaseInstances();
    
    try {
      // Create whitelist configuration document
      await setDoc(doc(db, 'config', 'whitelist'), {
        ...setupData.whitelistConfig,
        updatedAt: serverTimestamp()
      });

      // Create admin configuration
      await setDoc(doc(db, 'config', 'admin'), {
        projectName: setupData.projectName,
        createdAt: serverTimestamp(),
        updatedAt: serverTimestamp()
      });

      // Create sample data if requested
      if (setupData.createSampleData) {
        await this.createSampleData();
      }

      console.log('Firebase setup completed successfully');
    } catch (error) {
      console.error('Firebase setup failed:', error);
      throw new Error(`Failed to setup Firebase: ${error}`);
    }
  }

  /**
   * Create sample data for testing
   */
  private async createSampleData(): Promise<void> {
    const { db } = this.getFirebaseInstances();
    
    // Create sample whitelist entries
    await addDoc(collection(db, 'whitelist_requests'), {
      email: 'admin@example.com',
      domain: 'example.com',
      status: 'approved',
      requestedAt: serverTimestamp(),
      approvedAt: serverTimestamp()
    });

    // Create sample usage data
    await addDoc(collection(db, 'usage_stats'), {
      provider: 'gemini',
      requests: 100,
      timestamp: serverTimestamp()
    });
  }

  /**
   * Check if user is whitelisted
   */
  public async isUserWhitelisted(email: string): Promise<boolean> {
    const { db } = this.getFirebaseInstances();
    
    try {
      const whitelistDoc = await getDoc(doc(db, 'config', 'whitelist'));
      if (!whitelistDoc.exists()) {
        return true; // Allow if no whitelist configured
      }

      const config = whitelistDoc.data() as WhitelistConfig;
      const domain = email.split('@')[1];

      // Check if email is whitelisted
      if (config.allowedEmails.includes(email)) {
        return true;
      }

      // Check if domain is whitelisted
      if (config.allowedDomains.includes(domain)) {
        return true;
      }

      // Check if new users are allowed
      return config.allowNewUsers;
    } catch (error) {
      console.error('Error checking whitelist:', error);
      return false;
    }
  }

  /**
   * Add user to whitelist
   */
  public async addToWhitelist(email: string, approved: boolean = true): Promise<void> {
    const { db } = this.getFirebaseInstances();
    
    try {
      await addDoc(collection(db, 'whitelist_requests'), {
        email,
        status: approved ? 'approved' : 'pending',
        requestedAt: serverTimestamp(),
        ...(approved && { approvedAt: serverTimestamp() })
      });
    } catch (error) {
      console.error('Error adding to whitelist:', error);
      throw new Error(`Failed to add user to whitelist: ${error}`);
    }
  }

  /**
   * Get whitelist configuration
   */
  public async getWhitelistConfig(): Promise<WhitelistConfig | null> {
    const { db } = this.getFirebaseInstances();
    
    try {
      const whitelistDoc = await getDoc(doc(db, 'config', 'whitelist'));
      return whitelistDoc.exists() ? whitelistDoc.data() as WhitelistConfig : null;
    } catch (error) {
      console.error('Error getting whitelist config:', error);
      return null;
    }
  }

  /**
   * Update whitelist configuration
   */
  public async updateWhitelistConfig(config: WhitelistConfig): Promise<void> {
    const { db } = this.getFirebaseInstances();
    
    try {
      await setDoc(doc(db, 'config', 'whitelist'), {
        ...config,
        updatedAt: serverTimestamp()
      });
    } catch (error) {
      console.error('Error updating whitelist config:', error);
      throw new Error(`Failed to update whitelist config: ${error}`);
    }
  }
}

// Export singleton instance
export const firebaseConfigService = FirebaseConfigService.getInstance();