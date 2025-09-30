import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent } from '@angular/common/http';
import { Observable } from 'rxjs';
import { finalize } from 'rxjs/operators';

// Services
import { LoadingService } from '../services/loading.service';

@Injectable()
export class LoadingInterceptor implements HttpInterceptor {
  private totalRequests = 0;

  constructor(private loadingService: LoadingService) {}

  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Skip loading for certain requests
    if (this.shouldSkipLoading(request)) {
      return next.handle(request);
    }

    this.totalRequests++;
    this.loadingService.show();

    return next.handle(request).pipe(
      finalize(() => {
        this.totalRequests--;
        if (this.totalRequests === 0) {
          this.loadingService.hide();
        }
      })
    );
  }

  /**
   * Check if loading should be skipped for this request
   */
  private shouldSkipLoading(request: HttpRequest<any>): boolean {
    // Skip loading for background requests
    const skipLoading = request.headers.get('X-Skip-Loading');
    if (skipLoading === 'true') {
      return true;
    }

    // Skip loading for certain endpoints
    const skipEndpoints = [
      '/api/notifications',
      '/api/health',
      '/api/ping'
    ];

    return skipEndpoints.some(endpoint => request.url.includes(endpoint));
  }
}
