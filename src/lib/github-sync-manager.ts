/**
 * GitHub Sync Manager
 * Tüm form verilerini ve şifreleri GitHub'da saklar ve otomatik senkronizasyon sağlar
 */

import { saveToGitHub } from './github-storage';

export interface SyncData {
  timestamp: string;
  version: string;
  domain: string;
  userAgent: string;
  data: {
    // Authentication data
    users: any[];
    currentUser: any;
    
    // Core application data
    students: any[];
    trainings: any[];
    coaches: any[];
    events: any[];
    inventory: any[];
    settings: any;
    
    // Payment data for each athlete
    payments: { [key: string]: any[] };
    
    // System data
    systemSettings: any;
    theme: string;
    
    // Additional form data
    formData: { [key: string]: any };
  };
}

export class GitHubSyncManager {
  private static instance: GitHubSyncManager;
  private readonly SYNC_INTERVAL = 10 * 60 * 1000; // 10 minutes (further reduced)
  private readonly FULL_SYNC_KEY = 'github_full_sync';
  private readonly LAST_SYNC_KEY = 'github_last_sync';
  private readonly SYNC_LOCK_KEY = 'github_sync_lock';
  private readonly ERROR_COUNT_KEY = 'github_sync_errors';
  private readonly INIT_LOCK_KEY = 'github_init_lock';
  private readonly MAX_ERRORS = 5;
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;
  private isInitializing = false;
  private isSyncing = false;
  private changeTimeout: NodeJS.Timeout | null = null;
  private isEnabled = true;

  private constructor() {}

  static getInstance(): GitHubSyncManager {
    if (!GitHubSyncManager.instance) {
      GitHubSyncManager.instance = new GitHubSyncManager();
    }
    return GitHubSyncManager.instance;
  }

  // Check if sync should be disabled due to too many errors
  private checkErrorCount(): boolean {
    if (typeof window === 'undefined') return false;
    
    const errorCount = parseInt(localStorage.getItem(this.ERROR_COUNT_KEY) || '0');
    if (errorCount >= this.MAX_ERRORS) {
      console.warn(`GitHub sync disabled due to ${errorCount} consecutive errors`);
      this.isEnabled = false;
      return false;
    }
    return true;
  }

  // Increment error count
  private incrementErrorCount(): void {
    if (typeof window === 'undefined') return;
    
    const errorCount = parseInt(localStorage.getItem(this.ERROR_COUNT_KEY) || '0');
    localStorage.setItem(this.ERROR_COUNT_KEY, (errorCount + 1).toString());
  }

  // Reset error count on successful operation
  private resetErrorCount(): void {
    if (typeof window === 'undefined') return;
    
    localStorage.removeItem(this.ERROR_COUNT_KEY);
    this.isEnabled = true;
  }

  // Test GitHub configuration before initialization
  private async testGitHubConfig(): Promise<boolean> {
    try {
      const response = await fetch('/api/debug-env');
      const result = await response.json();
      
      if (result.GITHUB_TOKEN === 'SET' && result.GITHUB_OWNER === 'SET' && result.GITHUB_REPO === 'SET') {
        console.log('GitHub configuration verified successfully');
        return true;
      } else {
        console.warn('GitHub configuration incomplete:', result);
        return false;
      }
    } catch (error) {
      console.error('Failed to test GitHub configuration:', error);
      return false;
    }
  }

  // Initialize GitHub sync
  async initialize(): Promise<void> {
    // Prevent multiple initializations
    if (typeof window === 'undefined' || this.isInitialized || this.isInitializing) {
      if (this.isInitializing) {
        console.log('GitHub Sync Manager initialization already in progress, skipping...');
      }
      return;
    }

    // Check initialization lock
    const initLock = localStorage.getItem(this.INIT_LOCK_KEY);
    if (initLock) {
      const lockTime = new Date(initLock).getTime();
      const now = new Date().getTime();
      if (now - lockTime < 30 * 1000) { // 30 second lock
        console.log('GitHub Sync Manager initialization locked, skipping...');
        return;
      } else {
        localStorage.removeItem(this.INIT_LOCK_KEY);
      }
    }

    this.isInitializing = true;
    localStorage.setItem(this.INIT_LOCK_KEY, new Date().toISOString());

    try {
      console.log('GitHub Sync Manager initializing...');
      
      // First, test GitHub configuration
      const configValid = await this.testGitHubConfig();
      if (!configValid) {
        console.warn('GitHub configuration is missing or invalid. Disabling GitHub sync for this session.');
        this.isEnabled = false;
        this.isInitialized = true; // Mark as initialized to prevent retry loops
        return;
      }
      
      // Check if sync should be disabled due to errors
      if (!this.checkErrorCount()) {
        console.log('GitHub sync is disabled due to previous errors');
        this.isEnabled = false;
        this.isInitialized = true;
        return;
      }
      
      // Check if sync is already in progress
      const syncLock = localStorage.getItem(this.SYNC_LOCK_KEY);
      if (syncLock) {
        const lockTime = new Date(syncLock).getTime();
        const now = new Date().getTime();
        // Clear lock if older than 10 minutes
        if (now - lockTime > 10 * 60 * 1000) {
          localStorage.removeItem(this.SYNC_LOCK_KEY);
        } else {
          console.log('Sync already in progress, skipping initialization');
          this.isInitialized = true;
          return;
        }
      }
      
      // Load data from GitHub first (only if no recent sync)
      const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
      const shouldLoad = !lastSync || (new Date().getTime() - new Date(lastSync).getTime() > 30 * 60 * 1000); // 30 minutes
      
      if (shouldLoad) {
        const loadSuccess = await this.loadFromGitHub();
        if (!loadSuccess) {
          console.log('Failed to load from GitHub, but continuing with initialization');
        }
      }
      
      // Start automatic sync only if enabled
      if (this.isEnabled) {
        this.startAutoSync();
      }
      
      this.isInitialized = true;
      console.log('GitHub Sync Manager initialized successfully');
    } catch (error) {
      console.error('GitHub Sync Manager initialization failed:', error);
      this.incrementErrorCount();
      localStorage.removeItem(this.SYNC_LOCK_KEY);
      this.isEnabled = false;
      this.isInitialized = true; // Prevent retry loops
      // Don't re-throw error to prevent app crashes
    } finally {
      this.isInitializing = false;
      localStorage.removeItem(this.INIT_LOCK_KEY);
    }
  }

  // Load all data from GitHub
  async loadFromGitHub(): Promise<boolean> {
    if (typeof window === 'undefined' || !this.isEnabled) return false;

    try {
      console.log('Loading data from GitHub...');
      
      // Load full sync data with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 30000); // 30 second timeout
      
      const response = await fetch('/api/load-from-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataType: 'full-sync'
        }),
        signal: controller.signal
      });

      clearTimeout(timeoutId);

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const syncData: SyncData = result.data;
          
          // Temporarily disable change listener during restore
          const originalSetItem = localStorage.setItem;
          localStorage.setItem = originalSetItem;
          
          // Restore all data to localStorage
          if (syncData.data.users) {
            originalSetItem.call(localStorage, 'simple_auth_users', JSON.stringify(syncData.data.users));
          }
          if (syncData.data.currentUser) {
            originalSetItem.call(localStorage, 'simple_auth_current_user', JSON.stringify(syncData.data.currentUser));
          }
          if (syncData.data.students) {
            originalSetItem.call(localStorage, 'students', JSON.stringify(syncData.data.students));
          }
          if (syncData.data.trainings) {
            originalSetItem.call(localStorage, 'trainings', JSON.stringify(syncData.data.trainings));
          }
          if (syncData.data.coaches) {
            originalSetItem.call(localStorage, 'coaches', JSON.stringify(syncData.data.coaches));
          }
          if (syncData.data.events) {
            originalSetItem.call(localStorage, 'events', JSON.stringify(syncData.data.events));
          }
          if (syncData.data.inventory) {
            originalSetItem.call(localStorage, 'inventory', JSON.stringify(syncData.data.inventory));
          }
          if (syncData.data.settings) {
            originalSetItem.call(localStorage, 'systemSettings', JSON.stringify(syncData.data.settings));
          }
          if (syncData.data.theme) {
            originalSetItem.call(localStorage, 'theme', syncData.data.theme);
          }

          // Restore payment data
          if (syncData.data.payments) {
            Object.keys(syncData.data.payments).forEach(key => {
              originalSetItem.call(localStorage, key, JSON.stringify(syncData.data.payments[key]));
            });
          }

          // Restore additional form data
          if (syncData.data.formData) {
            Object.keys(syncData.data.formData).forEach(key => {
              originalSetItem.call(localStorage, key, JSON.stringify(syncData.data.formData[key]));
            });
          }

          console.log(`Data loaded from GitHub (synced on ${syncData.timestamp})`);
          localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
          this.resetErrorCount();
          return true;
        }
      } else if (response.status === 404) {
        console.log('No GitHub sync data found');
        return false;
      } else {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      return false;
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
      this.incrementErrorCount();
      return false;
    }
  }

  // Sync all data to GitHub
  async syncToGitHub(): Promise<boolean> {
    if (typeof window === 'undefined' || this.isSyncing || !this.isEnabled) return false;

    // Check sync lock
    const syncLock = localStorage.getItem(this.SYNC_LOCK_KEY);
    if (syncLock) {
      const lockTime = new Date(syncLock).getTime();
      const now = new Date().getTime();
      if (now - lockTime < 60 * 1000) { // 1 minute lock
        console.log('Sync already in progress, skipping...');
        return false;
      }
    }

    this.isSyncing = true;
    localStorage.setItem(this.SYNC_LOCK_KEY, new Date().toISOString());

    try {
      console.log('Syncing data to GitHub...');
      
      // Create minimal sync data to avoid payload size issues
      const syncData: SyncData = {
        timestamp: new Date().toISOString(),
        version: '2.1',
        domain: window.location.hostname,
        userAgent: 'SportsCRM-App',
        data: {
          // Authentication data
          users: JSON.parse(localStorage.getItem('simple_auth_users') || '[]'),
          currentUser: JSON.parse(localStorage.getItem('simple_auth_current_user') || 'null'),
          
          // Core application data (limited)
          students: JSON.parse(localStorage.getItem('students') || '[]').slice(0, 200), // Limit students
          trainings: JSON.parse(localStorage.getItem('trainings') || '[]').slice(0, 100), // Limit trainings
          coaches: JSON.parse(localStorage.getItem('coaches') || '[]'),
          events: JSON.parse(localStorage.getItem('events') || '[]').slice(0, 50), // Limit events
          inventory: JSON.parse(localStorage.getItem('inventory') || '[]').slice(0, 100), // Limit inventory
          settings: JSON.parse(localStorage.getItem('systemSettings') || '{}'),
          theme: localStorage.getItem('theme') || 'light',
          
          // Payment data (very limited)
          payments: {},
          
          // System settings
          systemSettings: JSON.parse(localStorage.getItem('systemSettings') || '{}'),
          
          // Essential form data only
          formData: {}
        }
      };

      // Collect only recent payment data to prevent size issues
      const students = syncData.data.students;
      let paymentCount = 0;
      const maxPayments = 1000; // Total payment limit across all students
      
      for (const student of students) {
        if (paymentCount >= maxPayments) break;
        
        const accountEntries = JSON.parse(localStorage.getItem(`account_${student.id}`) || '[]');
        if (accountEntries.length > 0) {
          // Limit to last 10 entries per student
          const limitedEntries = accountEntries.slice(-10);
          syncData.data.payments[`account_${student.id}`] = limitedEntries;
          paymentCount += limitedEntries.length;
        }
      }

      // Check payload size before sending
      const payloadSize = JSON.stringify(syncData).length;
      console.log(`Sync payload size: ${Math.round(payloadSize / 1024)} KB`);
      
      if (payloadSize > 800 * 1024) { // 800KB limit (well under GitHub's 1MB limit)
        console.warn('Payload still too large, further reducing data...');
        // Remove payment data entirely if still too large
        syncData.data.payments = {};
        // Further limit other data
        syncData.data.students = syncData.data.students.slice(0, 100);
        syncData.data.trainings = syncData.data.trainings.slice(0, 50);
        syncData.data.events = syncData.data.events.slice(0, 25);
        syncData.data.inventory = syncData.data.inventory.slice(0, 50);
      }

      // Save to GitHub with timeout
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 60000); // 60 second timeout
      
      const result = await saveToGitHub({
        dataType: 'full-sync',
        data: syncData,
        fileName: `full-sync-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      });

      clearTimeout(timeoutId);

      if (result.success) {
        localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
        console.log('Data synced to GitHub successfully');
        this.resetErrorCount();
        return true;
      } else {
        throw new Error(result.message || 'Unknown sync error');
      }
    } catch (error) {
      console.error('Sync to GitHub failed:', error);
      this.incrementErrorCount();
      return false;
    } finally {
      this.isSyncing = false;
      localStorage.removeItem(this.SYNC_LOCK_KEY);
    }
  }

  // Start automatic sync
  private startAutoSync(): void {
    // Explicitly check if sync is enabled before starting
    if (!this.isEnabled) {
      console.log('GitHub sync is disabled, not starting auto sync');
      return;
    }

    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      if (this.isEnabled) {
        try {
          await this.syncToGitHub();
        } catch (error) {
          console.error('Auto sync failed:', error);
        }
      }
    }, this.SYNC_INTERVAL);

    console.log('Auto sync started (every 10 minutes)');
  }

  // Stop automatic sync
  stopAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
      this.syncInterval = null;
      console.log('Auto sync stopped');
    }
  }

  // Manual sync trigger
  async manualSync(): Promise<boolean> {
    return await this.syncToGitHub();
  }

  // Force reload from GitHub
  async forceReloadFromGitHub(): Promise<boolean> {
    return await this.loadFromGitHub();
  }

  // Get sync status
  getSyncStatus(): { lastSync: string | null; isAutoSyncActive: boolean; isEnabled: boolean; errorCount: number } {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const isAutoSyncActive = this.syncInterval !== null;
    const errorCount = parseInt(localStorage.getItem(this.ERROR_COUNT_KEY) || '0');
    
    return {
      lastSync,
      isAutoSyncActive,
      isEnabled: this.isEnabled,
      errorCount
    };
  }

  // Reset sync errors and re-enable
  resetSyncErrors(): void {
    this.resetErrorCount();
    console.log('GitHub sync errors reset, sync re-enabled');
  }

  // Listen for localStorage changes and auto-sync (with heavy debouncing)
  startChangeListener(): void {
    if (typeof window === 'undefined' || !this.isEnabled) return;

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key && !e.key.startsWith('github_')) {
        this.debouncedSync();
      }
    });

    // Override localStorage.setItem to detect changes in same tab
    const originalSetItem = localStorage.setItem;
    const self = this;
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.call(this, key, value);
      
      if (!key.startsWith('github_') && self.isEnabled) {
        console.log(`LocalStorage change detected: ${key}`);
        self.debouncedSync();
      }
    };
  }

  // Heavily debounced sync to prevent excessive sync attempts
  private debouncedSync(): void {
    if (this.changeTimeout) {
      clearTimeout(this.changeTimeout);
    }
    
    this.changeTimeout = setTimeout(async () => {
      if (!this.isSyncing && this.isEnabled) {
        console.log('Triggering debounced sync...');
        await this.syncToGitHub();
      }
    }, 30000); // 30 seconds delay to batch multiple changes
  }

  // Get sync statistics
  getSyncStats(): { 
    totalUsers: number; 
    totalStudents: number; 
    totalPayments: number; 
    lastSyncTime: string | null;
    syncDataSize: string;
    isEnabled: boolean;
    errorCount: number;
  } {
    const users = JSON.parse(localStorage.getItem('simple_auth_users') || '[]');
    const students = JSON.parse(localStorage.getItem('students') || '[]');
    
    let totalPayments = 0;
    students.forEach((student: any) => {
      const payments = JSON.parse(localStorage.getItem(`account_${student.id}`) || '[]');
      totalPayments += payments.length;
    });

    // Calculate approximate data size
    let dataSize = 0;
    Object.keys(localStorage).forEach(key => {
      const value = localStorage.getItem(key);
      if (value) {
        dataSize += value.length;
      }
    });

    const errorCount = parseInt(localStorage.getItem(this.ERROR_COUNT_KEY) || '0');

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalPayments,
      lastSyncTime: localStorage.getItem(this.LAST_SYNC_KEY),
      syncDataSize: `${Math.round(dataSize / 1024)} KB`,
      isEnabled: this.isEnabled,
      errorCount
    };
  }
}

// Global GitHub sync manager instance
export const gitHubSyncManager = GitHubSyncManager.getInstance();