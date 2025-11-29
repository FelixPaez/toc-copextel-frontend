import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError, BehaviorSubject } from 'rxjs';
import { catchError, filter, take, switchMap } from 'rxjs/operators';

// Services
import { AuthService } from '../services/auth.service';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private isRefreshing = false;
  private refreshTokenSubject: BehaviorSubject<string | null> = new BehaviorSubject<string | null>(null);

  constructor(private authService: AuthService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Obtener el token actual
    const token = this.authService.getCurrentToken();

    // Agregar header de autorización si el token existe
    if (token) {
      request = this.addToken(request, token);
    }

    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        // Manejar error 401 (no autorizado)
        if (error.status === 401 && !request.url.includes('auth/refresh-token') && !request.url.includes('auth/signin')) {
          return this.handle401Error(request, next);
        }
        return throwError(() => error);
      })
    );
  }

  /**
   * Agregar header de autorización a la petición
   */
  private addToken(request: HttpRequest<any>, token: string): HttpRequest<any> {
    return request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });
  }

  /**
   * Manejar error 401 (No autorizado)
   * Intenta refrescar el token
   */
  private handle401Error(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    if (!this.isRefreshing) {
      this.isRefreshing = true;
      this.refreshTokenSubject.next(null);

      return this.authService.signInUsingToken().pipe(
        switchMap((success: boolean) => {
          this.isRefreshing = false;
          
          if (success) {
            const newToken = this.authService.getCurrentToken();
            if (newToken) {
              this.refreshTokenSubject.next(newToken);
              return next.handle(this.addToken(request, newToken));
            }
          }
          
          // Si falla el refresh, hacer logout
          this.authService.signOut();
          return throwError(() => new Error('Token refresh failed'));
        }),
        catchError((error) => {
          this.isRefreshing = false;
          this.authService.signOut();
          return throwError(() => error);
        })
      );
    } else {
      // Si ya se está refrescando, esperar a que termine
      return this.refreshTokenSubject.pipe(
        filter(token => token !== null),
        take(1),
        switchMap(token => {
          if (token) {
            return next.handle(this.addToken(request, token));
          }
          return throwError(() => new Error('No token available'));
        })
      );
    }
  }
}
