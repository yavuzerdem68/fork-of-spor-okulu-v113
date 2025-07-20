// Persistent Storage System for Cloud Deployment
// Provides data persistence across deployments and domain changes

export interface StorageBackup {
  timestamp: string;
  version: string;
  domain: string;
  data: {
    users: any[];
    students: any[];
    trainings: any[];
    payments: { [key: string]: any[] };
    coaches: any[];
    events: any[];
    inventory: any[];
    settings: any;
  };
}

export class PersistentStorageManager {
  private static instance: PersistentStorageManager;
  private readonly BACKUP_KEY = 'spor_okulu_persistent_backup';
  private readonly LAST_BACKUP_KEY = 'spor_okulu_last_backup';
  private readonly AUTO_BACKUP_INTERVAL = 5 * 60 * 1000; // 5 minutes
  private backupInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  static getInstance(): PersistentStorageManager {
    if (!PersistentStorageManager.instance) {
      PersistentStorageManager.instance = new PersistentStorageManager();
    }
    return PersistentStorageManager.instance;
  }

  // Initialize persistent storage
  async initialize(): Promise<void> {
    if (typeof window === 'undefined') return;

    try {
      // Check if we have data in localStorage
      const hasData = this.hasLocalData();
      
      // If no data, try to restore from persistent backup
      if (!hasData) {
        await this.restoreFromPersistentBackup();
      }

      // Start auto-backup
      this.startAutoBackup();
      
      // Create initial backup if none exists
      const lastBackup = localStorage.getItem(this.LAST_BACKUP_KEY);
      if (!lastBackup) {
        await this.createPersistentBackup();
      }
    } catch (error) {
      console.error('Persistent storage initialization failed:', error);
    }
  }

  // Check if we have local data
  private hasLocalData(): boolean {
    const students = localStorage.getItem('students');
    const users = localStorage.getItem('simple_auth_users');
    return !!(students && JSON.parse(students).length > 0) || !!(users && JSON.parse(users).length > 0);
  }

  // Create a persistent backup
  async createPersistentBackup(): Promise<StorageBackup> {
    if (typeof window === 'undefined') throw new Error('Window not available');

    const backup: StorageBackup = {
      timestamp: new Date().toISOString(),
      version: '1.0',
      domain: window.location.hostname,
      data: {
        users: JSON.parse(localStorage.getItem('simple_auth_users') || '[]'),
        students: JSON.parse(localStorage.getItem('students') || '[]'),
        trainings: JSON.parse(localStorage.getItem('trainings') || '[]'),
        payments: {},
        coaches: JSON.parse(localStorage.getItem('coaches') || '[]'),
        events: JSON.parse(localStorage.getItem('events') || '[]'),
        inventory: JSON.parse(localStorage.getItem('inventory') || '[]'),
        settings: JSON.parse(localStorage.getItem('systemSettings') || '{}')
      }
    };

    // Collect payment data for each athlete
    const athletes = backup.data.students;
    athletes.forEach((athlete: any) => {
      const accountEntries = JSON.parse(localStorage.getItem(`account_${athlete.id}`) || '[]');
      if (accountEntries.length > 0) {
        backup.data.payments[`account_${athlete.id}`] = accountEntries;
      }
    });

    // Store in multiple locations for redundancy
    try {
      // Store in localStorage
      localStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));
      localStorage.setItem(this.LAST_BACKUP_KEY, new Date().toISOString());

      // Store in sessionStorage as additional backup
      sessionStorage.setItem(this.BACKUP_KEY, JSON.stringify(backup));

      // Try to store in IndexedDB for better persistence
      await this.storeInIndexedDB(backup);

      console.log('Persistent backup created successfully');
    } catch (error) {
      console.error('Failed to create persistent backup:', error);
    }

    return backup;
  }

  // Store backup in IndexedDB
  private async storeInIndexedDB(backup: StorageBackup): Promise<void> {
    return new Promise((resolve, reject) => {
      const request = indexedDB.open('SporOkuluDB', 2);
      
      request.onerror = () => {
        console.error('IndexedDB open error:', request.error);
        resolve(); // Don't reject, just resolve to continue
      };
      
      request.onsuccess = () => {
        try {
          const db = request.result;
          
          // Check if the object store exists
          if (!db.objectStoreNames.contains('backups')) {
            console.warn('Backups object store not found, skipping IndexedDB storage');
            resolve();
            return;
          }
          
          const transaction = db.transaction(['backups'], 'readwrite');
          const store = transaction.objectStore('backups');
          
          store.put(backup, 'latest_backup');
          
          transaction.oncomplete = () => resolve();
          transaction.onerror = () => {
            console.error('IndexedDB transaction error:', transaction.error);
            resolve(); // Don't reject, just resolve to continue
          };
        } catch (error) {
          console.error('IndexedDB operation error:', error);
          resolve(); // Don't reject, just resolve to continue
        }
      };
      
      request.onupgradeneeded = (event) => {
        try {
          const db = request.result;
          
          // Clear existing object stores if they exist
          const existingStores = Array.from(db.objectStoreNames);
          existingStores.forEach(storeName => {
            if (db.objectStoreNames.contains(storeName)) {
              db.deleteObjectStore(storeName);
            }
          });
          
          // Create new object store
          db.createObjectStore('backups');
          console.log('IndexedDB object stores created successfully');
        } catch (error) {
          console.error('IndexedDB upgrade error:', error);
        }
      };
    });
  }

  // Restore from persistent backup
  async restoreFromPersistentBackup(): Promise<boolean> {
    if (typeof window === 'undefined') return false;

    try {
      let backup: StorageBackup | null = null;

      // Try to restore from IndexedDB first
      backup = await this.getFromIndexedDB();
      
      // If not found, try localStorage
      if (!backup) {
        const stored = localStorage.getItem(this.BACKUP_KEY);
        if (stored) {
          backup = JSON.parse(stored);
        }
      }

      // If still not found, try sessionStorage
      if (!backup) {
        const stored = sessionStorage.getItem(this.BACKUP_KEY);
        if (stored) {
          backup = JSON.parse(stored);
        }
      }

      if (!backup) {
        console.log('No persistent backup found');
        return false;
      }

      // Restore data
      if (backup.data.users) {
        localStorage.setItem('simple_auth_users', JSON.stringify(backup.data.users));
      }
      if (backup.data.students) {
        localStorage.setItem('students', JSON.stringify(backup.data.students));
      }
      if (backup.data.trainings) {
        localStorage.setItem('trainings', JSON.stringify(backup.data.trainings));
      }
      if (backup.data.coaches) {
        localStorage.setItem('coaches', JSON.stringify(backup.data.coaches));
      }
      if (backup.data.events) {
        localStorage.setItem('events', JSON.stringify(backup.data.events));
      }
      if (backup.data.inventory) {
        localStorage.setItem('inventory', JSON.stringify(backup.data.inventory));
      }
      if (backup.data.settings) {
        localStorage.setItem('systemSettings', JSON.stringify(backup.data.settings));
      }

      // Restore payment data
      if (backup.data.payments) {
        Object.keys(backup.data.payments).forEach(key => {
          localStorage.setItem(key, JSON.stringify(backup.data.payments[key]));
        });
      }

      console.log(`Data restored from backup created on ${backup.timestamp}`);
      return true;
    } catch (error) {
      console.error('Failed to restore from persistent backup:', error);
      return false;
    }
  }

  // Get backup from IndexedDB
  private async getFromIndexedDB(): Promise<StorageBackup | null> {
    return new Promise((resolve) => {
      const request = indexedDB.open('SporOkuluDB', 2);
      
      request.onerror = () => {
        console.error('IndexedDB get error:', request.error);
        resolve(null);
      };
      
      request.onsuccess = () => {
        try {
          const db = request.result;
          
          if (!db.objectStoreNames.contains('backups')) {
            console.warn('Backups object store not found for reading');
            resolve(null);
            return;
          }
          
          const transaction = db.transaction(['backups'], 'readonly');
          const store = transaction.objectStore('backups');
          const getRequest = store.get('latest_backup');
          
          getRequest.onsuccess = () => resolve(getRequest.result || null);
          getRequest.onerror = () => {
            console.error('IndexedDB get request error:', getRequest.error);
            resolve(null);
          };
        } catch (error) {
          console.error('IndexedDB get operation error:', error);
          resolve(null);
        }
      };
      
      request.onupgradeneeded = () => {
        console.log('IndexedDB upgrade needed during get operation');
        resolve(null);
      };
    });
  }

  // Start automatic backup
  private startAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
    }

    this.backupInterval = setInterval(async () => {
      try {
        await this.createPersistentBackup();
      } catch (error) {
        console.error('Auto backup failed:', error);
      }
    }, this.AUTO_BACKUP_INTERVAL);
  }

  // Stop automatic backup
  stopAutoBackup(): void {
    if (this.backupInterval) {
      clearInterval(this.backupInterval);
      this.backupInterval = null;
    }
  }

  // Manual backup trigger
  async createManualBackup(): Promise<StorageBackup> {
    return await this.createPersistentBackup();
  }

  // Get backup info
  getBackupInfo(): { lastBackup: string | null; hasBackup: boolean } {
    const lastBackup = localStorage.getItem(this.LAST_BACKUP_KEY);
    const hasBackup = !!(localStorage.getItem(this.BACKUP_KEY) || sessionStorage.getItem(this.BACKUP_KEY));
    
    return {
      lastBackup,
      hasBackup
    };
  }

  // Export backup for download
  async exportBackup(): Promise<string> {
    const backup = await this.createPersistentBackup();
    return JSON.stringify(backup, null, 2);
  }

  // Import backup from JSON
  async importBackup(backupJson: string): Promise<void> {
    const backup: StorageBackup = JSON.parse(backupJson);
    
    // Validate backup format
    if (!backup.data || !backup.timestamp) {
      throw new Error('Geçersiz yedek formatı');
    }

    // Clear existing data
    const keysToKeep = ['theme'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Restore data
    if (backup.data.users) {
      localStorage.setItem('simple_auth_users', JSON.stringify(backup.data.users));
    }
    if (backup.data.students) {
      localStorage.setItem('students', JSON.stringify(backup.data.students));
    }
    if (backup.data.trainings) {
      localStorage.setItem('trainings', JSON.stringify(backup.data.trainings));
    }
    if (backup.data.coaches) {
      localStorage.setItem('coaches', JSON.stringify(backup.data.coaches));
    }
    if (backup.data.events) {
      localStorage.setItem('events', JSON.stringify(backup.data.events));
    }
    if (backup.data.inventory) {
      localStorage.setItem('inventory', JSON.stringify(backup.data.inventory));
    }
    if (backup.data.settings) {
      localStorage.setItem('systemSettings', JSON.stringify(backup.data.settings));
    }

    // Restore payment data
    if (backup.data.payments) {
      Object.keys(backup.data.payments).forEach(key => {
        localStorage.setItem(key, JSON.stringify(backup.data.payments[key]));
      });
    }

    // Create new persistent backup
    await this.createPersistentBackup();
  }

  // Clear all data and backups
  clearAllData(): void {
    if (typeof window === 'undefined') return;

    // Clear localStorage
    const keysToKeep = ['theme'];
    const allKeys = Object.keys(localStorage);
    allKeys.forEach(key => {
      if (!keysToKeep.includes(key)) {
        localStorage.removeItem(key);
      }
    });

    // Clear sessionStorage
    sessionStorage.removeItem(this.BACKUP_KEY);

    // Clear IndexedDB
    indexedDB.deleteDatabase('SporOkuluDB');

    // Stop auto backup
    this.stopAutoBackup();
  }
}

// Global persistent storage manager instance
export const persistentStorageManager = PersistentStorageManager.getInstance();