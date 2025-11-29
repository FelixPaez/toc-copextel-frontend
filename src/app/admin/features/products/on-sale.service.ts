import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { InventoryProduct, InventoryPagination } from './products.types';

// Variables
import { environment } from '../../../../environments/environment';

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
  constructor(private _httpClient: HttpClient) {
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
    // Nota: El endpoint puede necesitar ajuste según el backend real
    // El proyecto viejo usa 'api/apps/ecommerce/inventory/products' pero puede ser diferente
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

