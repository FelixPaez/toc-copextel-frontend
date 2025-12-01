import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { ProductsService } from '../../features/products/products.service';
import { CategoriesService } from '../../features/categories/categories.service';
import { InventoryProduct } from '../../features/products/products.types';

export interface ProductsResolverData {
  products: InventoryProduct[];
  categories: any[];
  pagination: any;
}

/**
 * Products Resolver
 * Precarga productos y categorías antes de navegar a la ruta
 */
@Injectable({ providedIn: 'root' })
export class ProductsResolver implements Resolve<ProductsResolverData> {
  constructor(
    private productsService: ProductsService,
    private categoriesService: CategoriesService
  ) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<ProductsResolverData> {
    // Cargar categorías y productos en paralelo
    const categories$ = this.categoriesService.getCategories().pipe(
      catchError(() => of({ categories: [] }))
    );

    const products$ = this.productsService.getProducts(0, 10, 'orderNo', 'asc', '').pipe(
      catchError(() => of(null))
    );

    return forkJoin({
      categories: categories$,
      products: products$
    }).pipe(
      map(({ categories, products }) => ({
        products: products?.products || [],
        categories: categories?.categories || [],
        pagination: products?.pagination || null
      }))
    );
  }
}

