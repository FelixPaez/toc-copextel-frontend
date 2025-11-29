import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';

// Variables
import { environment } from '../../../../environments/environment';

/**
 * API Key Interceptor
 * Agrega el API_KEY a todas las peticiones HTTP
 */
@Injectable()
export class ApiKeyInterceptor implements HttpInterceptor {
  
  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Clonar la petición y agregar el header de API_KEY
    const clonedRequest = req.clone({
      setHeaders: {
        apikey: environment.API_KEY
      }
    });

    return next.handle(clonedRequest);
  }
}

