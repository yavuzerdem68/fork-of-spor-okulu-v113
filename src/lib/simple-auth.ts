// Simple Authentication System for Cloud Deployment
// Uses localStorage with plain text passwords for simplicity and consistency

export interface SimpleUser {
  id: string;
  email: string;
  name: string;
  surname: string;
  role: 'admin' | 'coach' | 'parent';
  password: string; // Plain text for simplicity in cloud deployment
  created_at: string;
  last_login?: string;
  isActive: boolean;
}

export class SimpleAuthManager {
  private static instance: SimpleAuthManager;
  private currentUser: SimpleUser | null = null;
  private readonly USERS_KEY = 'simple_auth_users';
  private readonly CURRENT_USER_KEY = 'simple_auth_current_user';

  private constructor() {}

  static getInstance(): SimpleAuthManager {
    if (!SimpleAuthManager.instance) {
      SimpleAuthManager.instance = new SimpleAuthManager();
    }
    return SimpleAuthManager.instance;
  }

  // Initialize authentication state
  async initialize(): Promise<void> {
    try {
      if (typeof window !== 'undefined') {
        const stored = localStorage.getItem(this.CURRENT_USER_KEY);
        if (stored) {
          this.currentUser = JSON.parse(stored);
        }
      }
    } catch (error) {
      console.error('Auth initialization failed:', error);
      this.currentUser = null;
    }
  }

  // Get all users
  private getUsers(): SimpleUser[] {
    if (typeof window === 'undefined') return [];
    try {
      const stored = localStorage.getItem(this.USERS_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error('Error loading users:', error);
      return [];
    }
  }

  // Save users
  private saveUsers(users: SimpleUser[]): void {
    if (typeof window === 'undefined') return;
    try {
      localStorage.setItem(this.USERS_KEY, JSON.stringify(users));
    } catch (error) {
      console.error('Error saving users:', error);
    }
  }

  // Create user
  async createUser(email: string, password: string, userData: Partial<SimpleUser>): Promise<SimpleUser> {
    const users = this.getUsers();
    
    // Check if user already exists
    const existingUser = users.find(u => u.email === email);
    if (existingUser) {
      throw new Error('Bu email adresi zaten kullanılıyor');
    }

    const newUser: SimpleUser = {
      id: `user-${Date.now()}`,
      email,
      password, // Plain text for simplicity
      name: userData.name || 'User',
      surname: userData.surname || '',
      role: userData.role || 'parent',
      created_at: new Date().toISOString(),
      isActive: true
    };

    users.push(newUser);
    this.saveUsers(users);
    
    return newUser;
  }

  // Sign in user
  async signIn(email: string, password: string): Promise<SimpleUser> {
    const users = this.getUsers();
    const user = users.find(u => u.email === email && u.password === password && u.isActive);
    
    if (!user) {
      throw new Error('Geçersiz email veya şifre');
    }

    // Update last login
    user.last_login = new Date().toISOString();
    this.saveUsers(users);

    // Set current user
    this.currentUser = user;
    if (typeof window !== 'undefined') {
      localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(user));
      localStorage.setItem('userRole', user.role);
      localStorage.setItem('userEmail', user.email);
    }

    return user;
  }

  // Sign out user
  async signOut(): Promise<void> {
    this.currentUser = null;
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.CURRENT_USER_KEY);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
    }
  }

  // Get current user
  getCurrentUser(): SimpleUser | null {
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
  async createDefaultAdmin(): Promise<SimpleUser> {
    try {
      return await this.createUser('yavuz@g7spor.org', '444125yA/', {
        name: 'Yavuz',
        surname: 'Admin',
        role: 'admin'
      });
    } catch (error: any) {
      if (error.message.includes('zaten kullanılıyor')) {
        // Return existing user
        const users = this.getUsers();
        const existingUser = users.find(u => u.email === 'yavuz@g7spor.org');
        if (existingUser) {
          return existingUser;
        }
      }
      throw error;
    }
  }

  // Create custom admin user
  async createCustomAdmin(email: string, password: string, name: string, surname: string): Promise<SimpleUser> {
    return await this.createUser(email, password, {
      name: name || 'Admin',
      surname: surname || 'User',
      role: 'admin'
    });
  }

  // Create coach user
  async createCoach(email: string, password: string, name: string, surname: string): Promise<SimpleUser> {
    return await this.createUser(email, password, {
      name,
      surname,
      role: 'coach'
    });
  }

  // Update user
  async updateUser(userId: string, updates: Partial<SimpleUser>): Promise<void> {
    const users = this.getUsers();
    const userIndex = users.findIndex(u => u.id === userId);
    
    if (userIndex === -1) {
      throw new Error('Kullanıcı bulunamadı');
    }

    users[userIndex] = { ...users[userIndex], ...updates };
    this.saveUsers(users);

    // Update current user if it's the same user
    if (this.currentUser && this.currentUser.id === userId) {
      this.currentUser = users[userIndex];
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.CURRENT_USER_KEY, JSON.stringify(this.currentUser));
      }
    }
  }

  // Delete user
  async deleteUser(userId: string): Promise<void> {
    const users = this.getUsers();
    const filteredUsers = users.filter(u => u.id !== userId);
    this.saveUsers(filteredUsers);

    // Sign out if current user is deleted
    if (this.currentUser && this.currentUser.id === userId) {
      await this.signOut();
    }
  }

  // Get all users (for diagnostic purposes)
  getAllUsers(): SimpleUser[] {
    return this.getUsers();
  }

  // Reset password
  async resetPassword(userId: string, newPassword: string): Promise<void> {
    await this.updateUser(userId, { password: newPassword });
  }

  // Clear all data
  clearAllData(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.USERS_KEY);
      localStorage.removeItem(this.CURRENT_USER_KEY);
      localStorage.removeItem('userRole');
      localStorage.removeItem('userEmail');
    }
    this.currentUser = null;
  }

  // Initialize with default users
  async initializeDefaultUsers(): Promise<void> {
    const users = this.getUsers();
    
    // Create default admin if no users exist
    if (users.length === 0) {
      await this.createDefaultAdmin();
      
      // Create a sample coach
      await this.createCoach('coach@sportscr.com', 'coach123', 'Örnek', 'Antrenör');
      
      // Create a sample parent
      await this.createUser('parent@sportscr.com', 'parent123', {
        name: 'Örnek',
        surname: 'Veli',
        role: 'parent'
      });
    }
  }
}

// Global simple auth manager instance
export const simpleAuthManager = SimpleAuthManager.getInstance();

// Helper functions for backward compatibility
export const createDefaultUsers = async () => {
  await simpleAuthManager.initializeDefaultUsers();
};

export const getCurrentUser = () => {
  return simpleAuthManager.getCurrentUser();
};

export const isAuthenticated = () => {
  return simpleAuthManager.isAuthenticated();
};

export const signOut = async () => {
  await simpleAuthManager.signOut();
};