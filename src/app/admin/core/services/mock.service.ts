import { Injectable } from '@angular/core';
import { Observable, of, throwError } from 'rxjs';
import { delay } from 'rxjs/operators';
import { environment } from '../../../../environments/environment';

/**
 * Mock Service
 * Servicio para manejar datos mock cuando useMocks está habilitado
 */
@Injectable({
  providedIn: 'root'
})
export class MockService {
  
  /**
   * Check if mocks are enabled
   */
  get isMockMode(): boolean {
    return environment.useMocks;
  }

  /**
   * Simulate API delay
   */
  simulateDelay<T>(data: T, ms: number = 0): Observable<T> {
    return of(data).pipe(delay(ms));
  }

  /**
   * Simulate API error
   */
  simulateError(message: string = 'Error simulado', status: number = 500): Observable<never> {
    return throwError(() => ({
      error: {
        message,
        status
      },
      status,
      statusText: 'Error'
    }));
  }

  /**
   * Simulate success response
   */
  simulateSuccess<T>(data: T, message?: string): Observable<any> {
    return this.simulateDelay({
      ok: true,
      message: message || 'Operación exitosa',
      ...data
    });
  }
}

