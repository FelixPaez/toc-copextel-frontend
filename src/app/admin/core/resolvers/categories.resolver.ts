import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CategoriesService } from '../../features/categories/categories.service';
import { Category } from '../../features/categories/categories.types';

/**
 * Categories Resolver
 * Precarga categorías antes de navegar a la ruta
 */
@Injectable({ providedIn: 'root' })
export class CategoriesResolver implements Resolve<Category[]> {
  constructor(private categoriesService: CategoriesService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<Category[]> {
    return this.categoriesService.getCategories().pipe(
      map(response => response?.categories || []),
      catchError(() => of([]))
    );
  }
}

