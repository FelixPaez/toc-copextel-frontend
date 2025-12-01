import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, pluck, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Order, OrderUpdateStatus } from './orders.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_ORDERS } from '../../mocks/data/orders.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

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
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) {
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_ORDERS,
        page,
        size,
        sort || 'orderNo',
        order,
        search,
        ['orderNo', 'beneficiaryName', 'beneficiaryLastname1', 'status'] as (keyof Order)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        orders: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
          if (response.orders) {
            this._orders.next(response.orders);
          }
        })
      );
    }
    
    // Real API call
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
      }),
      catchError((error) => {
        console.error('Error getting orders:', error);
        return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      // Filter orders by vendorId
      let filteredOrders = MOCK_ORDERS.filter(o => o.vendorId === vendorId);
      
      const result = applyMockPagination(
        filteredOrders,
        page,
        size,
        sort || 'orderNo',
        order,
        search,
        ['orderNo', 'beneficiaryName', 'beneficiaryLastname1', 'status'] as (keyof Order)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        orders: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
          if (response.orders) {
            this._orders.next(response.orders);
          }
        })
      );
    }

    // Real API call
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
      }),
      catchError((error) => {
        console.error('Error getting orders by vendor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get order by id
   *
   * @param orderId - ID del pedido
   */
  public getOrderById(orderId: number): Observable<Order> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const order = MOCK_ORDERS.find(o => o.id === orderId);
      if (!order) {
        return this._mockService.simulateError('Pedido no encontrado', 404);
      }
      return this._mockService.simulateDelay(order).pipe(
        tap((order) => {
          this._order.next(order);
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/orders/${orderId}`).pipe(
      map((response) => {
        if (response.order) {
          this._order.next(response.order);
          return response.order;
        }
        throw new Error('Order not found');
      }),
      catchError((error) => {
        console.error('Error getting order by id:', error);
        return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_ORDERS.findIndex(o => o.id === order.id);
      if (index === -1) {
        return this._mockService.simulateError('Pedido no encontrado', 404);
      }
      
      const updatedOrder = { ...MOCK_ORDERS[index], ...order };
      MOCK_ORDERS[index] = updatedOrder;
      
      return this.orders$.pipe(
        take(1),
        switchMap(orders => {
          if (!orders) {
            return throwError(() => new Error('No orders available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Pedido actualizado exitosamente',
            order: updatedOrder
          }).pipe(
            tap(() => {
              const orderIndex = orders.findIndex(item => item.id === order.id);
              if (orderIndex !== -1) {
                orders[orderIndex] = updatedOrder;
                this._orders.next(orders);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error updating order:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_ORDERS.findIndex(o => o.id === data.orderId);
      if (index === -1) {
        return this._mockService.simulateError('Pedido no encontrado', 404);
      }
      
      const order = MOCK_ORDERS[index];
      const updatedOrder: Order = {
        ...order,
        status: data.status,
        ready: data.ready ?? order.ready,
        shipped: data.shipped ?? order.shipped,
        delivered: data.delivered ?? order.delivered,
        canceled: data.canceled ?? order.canceled,
        cancelObs: data.cancelObs ?? order.cancelObs,
        readyAt: data.ready ? new Date() : order.readyAt,
        shippedAt: data.shipped ? new Date() : order.shippedAt,
        deliveredAt: data.delivered ? new Date() : order.deliveredAt,
        canceledAt: data.canceled ? new Date() : order.canceledAt,
        changeStateAt: new Date()
      };
      MOCK_ORDERS[index] = updatedOrder;
      
      return this.orders$.pipe(
        take(1),
        switchMap(orders => {
          if (!orders) {
            return throwError(() => new Error('No orders available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Estado del pedido actualizado exitosamente',
            updatedOrder: updatedOrder
          }).pipe(
            tap(() => {
              const orderIndex = orders.findIndex(item => item.id === data.orderId);
              if (orderIndex !== -1) {
                orders[orderIndex] = updatedOrder;
                this._orders.next(orders);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error updating order status:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_ORDERS.findIndex(o => o.id === orderId);
      if (index === -1) {
        return this._mockService.simulateError('Pedido no encontrado', 404);
      }
      
      const order = MOCK_ORDERS[index];
      const updatedOrder: Order = {
        ...order,
        status: 'Reembolsada',
        canceled: true,
        canceledAt: new Date()
      };
      MOCK_ORDERS[index] = updatedOrder;
      
      return this.orders$.pipe(
        take(1),
        switchMap(orders => {
          if (!orders) {
            return throwError(() => new Error('No orders available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Reembolso procesado exitosamente',
            transactionUuid: transactionUuid
          }).pipe(
            tap(() => {
              const orderIndex = orders.findIndex(item => item.id === orderId);
              if (orderIndex !== -1) {
                orders[orderIndex] = updatedOrder;
                this._orders.next(orders);
              }
            })
          );
        })
      );
    }

    // Real API call
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_ORDERS.findIndex(o => o.id === orderId);
      if (index === -1) {
        return this._mockService.simulateError('Pedido no encontrado', 404);
      }
      
      const order = MOCK_ORDERS[index];
      const updatedOrder: Order = {
        ...order,
        status: 'Pendiente de Reembolso'
      };
      MOCK_ORDERS[index] = updatedOrder;
      
      return this.orders$.pipe(
        take(1),
        switchMap(orders => {
          if (!orders) {
            return throwError(() => new Error('No orders available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Reembolso de Transfermóvil procesado exitosamente'
          }).pipe(
            tap(() => {
              const orderIndex = orders.findIndex(item => item.id === orderId);
              if (orderIndex !== -1) {
                orders[orderIndex] = updatedOrder;
                this._orders.next(orders);
              }
            })
          );
        })
      );
    }

    // Real API call
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

