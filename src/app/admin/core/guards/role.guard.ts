import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Services
import { AuthService } from '../services/auth.service';

// Models
import { UserRole } from '../models/user.model';

// Interfaces
export interface RoleGuardData {
  roles?: UserRole[];
  permissions?: string[];
  redirectTo?: string;
}

@Injectable({
  providedIn: 'root'
})
export class RoleGuard implements CanActivate, CanActivateChild {
  
  constructor(
    private authService: AuthService,
    private router: Router
  ) {}

  /**
   * Check if route can be activated based on roles/permissions
   */
  canActivate(route: any): Observable<boolean | UrlTree> {
    const guardData: RoleGuardData = route.data?.roleGuard || {};
    
    return this.authService.authState$.pipe(
      take(1),
      map(authState => {
        if (!authState.isAuthenticated) {
          return this.router.createUrlTree(['/auth/login']);
        }

        const user = authState.user;
        if (!user) {
          return this.router.createUrlTree(['/auth/login']);
        }

        // Check roles
        if (guardData.roles && guardData.roles.length > 0) {
          if (!this.authService.hasAnyRole(guardData.roles)) {
            return this.handleUnauthorized(guardData.redirectTo);
          }
        }

        // Check permissions
        if (guardData.permissions && guardData.permissions.length > 0) {
          if (!this.authService.hasAnyPermission(guardData.permissions)) {
            return this.handleUnauthorized(guardData.redirectTo);
          }
        }

        return true;
      })
    );
  }

  /**
   * Check if child route can be activated
   */
  canActivateChild(childRoute: any): Observable<boolean | UrlTree> {
    return this.canActivate(childRoute);
  }

  /**
   * Handle unauthorized access
   */
  private handleUnauthorized(redirectTo?: string): UrlTree {
    if (redirectTo) {
      return this.router.createUrlTree([redirectTo]);
    } else {
      // Default redirect to dashboard or 403 page
      return this.router.createUrlTree(['/error/403']);
    }
  }
}
