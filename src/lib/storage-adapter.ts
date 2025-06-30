// Storage adapter to handle GitHub, WordPress, and Supabase storage
import { WordPressAPI, AthleteWordPressStorage, GenericWordPressStorage } from './wordpress-api';
import { athleteService, diagnosticService, paymentService, trainingService } from './supabase';

export interface StorageAdapter {
  saveAthlete(data: any): Promise<string>;
  getAthletes(): Promise<any[]>;
  updateAthlete(id: string, data: any): Promise<void>;
  deleteAthlete(id: string): Promise<void>;
  saveData(type: string, data: any, id?: string): Promise<string>;
  getData(type: string): Promise<any[]>;
  updateData(type: string, id: string, data: any): Promise<void>;
  deleteData(type: string, id: string): Promise<void>;
}

// WordPress Storage Adapter
export class WordPressStorageAdapter implements StorageAdapter {
  private athleteStorage: AthleteWordPressStorage;
  private genericStorage: GenericWordPressStorage;

  constructor(wpApi: WordPressAPI) {
    this.athleteStorage = new AthleteWordPressStorage(wpApi);
    this.genericStorage = new GenericWordPressStorage(wpApi);
  }

  async saveAthlete(data: any): Promise<string> {
    return await this.athleteStorage.saveAthlete(data);
  }

  async getAthletes(): Promise<any[]> {
    return await this.athleteStorage.getAthletes();
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    await this.athleteStorage.updateAthlete(id, data);
  }

  async deleteAthlete(id: string): Promise<void> {
    await this.athleteStorage.deleteAthlete(id);
  }

  async saveData(type: string, data: any, id?: string): Promise<string> {
    return await this.genericStorage.saveData(type, data, id);
  }

  async getData(type: string): Promise<any[]> {
    return await this.genericStorage.getData(type);
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    await this.genericStorage.updateData(type, id, data);
  }

  async deleteData(type: string, id: string): Promise<void> {
    await this.genericStorage.deleteData(type, id);
  }
}

// Supabase Storage Adapter
export class SupabaseStorageAdapter implements StorageAdapter {
  async saveAthlete(data: any): Promise<string> {
    const athlete = await athleteService.create({
      ...data,
      status: data.status || 'active'
    });
    return athlete.id;
  }

  async getAthletes(): Promise<any[]> {
    return await athleteService.getAll();
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    await athleteService.update(id, data);
  }

  async deleteAthlete(id: string): Promise<void> {
    await athleteService.delete(id);
  }

  async saveData(type: string, data: any, id?: string): Promise<string> {
    switch (type) {
      case 'diagnostic':
        const diagnostic = await diagnosticService.create(data);
        return diagnostic.id;
      case 'payment':
        const payment = await paymentService.create(data);
        return payment.id;
      case 'training':
        const training = await trainingService.create(data);
        return training.id;
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }

  async getData(type: string): Promise<any[]> {
    switch (type) {
      case 'diagnostic':
        // This would need athlete_id parameter in real usage
        return [];
      case 'payment':
        // This would need athlete_id parameter in real usage
        return [];
      case 'training':
        return await trainingService.getAll();
      default:
        return [];
    }
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    switch (type) {
      case 'diagnostic':
        await diagnosticService.update(id, data);
        break;
      case 'payment':
        await paymentService.update(id, data);
        break;
      case 'training':
        await trainingService.update(id, data);
        break;
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }

  async deleteData(type: string, id: string): Promise<void> {
    switch (type) {
      case 'diagnostic':
        await diagnosticService.delete(id);
        break;
      case 'payment':
        await paymentService.delete(id);
        break;
      case 'training':
        await trainingService.delete(id);
        break;
      default:
        throw new Error(`Unsupported data type: ${type}`);
    }
  }
}

// GitHub Storage Adapter (fallback)
export class GitHubStorageAdapter implements StorageAdapter {
  async saveAthlete(data: any): Promise<string> {
    const response = await fetch('/api/save-to-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: 'athlete',
        data: data
      })
    });

    if (!response.ok) {
      throw new Error('GitHub storage failed');
    }

    const result = await response.json();
    return result.id;
  }

  async getAthletes(): Promise<any[]> {
    // This would need to be implemented to read from GitHub
    // For now, return empty array
    return [];
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    // Implementation for GitHub update
    throw new Error('GitHub update not implemented');
  }

  async deleteAthlete(id: string): Promise<void> {
    // Implementation for GitHub delete
    throw new Error('GitHub delete not implemented');
  }

  async saveData(type: string, data: any, id?: string): Promise<string> {
    const response = await fetch('/api/save-to-github', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        type: type,
        data: data,
        id: id
      })
    });

    if (!response.ok) {
      throw new Error('GitHub storage failed');
    }

    const result = await response.json();
    return result.id;
  }

  async getData(type: string): Promise<any[]> {
    return [];
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    throw new Error('GitHub update not implemented');
  }

  async deleteData(type: string, id: string): Promise<void> {
    throw new Error('GitHub delete not implemented');
  }
}

// Storage Manager - decides which adapter to use
export class StorageManager {
  private adapter: StorageAdapter | null = null;

  constructor() {
    this.initializeAdapter();
  }

  private async initializeAdapter() {
    try {
      // Check for Supabase configuration first (highest priority)
      if (this.hasSupabaseConfig()) {
        try {
          this.adapter = new SupabaseStorageAdapter();
          console.log('Supabase storage adapter initialized');
          return;
        } catch (error) {
          console.error('Supabase adapter failed:', error);
        }
      }

      // Try to get WordPress settings from localStorage
      const wpSettings = this.getWordPressSettings();
      
      if (wpSettings && wpSettings.username && wpSettings.password) {
        // Use WordPress adapter
        const wpApi = new WordPressAPI(
          wpSettings.siteUrl,
          wpSettings.username,
          wpSettings.password
        );

        // Test connection
        const isConnected = await wpApi.testConnection();
        if (isConnected) {
          this.adapter = new WordPressStorageAdapter(wpApi);
          console.log('WordPress storage adapter initialized');
          return;
        }
      }

      // Fallback to GitHub adapter
      this.adapter = new GitHubStorageAdapter();
      console.log('GitHub storage adapter initialized (fallback)');
    } catch (error) {
      console.error('Storage adapter initialization failed:', error);
      // Use GitHub as final fallback
      this.adapter = new GitHubStorageAdapter();
    }
  }

  private hasSupabaseConfig(): boolean {
    // Check if we're in a browser environment
    if (typeof window === 'undefined') {
      // Server-side: check environment variables
      return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
    }
    
    // Client-side: check if Supabase env vars are available
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  private getWordPressSettings() {
    try {
      // Check if we're in a browser environment
      if (typeof window === 'undefined' || typeof localStorage === 'undefined') {
        return null;
      }
      
      const settings = localStorage.getItem('wordpress-settings');
      return settings ? JSON.parse(settings) : null;
    } catch (error) {
      console.error('Error reading WordPress settings:', error);
      return null;
    }
  }

  async ensureAdapter(): Promise<StorageAdapter> {
    if (!this.adapter) {
      await this.initializeAdapter();
    }
    
    if (!this.adapter) {
      throw new Error('No storage adapter available');
    }
    
    return this.adapter;
  }

  async saveAthlete(data: any): Promise<string> {
    const adapter = await this.ensureAdapter();
    return await adapter.saveAthlete(data);
  }

  async getAthletes(): Promise<any[]> {
    const adapter = await this.ensureAdapter();
    return await adapter.getAthletes();
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    const adapter = await this.ensureAdapter();
    await adapter.updateAthlete(id, data);
  }

  async deleteAthlete(id: string): Promise<void> {
    const adapter = await this.ensureAdapter();
    await adapter.deleteAthlete(id);
  }

  async saveData(type: string, data: any, id?: string): Promise<string> {
    const adapter = await this.ensureAdapter();
    return await adapter.saveData(type, data, id);
  }

  async getData(type: string): Promise<any[]> {
    const adapter = await this.ensureAdapter();
    return await adapter.getData(type);
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    const adapter = await this.ensureAdapter();
    await adapter.updateData(type, id, data);
  }

  async deleteData(type: string, id: string): Promise<void> {
    const adapter = await this.ensureAdapter();
    await adapter.deleteData(type, id);
  }

  // Force refresh adapter (useful when WordPress settings change)
  async refreshAdapter() {
    this.adapter = null;
    await this.initializeAdapter();
  }

  // Get current adapter type
  getAdapterType(): string {
    if (!this.adapter) return 'none';
    if (this.adapter instanceof SupabaseStorageAdapter) return 'supabase';
    if (this.adapter instanceof WordPressStorageAdapter) return 'wordpress';
    return 'github';
  }
}

// Global storage manager instance
export const storageManager = new StorageManager();