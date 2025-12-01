import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { InventoryProduct, InventoryCategory } from './products.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_PRODUCTS, MOCK_CATEGORIES } from '../../mocks/data/products.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

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
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) {
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_PRODUCTS,
        page,
        size,
        sort || 'id',
        order,
        search,
        ['name', 'code', 'description'] as (keyof InventoryProduct)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        products: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
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
    
    // Real API call
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
      }),
      catchError((error) => {
        console.error('Error getting products:', error);
        return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      // Filter products by vendor UO
      let filteredProducts = MOCK_PRODUCTS.filter(p => p.uo === userUo);
      
      const result = applyMockPagination(
        filteredProducts,
        page,
        size,
        sort || 'id',
        order,
        search,
        ['name', 'code', 'description'] as (keyof InventoryProduct)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        products: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
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

    // Real API call
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const product = MOCK_PRODUCTS.find(p => p.id === productId);
      if (!product) {
        return this._mockService.simulateError('Producto no encontrado', 404);
      }
      return this._mockService.simulateDelay(product).pipe(
        tap((product) => {
          this._product.next(product);
        })
      );
    }
    
    // Real API call
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const newProduct: InventoryProduct = {
        ...formData,
        id: Math.max(...MOCK_PRODUCTS.map(p => p.id), 0) + 1,
        createdAt: new Date()
      };
      MOCK_PRODUCTS.unshift(newProduct);
      
      return this.products$.pipe(
        take(1),
        switchMap(products => {
          if (!products) {
            products = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Producto creado exitosamente',
            product: newProduct
          }).pipe(
            tap(() => {
              this._products.next([newProduct, ...products]);
            })
          );
        })
      );
    }
    
    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error creating product:', error);
            return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_PRODUCTS.findIndex(p => p.id === product.id);
      if (index === -1) {
        return this._mockService.simulateError('Producto no encontrado', 404);
      }
      
      const updatedProduct = { ...MOCK_PRODUCTS[index], ...product };
      MOCK_PRODUCTS[index] = updatedProduct;
      
      return this.products$.pipe(
        take(1),
        switchMap(products => {
          if (!products) {
            return throwError(() => new Error('No products available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Producto actualizado exitosamente',
            updatedProduct: updatedProduct
          }).pipe(
            tap(() => {
              const productIndex = products.findIndex(item => item.id === product.id);
              if (productIndex !== -1) {
                products[productIndex] = updatedProduct;
                this._products.next(products);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error updating product:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_PRODUCTS.findIndex(p => p.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Producto no encontrado', 404);
      }
      
      MOCK_PRODUCTS.splice(index, 1);
      
      return this.products$.pipe(
        take(1),
        switchMap(products => {
          if (!products) {
            return throwError(() => new Error('No products available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Producto eliminado exitosamente'
          }).pipe(
            tap(() => {
              const productIndex = products.findIndex(item => item.id === id);
              if (productIndex !== -1) {
                products.splice(productIndex, 1);
                this._products.next(products);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error deleting product:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Get categories
   */
  public getCategories(): Observable<InventoryCategory[]> {
    // Mock mode
    if (this._mockService.isMockMode) {
      return this._mockService.simulateDelay(MOCK_CATEGORIES).pipe(
        tap((categories) => {
          this._categories.next(categories);
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<InventoryCategory[]>(`${API_URL_GATEWAY}/categories`).pipe(
      tap((categories) => {
        this._categories.next(categories);
      })
    );
  }
}

