import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap, delay } from 'rxjs/operators';

// Types
import { InventoryProduct, InventoryPagination } from './products.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_PRODUCTS } from '../../mocks/data/products.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * On Sale Products Service
 * Servicio para gestión de productos en oferta
 */
@Injectable({
  providedIn: 'root'
})
export class OnSaleProductService {
  // Private
  private _onSaleProduct: BehaviorSubject<InventoryProduct | null> = new BehaviorSubject<InventoryProduct | null>(null);
  private _onSaleProducts: BehaviorSubject<InventoryProduct[] | null> = new BehaviorSubject<InventoryProduct[] | null>(null);
  private _pagination: BehaviorSubject<InventoryPagination | null> = new BehaviorSubject<InventoryPagination | null>(null);

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
   * Getter for product
   */
  get onSaleProduct$(): Observable<InventoryProduct> {
    return this._onSaleProduct.asObservable();
  }

  /**
   * Getter for products
   */
  get onSaleProducts$(): Observable<InventoryProduct[]> {
    return this._onSaleProducts.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<InventoryPagination> {
    return this._pagination.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get on sale products
   *
   * @param page - Página
   * @param size - Tamaño
   * @param sort - Campo de ordenamiento
   * @param order - Orden
   * @param search - Búsqueda
   */
  public getOnSaleProducts(
    page: number = 0,
    size: number = 10,
    sort: string = 'name',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<{ pagination: InventoryPagination; products: InventoryProduct[] }> {
    // Mock mode
    if (this._mockService.isMockMode) {
      // Filter products that have onSale > 0
      let filtered = MOCK_PRODUCTS.filter(p => p.onSale && p.onSale > 0);

      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filtered = filtered.filter(p =>
          p.name.toLowerCase().includes(searchLower) ||
          p.code?.toLowerCase().includes(searchLower) ||
          p.description?.toLowerCase().includes(searchLower)
        );
      }

      // Apply sorting
      filtered.sort((a, b) => {
        let aValue: any = a[sort as keyof InventoryProduct];
        let bValue: any = b[sort as keyof InventoryProduct];

        if (typeof aValue === 'string') {
          aValue = aValue.toLowerCase();
          bValue = bValue.toLowerCase();
        }

        if (order === 'desc') {
          return aValue > bValue ? -1 : aValue < bValue ? 1 : 0;
        }
        return aValue < bValue ? -1 : aValue > bValue ? 1 : 0;
      });

      // Apply pagination
      const paginated = applyMockPagination(filtered, page, size);
      
      // Convert TablePagination to InventoryPagination
      const inventoryPagination: InventoryPagination = {
        length: paginated.pagination.length || 0,
        size: paginated.pagination.size || size,
        page: paginated.pagination.page || page,
        lastPage: paginated.pagination.lastPage || 0,
        startIndex: paginated.pagination.startIndex || 0,
        endIndex: paginated.pagination.endIndex || 0
      };

      return this._mockService.simulateDelay({
        pagination: inventoryPagination,
        products: paginated.data
      }).pipe(
        tap((response) => {
          this._pagination.next(response.pagination);
          this._onSaleProducts.next(response.products);
        })
      );
    }

    // Real API call
    return this._httpClient.get<{ pagination: InventoryPagination; products: InventoryProduct[] }>(
      `${API_URL_GATEWAY}/product/on-sale`,
      {
        params: {
          page: '' + page,
          size: '' + size,
          sort,
          order,
          search
        }
      }
    ).pipe(
      tap((response) => {
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
        if (response.products) {
          this._onSaleProducts.next(response.products);
        }
      })
    );
  }

  /**
   * Get on sale product by id
   *
   * @param id - ID del producto
   */
  public getOnSaleProductById(id: number): Observable<InventoryProduct> {
    return this.onSaleProducts$.pipe(
      take(1),
      map((products) => {
        if (!products) {
          throw new Error('No products available');
        }

        // Find the product
        const product = products.find(item => item.id === id) || null;

        if (!product) {
          throw new Error(`Could not found product with id of ${id}!`);
        }

        // Update the product
        this._onSaleProduct.next(product);

        // Return the product
        return product;
      })
    );
  }
}

