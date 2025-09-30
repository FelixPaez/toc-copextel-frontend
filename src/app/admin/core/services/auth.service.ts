import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, tap, catchError, delay } from 'rxjs/operators';
import { Router } from '@angular/router';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthToken {
  accessToken: string;
  refreshToken: string;
  expiresIn: number;
  tokenType: string;
}

export interface AuthState {
  user: any | null;
  token: AuthToken | null;
  isAuthenticated: boolean;
  isLoading: boolean;
}

export interface User {
  id: string;
  email: string;
  firstName: string;
  lastName: string;
  fullName: string;
  avatar?: string;
  role: string;
  permissions: string[];
  isActive: boolean;
  lastLogin?: Date;
  createdAt: Date;
  updatedAt: Date;
}

export interface ApiResponse<T = any> {
  success: boolean;
  data?: T;
  message?: string;
  errors?: any[];
  pagination?: any;
  timestamp: Date;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private readonly API_URL = '/api/auth';
  private readonly TOKEN_KEY = 'auth_token';
  private readonly USER_KEY = 'current_user';

  // Usuario de ejemplo para testing
  private readonly DEMO_USER: User = {
    id: '1',
    email: 'admin@tienda.com',
    firstName: 'Administrador',
    lastName: 'Sistema',
    fullName: 'Administrador Sistema',
    avatar: 'assets/images/faces/1.jpg',
    role: 'admin',
    permissions: [
      'dashboard:read',
      'products:read',
      'products:write',
      'orders:read',
      'orders:write',
      'customers:read',
      'customers:write',
      
      'reports:read',
      'settings:read',
      'settings:write'
    ],
    isActive: true,
    lastLogin: new Date(),
    createdAt: new Date('2023-01-01'),
    updatedAt: new Date()
  };

  private readonly DEMO_TOKEN: AuthToken = {
    accessToken: 'demo-access-token-12345',
    refreshToken: 'demo-refresh-token-12345',
    expiresIn: new Date(Date.now() + 24 * 60 * 60 * 1000).getTime(), // 24 horas
    tokenType: 'Bearer'
  };

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private http: HttpClient,
    private router: Router
  ) {
    this.initializeAuth();
  }

  /**
   * Initialize authentication state from storage
   */
  private initializeAuth(): void {
    const token = this.getItem<AuthToken>(this.TOKEN_KEY);
    const user = this.getItem<User>(this.USER_KEY);

    if (token && user && !this.isTokenExpired(token)) {
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false
      });
    }
  }

  /**
   * Login user
   */
  login(credentials: LoginCredentials): Observable<User> {
    this.setLoading(true);

    // Simular autenticación con usuario demo
    return of({ success: true, data: { user: this.DEMO_USER, token: this.DEMO_TOKEN } }).pipe(
      delay(1000), // Simular delay de red
      map(response => {
        if (!response.success) {
          throw new Error('Login failed');
        }

        const { user, token } = response.data!;
        
        // Store authentication data
        this.setItem(this.TOKEN_KEY, token);
        this.setItem(this.USER_KEY, user);

        // Update auth state
        this.authStateSubject.next({
          user,
          token,
          isAuthenticated: true,
          isLoading: false
        });

        return user;
      }),
      catchError(error => {
        this.setLoading(false);
        return throwError(() => error);
      })
    );
  }

  /**
   * Logout user
   */
  logout(): void {
    // Clear storage
    this.removeItem(this.TOKEN_KEY);
    this.removeItem(this.USER_KEY);

    // Update auth state
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });

    this.router.navigate(['/auth/login']);
  }

  /**
   * Refresh authentication token
   */
  refreshToken(): Observable<AuthToken> {
    const currentToken = this.getItem<AuthToken>(this.TOKEN_KEY);
    
    if (!currentToken?.refreshToken) {
      return throwError(() => new Error('No refresh token available'));
    }

    return this.http.post<ApiResponse<AuthToken>>(
      `${this.API_URL}/refresh`,
      { refreshToken: currentToken.refreshToken }
    ).pipe(
      map(response => {
        if (!response.success) {
          throw new Error(response.message || 'Token refresh failed');
        }

        const newToken = response.data!;
        this.setItem(this.TOKEN_KEY, newToken);

        // Update auth state
        const currentState = this.authStateSubject.value;
        this.authStateSubject.next({
          ...currentState,
          token: newToken
        });

        return newToken;
      }),
      catchError(error => {
        this.logout();
        return throwError(() => error);
      })
    );
  }

  /**
   * Get current user
   */
  getCurrentUser(): User | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get current token
   */
  getCurrentToken(): AuthToken | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  /**
   * Check if user has specific role
   */
  hasRole(role: string): boolean {
    const user = this.getCurrentUser();
    return user?.role === role;
  }

  /**
   * Check if user has any of the specified roles
   */
  hasAnyRole(roles: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? roles.includes(user.role) : false;
  }

  /**
   * Check if user has specific permission
   */
  hasPermission(permission: string): boolean {
    const user = this.getCurrentUser();
    return user?.permissions.includes(permission) || false;
  }

  /**
   * Check if user has any of the specified permissions
   */
  hasAnyPermission(permissions: string[]): boolean {
    const user = this.getCurrentUser();
    return user ? permissions.some(permission => user.permissions.includes(permission)) : false;
  }

  /**
   * Check if token is expired
   */
  private isTokenExpired(token: AuthToken): boolean {
    if (!token.expiresIn) return true;
    
    const expirationTime = new Date(token.expiresIn).getTime();
    const currentTime = new Date().getTime();
    
    return currentTime >= expirationTime;
  }

  /**
   * Set loading state
   */
  private setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }

  // Storage methods
  private setItem<T>(key: string, value: T): void {
    try {
      const serializedValue = JSON.stringify(value);
      localStorage.setItem(key, serializedValue);
    } catch (error) {
      console.error('Error setting item in storage:', error);
    }
  }

  private getItem<T>(key: string): T | null {
    try {
      const item = localStorage.getItem(key);
      return item ? JSON.parse(item) : null;
    } catch (error) {
      console.error('Error getting item from storage:', error);
      return null;
    }
  }

  private removeItem(key: string): void {
    try {
      localStorage.removeItem(key);
    } catch (error) {
      console.error('Error removing item from storage:', error);
    }
  }
}
