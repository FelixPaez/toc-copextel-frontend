import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { InventoryProduct, InventoryCategory } from './products.types';

// Variables
import { environment } from '../../../../environments/environment';

// API Url
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Products Service (Inventory Service)
 * Servicio para gestión de productos/inventario
 */
@Injectable({
  providedIn: 'root'
})
export class ProductsService {

  // Private properties
  private _categories: BehaviorSubject<InventoryCategory[] | null> = new BehaviorSubject<InventoryCategory[] | null>(null);
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);
  private _product: BehaviorSubject<InventoryProduct | null> = new BehaviorSubject<InventoryProduct | null>(null);
  private _products: BehaviorSubject<InventoryProduct[] | null> = new BehaviorSubject<InventoryProduct[] | null>(null);
  private _productsArr: BehaviorSubject<InventoryProduct[] | null> = new BehaviorSubject<InventoryProduct[] | null>(null);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for categories
   */
  get categories$(): Observable<InventoryCategory[]> {
    return this._categories.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<TablePagination> {
    return this._pagination.asObservable();
  }

  /**
   * Getter for product
   */
  get product$(): Observable<InventoryProduct> {
    return this._product.asObservable();
  }

  /**
   * Getter for products
   */
  get products$(): Observable<InventoryProduct[]> {
    return this._products.asObservable();
  }

  /**
   * Getter for productsArr
   */
  get productsArr$(): Observable<InventoryProduct[]> {
    return this._productsArr.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get products
   *
   * @param page - Página actual
   * @param size - Tamaño de página
   * @param sort - Campo de ordenamiento
   * @param order - Orden (asc/desc)
   * @param search - Término de búsqueda
   */
  public getProducts(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/product/`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response) => {
        // Set pagination
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }

        if (response.products) {
          this._products.next(response.products);
          this._productsArr.next(response.products);
        }
      })
    );
  }

  /**
   * Get products by vendor
   *
   * @param page - Página actual
   * @param size - Tamaño de página
   * @param sort - Campo de ordenamiento
   * @param order - Orden (asc/desc)
   * @param search - Término de búsqueda
   * @param userUo - Unidad organizativa del vendedor
   */
  public getProductsByVendor(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = '',
    userUo?: string
  ): Observable<IResponse> {
    if (!userUo) {
      return throwError(() => new Error('userUo is required'));
    }

    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/product/by-vendor/${userUo}`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response) => {
        // Set pagination
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }

        if (response.products) {
          this._products.next(response.products);
          this._productsArr.next(response.products);
        }
      })
    );
  }

  /**
   * Get product by id
   *
   * @param productId - ID del producto
   */
  public getProductById(productId: number): Observable<InventoryProduct> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/product/${productId}`).pipe(
      map((response) => {
        if (response.product) {
          this._product.next(response.product);
          return response.product;
        }
        throw new Error('Product not found');
      }),
      catchError((error) => {
        console.error('Error getting product by id:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create product
   *
   * @param formData - Datos del producto a crear
   */
  public createProduct(formData: InventoryProduct): Observable<IResponse> {
    return this.products$.pipe(
      take(1),
      switchMap(products => {
        if (!products) {
          products = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/product/`, formData).pipe(
          map((response) => {
            // Update the products with the new product
            if (response.product) {
              this._products.next([response.product, ...products]);
            }
            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Update product
   *
   * @param product - Datos del producto a actualizar
   */
  public updateProduct(product: InventoryProduct): Observable<IResponse> {
    if (!product.id) {
      return throwError(() => new Error('Product ID is required'));
    }

    return this.products$.pipe(
      take(1),
      switchMap(products => {
        if (!products) {
          return throwError(() => new Error('No products available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/product/${product.id}`, product).pipe(
          map((response) => {
            if (!response.updatedProduct) {
              throw new Error('Update failed');
            }

            // Find the index of the updated product
            const index = products.findIndex(item => item.id === product.id);

            if (index !== -1) {
              // Update the product
              products[index] = response.updatedProduct;

              // Update the products
              this._products.next(products);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Delete the product
   *
   * @param id - ID del producto a eliminar
   */
  public deleteProduct(id: number): Observable<IResponse> {
    return this.products$.pipe(
      take(1),
      switchMap(products => {
        if (!products) {
          return throwError(() => new Error('No products available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/product/${id}`).pipe(
          map((response) => {
            // Find the index of the deleted product
            const index = products.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the product
              products.splice(index, 1);

              // Update the products
              this._products.next(products);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Get categories
   */
  public getCategories(): Observable<InventoryCategory[]> {
    return this._httpClient.get<InventoryCategory[]>(`${API_URL_GATEWAY}/categories`).pipe(
      tap((categories) => {
        this._categories.next(categories);
      })
    );
  }
}

