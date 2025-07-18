// Cloud Storage Adapter - Optimized for Supabase with fallback to localStorage
import { athleteService, diagnosticService, paymentService, trainingService, auth } from './supabase';

export interface CloudStorageAdapter {
  saveAthlete(data: any): Promise<string>;
  getAthletes(): Promise<any[]>;
  updateAthlete(id: string, data: any): Promise<void>;
  deleteAthlete(id: string): Promise<void>;
  saveData(type: string, data: any, id?: string): Promise<string>;
  getData(type: string): Promise<any[]>;
  updateData(type: string, id: string, data: any): Promise<void>;
  deleteData(type: string, id: string): Promise<void>;
  // Authentication methods
  signUp(email: string, password: string, userData: any): Promise<any>;
  signIn(email: string, password: string): Promise<any>;
  signOut(): Promise<void>;
  getCurrentUser(): Promise<any>;
}

// Supabase Cloud Storage Adapter
export class SupabaseCloudStorageAdapter implements CloudStorageAdapter {
  private isSupabaseAvailable(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }

  private fallbackToLocalStorage(key: string, data?: any): any {
    if (typeof window === 'undefined') return null;
    
    if (data !== undefined) {
      localStorage.setItem(key, JSON.stringify(data));
      return data;
    } else {
      const stored = localStorage.getItem(key);
      return stored ? JSON.parse(stored) : null;
    }
  }

  async saveAthlete(data: any): Promise<string> {
    if (!this.isSupabaseAvailable()) {
      // Fallback to localStorage
      const id = `athlete-${Date.now()}`;
      const athletes = this.fallbackToLocalStorage('athletes') || [];
      const newAthlete = { ...data, id, created_at: new Date().toISOString() };
      athletes.push(newAthlete);
      this.fallbackToLocalStorage('athletes', athletes);
      return id;
    }

    try {
      const athlete = await athleteService.create({
        ...data,
        status: data.status || 'active'
      });
      return athlete.id;
    } catch (error) {
      console.error('Supabase save failed, using localStorage:', error);
      return this.saveAthlete(data);
    }
  }

  async getAthletes(): Promise<any[]> {
    if (!this.isSupabaseAvailable()) {
      return this.fallbackToLocalStorage('athletes') || [];
    }

    try {
      return await athleteService.getAll();
    } catch (error) {
      console.error('Supabase fetch failed, using localStorage:', error);
      return this.fallbackToLocalStorage('athletes') || [];
    }
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      const athletes = this.fallbackToLocalStorage('athletes') || [];
      const index = athletes.findIndex((a: any) => a.id === id);
      if (index !== -1) {
        athletes[index] = { ...athletes[index], ...data, updated_at: new Date().toISOString() };
        this.fallbackToLocalStorage('athletes', athletes);
      }
      return;
    }

    try {
      await athleteService.update(id, data);
    } catch (error) {
      console.error('Supabase update failed, using localStorage:', error);
      await this.updateAthlete(id, data);
    }
  }

  async deleteAthlete(id: string): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      const athletes = this.fallbackToLocalStorage('athletes') || [];
      const filtered = athletes.filter((a: any) => a.id !== id);
      this.fallbackToLocalStorage('athletes', filtered);
      return;
    }

    try {
      await athleteService.delete(id);
    } catch (error) {
      console.error('Supabase delete failed, using localStorage:', error);
      await this.deleteAthlete(id);
    }
  }

  async saveData(type: string, data: any, id?: string): Promise<string> {
    if (!this.isSupabaseAvailable()) {
      const dataId = id || `${type}-${Date.now()}`;
      const stored = this.fallbackToLocalStorage(type) || [];
      const newData = { ...data, id: dataId, created_at: new Date().toISOString() };
      stored.push(newData);
      this.fallbackToLocalStorage(type, stored);
      return dataId;
    }

    try {
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
    } catch (error) {
      console.error(`Supabase ${type} save failed, using localStorage:`, error);
      return this.saveData(type, data, id);
    }
  }

  async getData(type: string): Promise<any[]> {
    if (!this.isSupabaseAvailable()) {
      return this.fallbackToLocalStorage(type) || [];
    }

    try {
      switch (type) {
        case 'diagnostic':
          // For cloud deployment, we might need to get all diagnostics
          // This would need to be modified based on your specific needs
          return [];
        case 'payment':
          // Similar to diagnostics
          return [];
        case 'training':
          return await trainingService.getAll();
        default:
          return this.fallbackToLocalStorage(type) || [];
      }
    } catch (error) {
      console.error(`Supabase ${type} fetch failed, using localStorage:`, error);
      return this.fallbackToLocalStorage(type) || [];
    }
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      const stored = this.fallbackToLocalStorage(type) || [];
      const index = stored.findIndex((item: any) => item.id === id);
      if (index !== -1) {
        stored[index] = { ...stored[index], ...data, updated_at: new Date().toISOString() };
        this.fallbackToLocalStorage(type, stored);
      }
      return;
    }

    try {
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
    } catch (error) {
      console.error(`Supabase ${type} update failed, using localStorage:`, error);
      await this.updateData(type, id, data);
    }
  }

  async deleteData(type: string, id: string): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      const stored = this.fallbackToLocalStorage(type) || [];
      const filtered = stored.filter((item: any) => item.id !== id);
      this.fallbackToLocalStorage(type, filtered);
      return;
    }

    try {
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
    } catch (error) {
      console.error(`Supabase ${type} delete failed, using localStorage:`, error);
      await this.deleteData(type, id);
    }
  }

  // Authentication methods
  async signUp(email: string, password: string, userData: any): Promise<any> {
    if (!this.isSupabaseAvailable()) {
      // Fallback to localStorage
      const users = this.fallbackToLocalStorage('users') || [];
      
      // Check if user already exists
      const existingUser = users.find((u: any) => u.email === email);
      if (existingUser) {
        throw new Error('User already exists');
      }
      
      const newUser = {
        id: `user-${Date.now()}`,
        email,
        password, // In production, this should be hashed
        name: userData.name || 'User',
        surname: userData.surname || '',
        role: userData.role || 'parent',
        created_at: new Date().toISOString(),
        metadata: userData.metadata
      };
      users.push(newUser);
      this.fallbackToLocalStorage('users', users);
      return { user: newUser };
    }

    try {
      const result = await auth.signUp(email, password);
      // Store additional user data if needed
      if (result.user && userData) {
        // You might want to store additional user metadata
        // This depends on your Supabase setup
      }
      return result;
    } catch (error) {
      console.error('Supabase signup failed, using localStorage:', error);
      return this.signUp(email, password, userData);
    }
  }

  async signIn(email: string, password: string): Promise<any> {
    if (!this.isSupabaseAvailable()) {
      // Fallback to localStorage
      const users = this.fallbackToLocalStorage('users') || [];
      const user = users.find((u: any) => u.email === email && u.password === password);
      if (user) {
        this.fallbackToLocalStorage('currentUser', user);
        return { user };
      }
      throw new Error('Invalid credentials');
    }

    try {
      const result = await auth.signIn(email, password);
      return result;
    } catch (error) {
      console.error('Supabase signin failed, using localStorage:', error);
      return this.signIn(email, password);
    }
  }

  async signOut(): Promise<void> {
    if (!this.isSupabaseAvailable()) {
      this.fallbackToLocalStorage('currentUser', null);
      return;
    }

    try {
      await auth.signOut();
    } catch (error) {
      console.error('Supabase signout failed, using localStorage:', error);
      this.fallbackToLocalStorage('currentUser', null);
    }
  }

  async getCurrentUser(): Promise<any> {
    if (!this.isSupabaseAvailable()) {
      return this.fallbackToLocalStorage('currentUser');
    }

    try {
      return await auth.getUser();
    } catch (error) {
      console.error('Supabase get user failed, using localStorage:', error);
      return this.fallbackToLocalStorage('currentUser');
    }
  }
}

// Cloud Storage Manager
export class CloudStorageManager {
  private adapter: CloudStorageAdapter;

  constructor() {
    this.adapter = new SupabaseCloudStorageAdapter();
  }

  // Athlete operations
  async saveAthlete(data: any): Promise<string> {
    return await this.adapter.saveAthlete(data);
  }

  async getAthletes(): Promise<any[]> {
    return await this.adapter.getAthletes();
  }

  async updateAthlete(id: string, data: any): Promise<void> {
    await this.adapter.updateAthlete(id, data);
  }

  async deleteAthlete(id: string): Promise<void> {
    await this.adapter.deleteAthlete(id);
  }

  // Generic data operations
  async saveData(type: string, data: any, id?: string): Promise<string> {
    return await this.adapter.saveData(type, data, id);
  }

  async getData(type: string): Promise<any[]> {
    return await this.adapter.getData(type);
  }

  async updateData(type: string, id: string, data: any): Promise<void> {
    await this.adapter.updateData(type, id, data);
  }

  async deleteData(type: string, id: string): Promise<void> {
    await this.adapter.deleteData(type, id);
  }

  // Authentication operations
  async signUp(email: string, password: string, userData: any): Promise<any> {
    return await this.adapter.signUp(email, password, userData);
  }

  async signIn(email: string, password: string): Promise<any> {
    return await this.adapter.signIn(email, password);
  }

  async signOut(): Promise<void> {
    await this.adapter.signOut();
  }

  async getCurrentUser(): Promise<any> {
    return await this.adapter.getCurrentUser();
  }

  // Utility methods
  isCloudMode(): boolean {
    return process.env.NEXT_PUBLIC_APP_MODE === 'cloud';
  }

  isSupabaseConfigured(): boolean {
    return !!(process.env.NEXT_PUBLIC_SUPABASE_URL && process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY);
  }
}

// Global cloud storage manager instance
export const cloudStorageManager = new CloudStorageManager();