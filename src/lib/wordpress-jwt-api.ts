// WordPress JWT Authentication API integration
export interface JWTAuthResponse {
  token: string;
  user_email: string;
  user_nicename: string;
  user_display_name: string;
  user_id: number;
  user_role: string[];
}

export interface JWTValidateResponse {
  code: string;
  data: {
    status: number;
  };
}

export interface WordPressUser {
  id: number;
  username: string;
  name: string;
  first_name: string;
  last_name: string;
  email: string;
  url: string;
  description: string;
  link: string;
  locale: string;
  nickname: string;
  slug: string;
  roles: string[];
  capabilities: { [key: string]: boolean };
  extra_capabilities: { [key: string]: boolean };
  avatar_urls: { [key: string]: string };
  meta: any[];
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  first_name?: string;
  last_name?: string;
  roles?: string[];
  meta?: { [key: string]: any };
}

export class WordPressJWTAPI {
  private baseUrl: string;
  private token: string | null = null;

  constructor(baseUrl: string) {
    this.baseUrl = baseUrl.replace(/\/$/, ''); // Remove trailing slash
    this.loadTokenFromStorage();
  }

  private loadTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      this.token = localStorage.getItem('wp_jwt_token');
    }
  }

  private saveTokenToStorage(token: string): void {
    if (typeof window !== 'undefined') {
      localStorage.setItem('wp_jwt_token', token);
    }
    this.token = token;
  }

  private removeTokenFromStorage(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem('wp_jwt_token');
    }
    this.token = null;
  }

  private getAuthHeaders(): HeadersInit {
    const headers: HeadersInit = {
      'Content-Type': 'application/json',
    };

    if (this.token) {
      headers['Authorization'] = `Bearer ${this.token}`;
    }

    return headers;
  }

  // Authenticate user and get JWT token
  async login(username: string, password: string): Promise<JWTAuthResponse> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/jwt-auth/v1/token`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          username,
          password,
        }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `Authentication failed: ${response.status} ${response.statusText}`);
      }

      const authData: JWTAuthResponse = await response.json();
      this.saveTokenToStorage(authData.token);
      
      return authData;
    } catch (error) {
      console.error('WordPress JWT login error:', error);
      throw error;
    }
  }

  // Validate current JWT token
  async validateToken(): Promise<boolean> {
    if (!this.token) {
      return false;
    }

    try {
      const response = await fetch(`${this.baseUrl}/wp-json/jwt-auth/v1/token/validate`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        this.removeTokenFromStorage();
        return false;
      }

      const result: JWTValidateResponse = await response.json();
      return result.data.status === 200;
    } catch (error) {
      console.error('WordPress JWT token validation error:', error);
      this.removeTokenFromStorage();
      return false;
    }
  }

  // Logout and invalidate token
  logout(): void {
    this.removeTokenFromStorage();
  }

  // Get current user information
  async getCurrentUser(): Promise<WordPressUser> {
    if (!this.token) {
      throw new Error('No authentication token available');
    }

    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/me`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        if (response.status === 401) {
          this.removeTokenFromStorage();
          throw new Error('Authentication token expired');
        }
        throw new Error(`Failed to get user info: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('WordPress get current user error:', error);
      throw error;
    }
  }

  // Create new user (requires admin privileges)
  async createUser(userData: CreateUserRequest): Promise<WordPressUser> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `User creation failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('WordPress create user error:', error);
      throw error;
    }
  }

  // Update user information
  async updateUser(userId: number, userData: Partial<CreateUserRequest>): Promise<WordPressUser> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/${userId}`, {
        method: 'POST',
        headers: this.getAuthHeaders(),
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `User update failed: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('WordPress update user error:', error);
      throw error;
    }
  }

  // Get user by ID
  async getUser(userId: number): Promise<WordPressUser> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users/${userId}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get user: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('WordPress get user error:', error);
      throw error;
    }
  }

  // Get users with filters
  async getUsers(params: {
    search?: string;
    roles?: string[];
    per_page?: number;
    page?: number;
    orderby?: string;
    order?: 'asc' | 'desc';
  } = {}): Promise<WordPressUser[]> {
    try {
      const searchParams = new URLSearchParams();
      
      Object.entries(params).forEach(([key, value]) => {
        if (value !== undefined) {
          if (Array.isArray(value)) {
            value.forEach(v => searchParams.append(key, v.toString()));
          } else {
            searchParams.append(key, value.toString());
          }
        }
      });

      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users?${searchParams}`, {
        headers: this.getAuthHeaders(),
      });

      if (!response.ok) {
        throw new Error(`Failed to get users: ${response.status} ${response.statusText}`);
      }

      return response.json();
    } catch (error) {
      console.error('WordPress get users error:', error);
      throw error;
    }
  }

  // Test connection to WordPress
  async testConnection(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/wp/v2/users`, {
        method: 'HEAD',
      });
      return response.status !== 404; // 404 means endpoint doesn't exist
    } catch (error) {
      console.error('WordPress connection test error:', error);
      return false;
    }
  }

  // Test JWT plugin availability
  async testJWTPlugin(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseUrl}/wp-json/jwt-auth/v1/token/validate`, {
        method: 'POST',
      });
      // If we get a response (even if it's an error), the plugin is available
      return response.status !== 404;
    } catch (error) {
      console.error('WordPress JWT plugin test error:', error);
      return false;
    }
  }

  // Get current token
  getToken(): string | null {
    return this.token;
  }

  // Check if user is authenticated
  isAuthenticated(): boolean {
    return this.token !== null;
  }
}

// User role management utilities
export class WordPressUserRoles {
  static readonly ADMIN = 'administrator';
  static readonly COACH = 'coach';
  static readonly PARENT = 'parent';
  static readonly SUBSCRIBER = 'subscriber';

  static mapToLocalRole(wpRoles: string[]): string {
    if (wpRoles.includes(this.ADMIN)) return 'admin';
    if (wpRoles.includes(this.COACH)) return 'coach';
    if (wpRoles.includes(this.PARENT)) return 'parent';
    return 'subscriber';
  }

  static mapToWordPressRole(localRole: string): string {
    switch (localRole) {
      case 'admin': return this.ADMIN;
      case 'coach': return this.COACH;
      case 'parent': return this.PARENT;
      default: return this.SUBSCRIBER;
    }
  }
}

// Session management for WordPress JWT
export class WordPressSessionManager {
  private static readonly SESSION_KEY = 'wp_session_data';
  private static readonly SESSION_EXPIRY_KEY = 'wp_session_expiry';

  static createSession(userData: JWTAuthResponse, userRole: string): string {
    const sessionId = `wp_session_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
    const expiryTime = Date.now() + (24 * 60 * 60 * 1000); // 24 hours
    
    const sessionData = {
      sessionId,
      userId: userData.user_id.toString(),
      userRole,
      email: userData.user_email,
      displayName: userData.user_display_name,
      token: userData.token,
      createdAt: Date.now(),
      expiresAt: expiryTime
    };

    if (typeof window !== 'undefined') {
      localStorage.setItem(this.SESSION_KEY, JSON.stringify(sessionData));
      localStorage.setItem(this.SESSION_EXPIRY_KEY, expiryTime.toString());
    }

    return sessionId;
  }

  static validateSession(): { isValid: boolean; session: any | null } {
    if (typeof window === 'undefined') {
      return { isValid: false, session: null };
    }

    try {
      const sessionData = localStorage.getItem(this.SESSION_KEY);
      const expiryTime = localStorage.getItem(this.SESSION_EXPIRY_KEY);

      if (!sessionData || !expiryTime) {
        return { isValid: false, session: null };
      }

      const expiry = parseInt(expiryTime);
      if (Date.now() > expiry) {
        this.destroySession();
        return { isValid: false, session: null };
      }

      const session = JSON.parse(sessionData);
      return { isValid: true, session };
    } catch (error) {
      console.error('Session validation error:', error);
      this.destroySession();
      return { isValid: false, session: null };
    }
  }

  static destroySession(): void {
    if (typeof window !== 'undefined') {
      localStorage.removeItem(this.SESSION_KEY);
      localStorage.removeItem(this.SESSION_EXPIRY_KEY);
      localStorage.removeItem('wp_jwt_token');
      // Clean up legacy localStorage items
      localStorage.removeItem('userRole');
      localStorage.removeItem('currentUser');
      localStorage.removeItem('userEmail');
    }
  }

  static getSession(): any | null {
    const { isValid, session } = this.validateSession();
    return isValid ? session : null;
  }

  static refreshSession(): void {
    const session = this.getSession();
    if (session) {
      const newExpiryTime = Date.now() + (24 * 60 * 60 * 1000); // Extend by 24 hours
      session.expiresAt = newExpiryTime;
      
      if (typeof window !== 'undefined') {
        localStorage.setItem(this.SESSION_KEY, JSON.stringify(session));
        localStorage.setItem(this.SESSION_EXPIRY_KEY, newExpiryTime.toString());
      }
    }
  }
}