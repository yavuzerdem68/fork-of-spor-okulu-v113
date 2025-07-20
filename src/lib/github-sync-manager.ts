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
  private readonly SYNC_INTERVAL = 2 * 60 * 1000; // 2 minutes
  private readonly FULL_SYNC_KEY = 'github_full_sync';
  private readonly LAST_SYNC_KEY = 'github_last_sync';
  private syncInterval: NodeJS.Timeout | null = null;
  private isInitialized = false;

  private constructor() {}

  static getInstance(): GitHubSyncManager {
    if (!GitHubSyncManager.instance) {
      GitHubSyncManager.instance = new GitHubSyncManager();
    }
    return GitHubSyncManager.instance;
  }

  // Initialize GitHub sync
  async initialize(): Promise<void> {
    if (typeof window === 'undefined' || this.isInitialized) return;

    try {
      console.log('GitHub Sync Manager initializing...');
      
      // Load data from GitHub first
      await this.loadFromGitHub();
      
      // Start automatic sync
      this.startAutoSync();
      
      // Create initial sync if none exists
      const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
      if (!lastSync) {
        await this.syncToGitHub();
      }
      
      this.isInitialized = true;
      console.log('GitHub Sync Manager initialized successfully');
    } catch (error) {
      console.error('GitHub Sync Manager initialization failed:', error);
    }
  }

  // Load all data from GitHub
  async loadFromGitHub(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      console.log('Loading data from GitHub...');
      
      // Load full sync data
      const response = await fetch('/api/load-from-github', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          dataType: 'full-sync'
        })
      });

      if (response.ok) {
        const result = await response.json();
        if (result.success && result.data) {
          const syncData: SyncData = result.data;
          
          // Restore all data to localStorage
          if (syncData.data.users) {
            localStorage.setItem('simple_auth_users', JSON.stringify(syncData.data.users));
          }
          if (syncData.data.currentUser) {
            localStorage.setItem('simple_auth_current_user', JSON.stringify(syncData.data.currentUser));
          }
          if (syncData.data.students) {
            localStorage.setItem('students', JSON.stringify(syncData.data.students));
          }
          if (syncData.data.trainings) {
            localStorage.setItem('trainings', JSON.stringify(syncData.data.trainings));
          }
          if (syncData.data.coaches) {
            localStorage.setItem('coaches', JSON.stringify(syncData.data.coaches));
          }
          if (syncData.data.events) {
            localStorage.setItem('events', JSON.stringify(syncData.data.events));
          }
          if (syncData.data.inventory) {
            localStorage.setItem('inventory', JSON.stringify(syncData.data.inventory));
          }
          if (syncData.data.settings) {
            localStorage.setItem('systemSettings', JSON.stringify(syncData.data.settings));
          }
          if (syncData.data.theme) {
            localStorage.setItem('theme', syncData.data.theme);
          }

          // Restore payment data
          if (syncData.data.payments) {
            Object.keys(syncData.data.payments).forEach(key => {
              localStorage.setItem(key, JSON.stringify(syncData.data.payments[key]));
            });
          }

          // Restore additional form data
          if (syncData.data.formData) {
            Object.keys(syncData.data.formData).forEach(key => {
              localStorage.setItem(key, JSON.stringify(syncData.data.formData[key]));
            });
          }

          console.log(`Data loaded from GitHub (synced on ${syncData.timestamp})`);
          localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
          return true;
        }
      }
      
      console.log('No GitHub sync data found or failed to load');
      return false;
    } catch (error) {
      console.error('Failed to load from GitHub:', error);
      return false;
    }
  }

  // Sync all data to GitHub
  async syncToGitHub(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      console.log('Syncing data to GitHub...');
      
      const syncData: SyncData = {
        timestamp: new Date().toISOString(),
        version: '2.0',
        domain: window.location.hostname,
        userAgent: navigator.userAgent,
        data: {
          // Authentication data
          users: JSON.parse(localStorage.getItem('simple_auth_users') || '[]'),
          currentUser: JSON.parse(localStorage.getItem('simple_auth_current_user') || 'null'),
          
          // Core application data
          students: JSON.parse(localStorage.getItem('students') || '[]'),
          trainings: JSON.parse(localStorage.getItem('trainings') || '[]'),
          coaches: JSON.parse(localStorage.getItem('coaches') || '[]'),
          events: JSON.parse(localStorage.getItem('events') || '[]'),
          inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
          settings: JSON.parse(localStorage.getItem('systemSettings') || '{}'),
          theme: localStorage.getItem('theme') || 'light',
          
          // Payment data
          payments: {},
          
          // System settings
          systemSettings: JSON.parse(localStorage.getItem('systemSettings') || '{}'),
          
          // Additional form data
          formData: {}
        }
      };

      // Collect payment data for each athlete
      const athletes = syncData.data.students;
      athletes.forEach((athlete: any) => {
        const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
        if (accountEntries.length > 0) {
          syncData.data.payments[`account_${athlete.id}`] = accountEntries;
        }
      });

      // Collect additional form data (any key that's not in our core data)
      const coreKeys = [
        'simple_auth_users', 'simple_auth_current_user', 'students', 'trainings', 
        'coaches', 'events', 'inventory', 'systemSettings', 'theme'
      ];
      
      Object.keys(localStorage).forEach(key => {
        if (!coreKeys.includes(key) && !key.startsWith('account_') && !key.startsWith('github_')) {
          try {
            const value = localStorage.getItem(key);
            if (value) {
              syncData.data.formData[key] = JSON.parse(value);
            }
          } catch (error) {
            // If it's not JSON, store as string
            syncData.data.formData[key] = localStorage.getItem(key);
          }
        }
      });

      // Save to GitHub
      const result = await saveToGitHub({
        dataType: 'full-sync',
        data: syncData,
        fileName: `full-sync-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      });

      if (result.success) {
        localStorage.setItem(this.LAST_SYNC_KEY, new Date().toISOString());
        console.log('Data synced to GitHub successfully');
        return true;
      } else {
        console.error('Failed to sync to GitHub:', result.message);
        return false;
      }
    } catch (error) {
      console.error('Sync to GitHub failed:', error);
      return false;
    }
  }

  // Start automatic sync
  private startAutoSync(): void {
    if (this.syncInterval) {
      clearInterval(this.syncInterval);
    }

    this.syncInterval = setInterval(async () => {
      try {
        await this.syncToGitHub();
      } catch (error) {
        console.error('Auto sync failed:', error);
      }
    }, this.SYNC_INTERVAL);

    console.log('Auto sync started (every 2 minutes)');
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
  getSyncStatus(): { lastSync: string | null; isAutoSyncActive: boolean } {
    const lastSync = localStorage.getItem(this.LAST_SYNC_KEY);
    const isAutoSyncActive = this.syncInterval !== null;
    
    return {
      lastSync,
      isAutoSyncActive
    };
  }

  // Sync specific data type
  async syncSpecificData(dataType: string, data: any): Promise<boolean> {
    try {
      const result = await saveToGitHub({
        dataType,
        data,
        fileName: `${dataType}-${new Date().toISOString().replace(/[:.]/g, '-')}.json`
      });

      if (result.success) {
        // Also trigger a full sync to keep everything in sync
        setTimeout(() => this.syncToGitHub(), 1000);
        return true;
      }
      return false;
    } catch (error) {
      console.error(`Failed to sync ${dataType}:`, error);
      return false;
    }
  }

  // Listen for localStorage changes and auto-sync
  startChangeListener(): void {
    if (typeof window === 'undefined') return;

    // Listen for storage events (changes from other tabs)
    window.addEventListener('storage', (e) => {
      if (e.key && !e.key.startsWith('github_')) {
        console.log('Storage change detected, triggering sync...');
        setTimeout(() => this.syncToGitHub(), 2000); // Delay to batch changes
      }
    });

    // Override localStorage.setItem to detect changes in same tab
    const originalSetItem = localStorage.setItem;
    localStorage.setItem = function(key: string, value: string) {
      originalSetItem.call(this, key, value);
      
      if (!key.startsWith('github_')) {
        console.log(`LocalStorage change detected: ${key}`);
        setTimeout(() => gitHubSyncManager.syncToGitHub(), 2000);
      }
    };
  }

  // Get sync statistics
  getSyncStats(): { 
    totalUsers: number; 
    totalStudents: number; 
    totalPayments: number; 
    lastSyncTime: string | null;
    syncDataSize: string;
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

    return {
      totalUsers: users.length,
      totalStudents: students.length,
      totalPayments,
      lastSyncTime: localStorage.getItem(this.LAST_SYNC_KEY),
      syncDataSize: `${Math.round(dataSize / 1024)} KB`
    };
  }
}

// Global GitHub sync manager instance
export const gitHubSyncManager = GitHubSyncManager.getInstance();