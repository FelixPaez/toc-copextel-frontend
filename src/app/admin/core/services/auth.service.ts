import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, switchMap, tap } from 'rxjs/operators';

// Utils
import { AuthUtils } from '../utils/auth.utils';

// Types
import { IResponse } from '../models/shared.types';
import { StorageService } from './storage.service';

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

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _router: Router,
    private _storageService: StorageService
  ) {
    // Inicializar estado desde storage
    this._initializeAuth();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Setter & getter for access token
   */
  set tocAccessToken(token: string) {
    this._storageService.setItem(TOKEN_KEY, token);
  }

  get tocAccessToken(): string {
    return this._storageService.getItem<string>(TOKEN_KEY) || '';
  }

  /**
   * Get current user
   */
  getCurrentUser(): any | null {
    return this.authStateSubject.value.user;
  }

  /**
   * Get current token
   */
  getCurrentToken(): string | null {
    return this.authStateSubject.value.token;
  }

  /**
   * Check if user is authenticated
   */
  isAuthenticated(): boolean {
    return this.authStateSubject.value.isAuthenticated;
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Inicializar autenticación desde storage
   */
  private _initializeAuth(): void {
    const token = this.tocAccessToken;
    const user = this._storageService.getItem<any>(USER_KEY);
    const menu = this._storageService.getItem<any>(MENU_KEY);

    if (token && user && !AuthUtils.isTokenExpired(token)) {
      this._authenticated = true;
      this.authStateSubject.next({
        user,
        token,
        isAuthenticated: true,
        isLoading: false,
        menu
      });
    } else {
      // Limpiar si el token está expirado
      if (token && AuthUtils.isTokenExpired(token)) {
        this._clearAuth();
      }
    }
  }

  /**
   * Sign in
   *
   * @param credentials - Credenciales de login
   */
  public signIn(credentials: LoginCredentials): Observable<IResponse> {
    // Lanzar error si el usuario ya está autenticado
    if (this._authenticated) {
      return throwError(() => new Error('Ya ha iniciado sesión.'));
    }

    this._setLoading(true);

    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/signin`, credentials).pipe(
      switchMap((response) => {
        // Almacenar el token de acceso en el storage
        this.tocAccessToken = response.token || '';

        // Establecer la bandera de autenticado a true
        this._authenticated = true;

        // Almacenar el usuario
        if (response.user) {
          this._storageService.setItem(USER_KEY, response.user);
        }

        // Almacenar el menú
        if (response.menu) {
          this._storageService.setItem(MENU_KEY, response.menu);
        }

        // Actualizar el estado
        this.authStateSubject.next({
          user: response.user || null,
          token: response.token || null,
          isAuthenticated: true,
          isLoading: false,
          menu: response.menu || null
        });

        // Retornar la respuesta
        return of(response);
      }),
      catchError((error) => {
        this._setLoading(false);
        this._authenticated = false;
        return throwError(() => error);
      })
    );
  }

  /**
   * Sign in using the access token
   */
  public signInUsingToken(): Observable<boolean> {
    // Renovar token
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/auth/admin/refresh-token`).pipe(
      catchError(() => {
        // Retornar false si hay error
        return of(false);
      }),
      switchMap((response: IResponse | boolean) => {
        if (response === false) {
          return of(false);
        }

        const apiResponse = response as IResponse;

        // Almacenar el token de acceso en el storage
        if (apiResponse.token) {
          this.tocAccessToken = apiResponse.token;
        }

        // Establecer la bandera de autenticado a true
        this._authenticated = true;

        // Almacenar el usuario
        if (apiResponse.user) {
          this._storageService.setItem(USER_KEY, apiResponse.user);
        }

        // Almacenar el menú
        if (apiResponse.menu) {
          this._storageService.setItem(MENU_KEY, apiResponse.menu);
        }

        // Actualizar el estado
        this.authStateSubject.next({
          user: apiResponse.user || null,
          token: apiResponse.token || null,
          isAuthenticated: true,
          isLoading: false,
          menu: apiResponse.menu || null
        });

        // Retornar true
        return of(true);
      })
    );
  }

  /**
   * Sign out
   */
  public signOut(): Observable<boolean> {
    // Limpiar autenticación
    this._clearAuth();

    // Redirigir al login
    this._router.navigate(['/admin/auth/login']);

    // Retornar el observable
    return of(true);
  }

  /**
   * Forgot password
   *
   * @param email - Email del usuario
   */
  forgotPassword(email: string): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/forgot-password`, { email });
  }

  /**
   * Reset password
   *
   * @param passwordData - Datos para resetear contraseña
   */
  resetPassword(passwordData: { token: string; password: string }): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/reset-password`, passwordData);
  }

  /**
   * Unlock session
   *
   * @param credentials - Credenciales para desbloquear sesión
   */
  unlockSession(credentials: { email: string; password: string }): Observable<any> {
    return this._httpClient.post(`${API_URL_GATEWAY}/auth/admin/unlock-session`, credentials);
  }

  /**
   * Check the authentication status
   */
  public check(): Observable<boolean> {
    // Verificar si el usuario está autenticado
    if (this._authenticated) {
      return of(true);
    }

    // Verificar la disponibilidad del token de acceso
    const token = this.tocAccessToken;

    if (token === 'undefined' || !token) {
      // Remover el token de acceso del storage
      this._clearAuth();

      // Establecer la bandera de autenticado a false
      this._authenticated = false;

      // Retornar false
      return of(false);
    }

    // Verificar la fecha de expiración del token
    if (AuthUtils.isTokenExpired(token)) {
      return of(false);
    }

    // Si el token existe y no ha expirado, iniciar sesión usando el token
    return this.signInUsingToken();
  }

  /**
   * Limpiar datos de autenticación
   */
  private _clearAuth(): void {
    // Remover el token de acceso del storage
    this._storageService.removeItem(TOKEN_KEY);
    this._storageService.removeItem(USER_KEY);
    this._storageService.removeItem(MENU_KEY);

    // Establecer la bandera de autenticado a false
    this._authenticated = false;

    // Actualizar el estado
    this.authStateSubject.next({
      user: null,
      token: null,
      isAuthenticated: false,
      isLoading: false
    });
  }

  /**
   * Establecer estado de carga
   */
  private _setLoading(isLoading: boolean): void {
    const currentState = this.authStateSubject.value;
    this.authStateSubject.next({
      ...currentState,
      isLoading
    });
  }
}
