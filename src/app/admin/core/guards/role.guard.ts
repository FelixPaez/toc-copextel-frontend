import { Injectable } from '@angular/core';
import { CanActivate, CanActivateChild, Router, UrlTree } from '@angular/router';
import { Observable } from 'rxjs';
import { map, take } from 'rxjs/operators';

// Services
import { AuthService } from '../services/auth.service';

// Interfaces
export interface RoleGuardData {
  roles?: string[]; // Usa roles como strings (Roles enum o strings)
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
    
    return this.authService.check().pipe(
      take(1),
      map(isAuthenticated => {
        if (!isAuthenticated) {
          return this.router.createUrlTree(['/admin/auth/login']);
        }

        const user = this.authService.getCurrentUser();
        if (!user) {
          return this.router.createUrlTree(['/admin/auth/login']);
        }

        // Check roles
        if (guardData.roles && guardData.roles.length > 0) {
          if (!this.hasAnyRole(user, guardData.roles)) {
            return this.handleUnauthorized(guardData.redirectTo);
          }
        }

        // Check permissions
        if (guardData.permissions && guardData.permissions.length > 0) {
          if (!this.hasAnyPermission(user, guardData.permissions)) {
            return this.handleUnauthorized(guardData.redirectTo);
          }
        }

        return true;
      })
    );
  }

  /**
   * Check if user has any of the specified roles
   */
  private hasAnyRole(user: any, roles: string[]): boolean {
    if (!user || !user.roles) {
      return false;
    }
    
    const userRoles = Array.isArray(user.roles) ? user.roles : [user.roles];
    return roles.some(role => userRoles.includes(role));
  }

  /**
   * Check if user has any of the specified permissions
   */
  private hasAnyPermission(user: any, permissions: string[]): boolean {
    if (!user || !user.permissions) {
      return false;
    }
    
    const userPermissions = Array.isArray(user.permissions) ? user.permissions : [user.permissions];
    return permissions.some(permission => userPermissions.includes(permission));
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
      // Default redirect to dashboard
      return this.router.createUrlTree(['/admin/dashboard']);
    }
  }
}
