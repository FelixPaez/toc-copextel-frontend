import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, pluck, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Order, OrderUpdateStatus } from './orders.types';

// Variables
import { environment } from '../../../../environments/environment';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Orders Service
 * Servicio para gestión de pedidos
 */
@Injectable({
  providedIn: 'root'
})
export class OrdersService {

  // Private
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);
  private _order: BehaviorSubject<Order | null> = new BehaviorSubject<Order | null>(null);
  private _orders: BehaviorSubject<Order[] | null> = new BehaviorSubject<Order[] | null>(null);
  private _ordersArr: BehaviorSubject<Order[] | null> = new BehaviorSubject<Order[] | null>(null);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<TablePagination> {
    return this._pagination.asObservable();
  }

  /**
   * Getter for order
   */
  get order$(): Observable<Order> {
    return this._order.asObservable();
  }

  /**
   * Getter for orders
   */
  get orders$(): Observable<Order[]> {
    return this._orders.asObservable();
  }

  /**
   * Getter for ordersArr
   */
  get ordersArr$(): Observable<Order[]> {
    return this._ordersArr.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get orders
   *
   * @param [page=0]
   * @param [size=10]
   * @param [sort='orderNo']
   * @param [order='asc']
   * @param [search='']
   */
  public getOrders(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/orders/`, {
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

        if (response.orders) {
          this._orders.next(response.orders);
        }
      })
    );
  }

  /**
   * Get orders by vendor
   *
   * @param [page=0]
   * @param [size=10]
   * @param [sort='orderNo']
   * @param [order='asc']
   * @param [search='']
   * @param [vendorId='']
   */
  public getOrdersByVendor(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = '',
    vendorId: string = ''
  ): Observable<IResponse> {
    if (!vendorId) {
      return throwError(() => new Error('vendorId is required'));
    }

    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/orders/filter-vendor/${vendorId}`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search,
      }
    }).pipe(
      tap((response) => {
        // Set pagination
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }

        if (response.orders) {
          this._orders.next(response.orders);
        }
      })
    );
  }

  /**
   * Get order by id
   *
   * @param orderId - ID del pedido
   */
  public getOrderById(orderId: number): Observable<Order> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/orders/${orderId}`).pipe(
      map((response) => {
        if (response.order) {
          this._order.next(response.order);
          return response.order;
        }
        throw new Error('Order not found');
      })
    );
  }

  /**
   * Update order
   *
   * @param order - Datos del pedido a actualizar
   */
  public updateOrder(order: Order): Observable<IResponse> {
    if (!order.id) {
      return throwError(() => new Error('Order ID is required'));
    }

    return this.orders$.pipe(
      take(1),
      switchMap(orders => {
        if (!orders) {
          return throwError(() => new Error('No orders available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/orders/${order.id}`, order).pipe(
          map((response) => {
            if (!response.order) {
              throw new Error('Update failed');
            }

            // Find the index of the updated order
            const index = orders.findIndex(item => item.id === order.id);

            if (index !== -1) {
              // Update the order
              orders[index] = response.order;

              // Update the orders
              this._orders.next(orders);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Update order status
   *
   * @param data - Datos para actualizar el estado del pedido
   */
  public updateOrderStatus(data: OrderUpdateStatus): Observable<IResponse> {
    return this.orders$.pipe(
      take(1),
      switchMap(orders => {
        if (!orders) {
          return throwError(() => new Error('No orders available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/orders/update-state`, data).pipe(
          map((response) => {
            if (!response.updatedOrder) {
              throw new Error('Status update failed');
            }

            // Find the index of the updated order
            const index = orders.findIndex(item => item.id === data.orderId);

            if (index !== -1) {
              // Update the order
              orders[index] = response.updatedOrder;

              // Update the orders
              this._orders.next(orders);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Enzona refund
   * Procesar reembolso a través de Enzona
   *
   * @param orderId - ID del pedido
   * @param transactionUuid - UUID de la transacción
   * @param paymentRefundIn - Datos del reembolso
   */
  public enzonaRefund(
    orderId: number,
    transactionUuid: string,
    paymentRefundIn: { amount: { total: string }; description: string }
  ): Observable<any> {
    return this.orders$.pipe(
      take(1),
      switchMap(orders => {
        if (!orders) {
          return throwError(() => new Error('No orders available'));
        }
        return this._httpClient.post<any>(`${API_URL_GATEWAY}/enzona/payments/refund/${transactionUuid}`, paymentRefundIn).pipe(
          map((response) => {
            // Find the index of the updated order
            const index = orders.findIndex(item => item.id === orderId);

            if (index !== -1) {
              const order = { ...orders[index] };
              order.status = 'Reembolsada';

              // Update the order
              orders[index] = order;

              // Update the orders
              this._orders.next(orders);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Transfermóvil refund
   * Procesar reembolso a través de Transfermóvil
   *
   * @param orderId - ID del pedido
   * @param paymentRefundIn - Datos del reembolso
   */
  public transfermovilRefund(orderId: number, paymentRefundIn: any): Observable<any> {
    return this.orders$.pipe(
      take(1),
      switchMap(orders => {
        if (!orders) {
          return throwError(() => new Error('No orders available'));
        }
        return this._httpClient.post<any>(`${API_URL_GATEWAY}/transfermovil/send-order-refound/`, paymentRefundIn).pipe(
          map((response) => {
            // Find the index of the updated order
            const index = orders.findIndex(item => item.id === orderId);

            if (index !== -1) {
              const order = { ...orders[index] };
              order.status = 'Pendiente de Reembolso';

              // Update the order
              orders[index] = order;

              // Update the orders
              this._orders.next(orders);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }
}

