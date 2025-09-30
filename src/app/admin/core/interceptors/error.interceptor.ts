import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpErrorResponse } from '@angular/common/http';
import { Observable, throwError } from 'rxjs';
import { catchError } from 'rxjs/operators';

// Services
import { NotificationService } from '../services/notification.service';
import { AuthService } from '../services/auth.service';

@Injectable()
export class ErrorInterceptor implements HttpInterceptor {
  
  constructor(
    private notification: NotificationService,
    private authService: AuthService
  ) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    return next.handle(request).pipe(
      catchError((error: HttpErrorResponse) => {
        let errorMessage = 'An error occurred';

        if (error.error instanceof ErrorEvent) {
          // Client-side error
          errorMessage = error.error.message;
        } else {
          // Server-side error
          switch (error.status) {
            case 400:
              errorMessage = this.handle400Error(error);
              break;
            case 401:
              errorMessage = 'Unauthorized access';
              // Don't show notification for 401, let auth interceptor handle it
              return throwError(() => error);
            case 403:
              errorMessage = 'Access forbidden';
              break;
            case 404:
              errorMessage = 'Resource not found';
              break;
            case 409:
              errorMessage = this.handle409Error(error);
              break;
            case 422:
              errorMessage = this.handle422Error(error);
              break;
            case 429:
              errorMessage = 'Too many requests. Please try again later.';
              break;
            case 500:
              errorMessage = 'Internal server error';
              break;
            case 502:
              errorMessage = 'Bad gateway';
              break;
            case 503:
              errorMessage = 'Service unavailable';
              break;
            case 504:
              errorMessage = 'Gateway timeout';
              break;
            default:
              errorMessage = error.error?.message || `Error ${error.status}: ${error.statusText}`;
          }
        }

        // Show error notification
        this.notification.error('Error', errorMessage);

        return throwError(() => error);
      })
    );
  }

  /**
   * Handle 400 Bad Request errors
   */
  private handle400Error(error: HttpErrorResponse): string {
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const validationErrors = error.error.errors
        .map((err: any) => err.message)
        .join(', ');
      return `Validation errors: ${validationErrors}`;
    }
    return error.error?.message || 'Bad request';
  }

  /**
   * Handle 409 Conflict errors
   */
  private handle409Error(error: HttpErrorResponse): string {
    if (error.error?.message) {
      return error.error.message;
    }
    return 'Resource conflict. The resource already exists or has been modified.';
  }

  /**
   * Handle 422 Unprocessable Entity errors
   */
  private handle422Error(error: HttpErrorResponse): string {
    if (error.error?.errors && Array.isArray(error.error.errors)) {
      const validationErrors = error.error.errors
        .map((err: any) => `${err.field}: ${err.message}`)
        .join(', ');
      return `Validation failed: ${validationErrors}`;
    }
    return error.error?.message || 'Validation failed';
  }
}
