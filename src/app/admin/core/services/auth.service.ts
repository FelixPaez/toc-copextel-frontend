import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap } from 'rxjs/operators';

// Utils
import { AuthUtils } from '../utils/auth.utils';

// Types
import { IResponse } from '../models/shared.types';
import { StorageService } from './storage.service';
import { MockService } from './mock.service';

// Mock Data
import { MOCK_USERS } from '../../mocks/data/users.mock';

// Interfaces
export interface LoginCredentials {
  email: string;
  password: string;
  rememberMe?: boolean;
}

export interface AuthState {
  user: any | null;
  token: string | null;
  isAuthenticated: boolean;
  isLoading: boolean;
  menu?: any;
}

// Variables
import { environment } from '../../../../environments/environment';

// API Url
const API_URL_GATEWAY = environment.API_URL_GATEWAY;
const TOKEN_KEY = 'tocAccessToken';
const USER_KEY = 'tocUser';
const MENU_KEY = 'tocMenu';

/**
 * Auth Service
 * Servicio de autenticación con integración al backend real
 */
@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private _authenticated: boolean = false;

  private authStateSubject = new BehaviorSubject<AuthState>({
    user: null,
    token: null,
    isAuthenticated: false,
    isLoading: false
  });

  public authState$ = this.authStateSubject.asObservable();

  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private _storageService: StorageService,
    private _mockService: MockService
  ) {
    this._initializeAuth();
  }

  set tocAccessToken(token: string) {
    this._storageService.setItem(TOKEN_KEY, token);
  }

  get tocAccessToken(): string {
    return this._storageService.getItem<string>(TOKEN_KEY) || '';
  }

  getCurrentUser(): any | null {
    return this.authStateSubject.value.user;
  }

  getCurrentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  private _initializeAuth(): void {
    const token = this.tocAccessToken;
    const user = this._storageService.getItem<any>(USER_KEY);
    const menu = this._storageService.getItem<any>(MENU_KEY);

    if (!token || !user) {
      return;
    }

    // En modo mock, los tokens mock siempre son válidos
    const isMockToken = this._mockService.isMockMode && token.startsWith('mock_token_');
    const isTokenValid = isMockToken || !AuthUtils.isTokenExpired(token);

    if (isTokenValid) {
      this._authenticated = true;
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        menu
      });
    } else {
      this._clearAuth();
    }
  }

  public signIn(credentials: LoginCredentials): Observable<IResponse> {
    if (this._authenticated) {
      return throwError(() => new Error('Ya ha iniciado sesión.'));
    }

    this._setLoading(true);

    if (this._mockService.isMockMode) {
      const user = MOCK_USERS.find(u => 
        u.email.toLowerCase() === credentials.email.toLowerCase() ||
        u.username.toLowerCase() === credentials.email.toLowerCase()
      );

      if (!user) {
        this._setLoading(false);
        return this._mockService.simulateError('Correo electrónico o contraseña incorrecta', 401);
      }

      if (!user.active) {
        this._setLoading(false);
        return this._mockService.simulateError('Usuario inactivo', 403);
      }

      const mockToken = `mock_token_${user.id}_${Date.now()}`;

      return this._mockService.simulateDelay({
        ok: true,
        message: 'Login exitoso',
        token: mockToken,
        user: user,
        menu: null
      }, 500).pipe(
        switchMap((response) => {
          this._storeAuthData(response);
          return of(response);
        }),
        catchError((error) => {
          this._setLoading(false);
          this._authenticated = false;
          return throwError(() => error);
        })
      );
    }

    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/signin`, credentials).pipe(
      switchMap((response) => {
        this._storeAuthData(response);
        return of(response);
      }),
      catchError((error) => {
        this._setLoading(false);
        this._authenticated = false;
        return throwError(() => error);
      })
    );
  }

  private _storeAuthData(response: IResponse): void {
    this.tocAccessToken = response.token || '';
    this._authenticated = true;

    if (response.user) {
      this._storageService.setItem(USER_KEY, response.user);
    }

    if (response.menu) {
      this._storageService.setItem(MENU_KEY, response.menu);
    }

    this._setLoading(false);
    this.authStateSubject.next({
      user: response.user || null,
      token: response.token || null,
      isAuthenticated: true,
      isLoading: false,
      menu: response.menu || null
    });
  }

  public signInUsingToken(): Observable<boolean> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/auth/admin/refresh-token`).pipe(
      catchError(() => of(false)),
      switchMap((response: IResponse | boolean) => {
        if (response === false) {
          return of(false);
        }

        const apiResponse = response as IResponse;
        this._storeAuthData(apiResponse);
        return of(true);
      })
    );
  }

  public signOut(): Observable<boolean> {
    this._clearAuth();
    this._router.navigate(['/admin/auth/login']);
    return of(true);
  }

  forgotPassword(email: string): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/forgot-password`, { email });
  }

  resetPassword(passwordData: { token: string; password: string }): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/reset-password`, passwordData);
  }

  unlockSession(credentials: { email: string; password: string }): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/unlock-session`, credentials);
  }
  public check(): Observable<boolean> {
    const token = this.tocAccessToken;

    if (this._mockService.isMockMode) {
      if (token && token.startsWith('mock_token_')) {
        const user = this._storageService.getItem<any>(USER_KEY);
        if (user) {
          if (!this._authenticated) {
            this._authenticated = true;
            this.authStateSubject.next({
              user: user,
              token: token,
              isAuthenticated: true,
              isLoading: false,
              menu: this._storageService.getItem<any>(MENU_KEY) || null
            });
          }
          return of(true);
        }
      }
      
      if (this._authenticated && token && token.startsWith('mock_token_')) {
        const user = this._storageService.getItem<any>(USER_KEY);
        if (user) {
          return of(true);
        }
      }
      
      if (!token || !this._storageService.getItem<any>(USER_KEY)) {
        this._authenticated = false;
        return of(false);
      }
    }

    if (this._authenticated) {
      if (token && token !== 'undefined') {
        if (!this._mockService.isMockMode && AuthUtils.isTokenExpired(token)) {
          this._clearAuth();
          return of(false);
        }
        return of(true);
      } else {
        this._clearAuth();
        return of(false);
      }
    }

    if (token === 'undefined' || !token) {
      this._clearAuth();
      this._authenticated = false;
      return of(false);
    }

    if (!AuthUtils.isTokenExpired(token)) {
      return this.signInUsingToken();
    }

    return of(false);
  }

  private _clearAuth(): void {
    this._storageService.removeItem(TOKEN_KEY);
    this._storageService.removeItem(USER_KEY);
    this._storageService.removeItem(MENU_KEY);
    this._authenticated = false;
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  private _setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }
}
