import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, CanDeactivate, CanLoad, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Services
import { AuthService } from '../services/auth.service';

// Interfaces
export interface CanComponentDeactivate {
  canDeactivate: () => Observable<boolean> | Promise<boolean> | boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthGuard implements CanActivate, CanActivateChild, CanDeactivate<CanComponentDeactivate>, CanLoad {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Check if route can be activated
   */
  canActivate(): Observable<boolean | UrlTree> {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (authState.isAuthenticated) {
          return true;
        } else {
          // Redirect to login page
          return this.router.createUrlTree(['/auth/login'], {
            queryParams: { returnUrl: this.router.url }
          });
        }
      })
    );
  }

  /**
   * Check if child route can be activated
   */
  canActivateChild(): Observable<boolean | UrlTree> {
    return this.canActivate();
  }

  /**
   * Check if route can be deactivated
   */
  canDeactivate(component: CanComponentDeactivate): Observable<boolean> | Promise<boolean> | boolean {
    return component.canDeactivate ? component.canDeactivate() : true;
  }

  /**
   * Check if module can be loaded
   */
  canLoad(): Observable<boolean> | Promise<boolean> | boolean {
    return this.authService.authState$.pipe(
      take(1),
      map(authState => authState.isAuthenticated)
    );
  }
}
