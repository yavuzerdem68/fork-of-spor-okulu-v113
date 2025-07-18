// Cloud Authentication System
import { cloudStorageManager } from './cloud-storage-adapter';
import { auth } from './supabase';

export interface CloudUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: 'admin' | 'coach' | 'parent';
  created_at: string;
  last_login?: string;
  metadata?: any;
}

export class CloudAuthManager {
  private static instance: CloudAuthManager;
  private currentUser: CloudUser | null = null;

  private constructor() {}

  static getInstance(): CloudAuthManager {
    if (!CloudAuthManager.instance) {
      CloudAuthManager.instance = new CloudAuthManager();
    }
    return CloudAuthManager.instance;
  }

  // Initialize authentication state
  async initialize(): Promise<void> {
    try {
      if (cloudStorageManager.isSupabaseConfigured()) {
        const user = await auth.getUser();
        if (user) {
          // Convert Supabase user to CloudUser format
          this.currentUser = this.mapSupabaseUser(user);
        }
      } else {
        // Fallback to localStorage
        const stored = localStorage.getItem('currentUser');
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.currentUser = null;
    }
  }

  // Sign up new user
  async signUp(email: string, password: string, userData: Partial<CloudUser>): Promise<CloudUser> {
    try {
      const result = await cloudStorageManager.signUp(email, password, userData);
      
      if (result.user) {
        this.currentUser = {
          id: result.user.id,
          email: result.user.email || email,
          name: userData.name || 'User',
          surname: userData.surname || '',
          role: userData.role || 'parent',
          created_at: new Date().toISOString(),
          metadata: userData.metadata
        };

        // Store in localStorage for fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          localStorage.setItem('userRole', this.currentUser.role);
        }

        return this.currentUser;
      }
      
      throw new Error('Signup failed');
    } catch (error) {
      console.error('Signup error:', error);
      throw error;
    }
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<CloudUser> {
    try {
      const result = await cloudStorageManager.signIn(email, password);
      
      if (result.user) {
        // Check if this is a localStorage fallback user (has direct user data)
        if (result.user.role) {
          // Direct localStorage user data
          this.currentUser = {
            id: result.user.id,
            email: result.user.email,
            name: result.user.name || 'User',
            surname: result.user.surname || '',
            role: result.user.role,
            created_at: result.user.created_at || new Date().toISOString(),
            last_login: new Date().toISOString(),
            metadata: result.user.metadata
          };
        } else {
          // Supabase user - map from user_metadata
          this.currentUser = this.mapSupabaseUser(result.user);
        }

        // Store in localStorage for fallback
        if (typeof window !== 'undefined') {
          localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
          localStorage.setItem('userRole', this.currentUser.role);
        }

        return this.currentUser;
      }
      
      throw new Error('Invalid credentials');
    } catch (error) {
      console.error('Signin error:', error);
      throw error;
    }
  }

  // Sign out user
  async signOut(): Promise<void> {
    try {
      await cloudStorageManager.signOut();
      this.currentUser = null;

      // Clear localStorage
      if (typeof window !== 'undefined') {
        localStorage.removeItem('currentUser');
        localStorage.removeItem('userRole');
        localStorage.removeItem('userEmail');
      }
    } catch (error) {
      console.error('Signout error:', error);
      throw error;
    }
  }

  // Get current user
  getCurrentUser(): CloudUser | null {
    return this.currentUser;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.currentUser !== null;
  }

  // Check user role
  hasRole(role: string): boolean {
    return this.currentUser?.role === role;
  }

  // Check if user has admin privileges
  isAdmin(): boolean {
    return this.hasRole('admin');
  }

  // Check if user is a coach
  isCoach(): boolean {
    return this.hasRole('coach');
  }

  // Check if user is a parent
  isParent(): boolean {
    return this.hasRole('parent');
  }

  // Create default admin user
  async createDefaultAdmin(): Promise<void> {
    try {
      const defaultAdmin = {
        name: 'Sistem',
        surname: 'Yöneticisi',
        role: 'admin' as const,
        metadata: { isDefault: true }
      };

      await this.signUp('admin@sportscr.com', 'admin123', defaultAdmin);
    } catch (error) {
      console.error('Failed to create default admin:', error);
    }
  }

  // Map Supabase user to CloudUser format
  private mapSupabaseUser(supabaseUser: any): CloudUser {
    return {
      id: supabaseUser.id,
      email: supabaseUser.email,
      name: supabaseUser.user_metadata?.name || supabaseUser.email.split('@')[0],
      surname: supabaseUser.user_metadata?.surname || '',
      role: supabaseUser.user_metadata?.role || 'parent',
      created_at: supabaseUser.created_at,
      last_login: new Date().toISOString(),
      metadata: supabaseUser.user_metadata
    };
  }

  // Password reset
  async resetPassword(email: string): Promise<void> {
    if (cloudStorageManager.isSupabaseConfigured()) {
      // Use Supabase password reset
      // This would need to be implemented in the supabase.ts file
      throw new Error('Password reset not implemented for Supabase yet');
    } else {
      // For localStorage fallback, you might want to implement email sending
      throw new Error('Password reset not available in offline mode');
    }
  }

  // Update user profile
  async updateProfile(updates: Partial<CloudUser>): Promise<void> {
    if (!this.currentUser) {
      throw new Error('No user logged in');
    }

    try {
      // Update in database
      if (cloudStorageManager.isSupabaseConfigured()) {
        // Update Supabase user metadata
        // This would need to be implemented based on your Supabase setup
      }

      // Update local state
      this.currentUser = { ...this.currentUser, ...updates };

      // Update localStorage
      if (typeof window !== 'undefined') {
        localStorage.setItem('currentUser', JSON.stringify(this.currentUser));
      }
    } catch (error) {
      console.error('Profile update failed:', error);
      throw error;
    }
  }
}

// Global auth manager instance
export const cloudAuthManager = CloudAuthManager.getInstance();

// Auth state listener
export const onAuthStateChange = (callback: (user: CloudUser | null) => void) => {
  if (cloudStorageManager.isSupabaseConfigured()) {
    return auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        const cloudUser = cloudAuthManager.getCurrentUser();
        callback(cloudUser);
      } else {
        callback(null);
      }
    });
  } else {
    // For localStorage fallback, you might want to implement a custom listener
    const currentUser = cloudAuthManager.getCurrentUser();
    callback(currentUser);
  }
};