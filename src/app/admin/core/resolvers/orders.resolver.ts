import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { OrdersService } from '../../features/orders/orders.service';
import { Order } from '../../features/orders/orders.types';

export interface OrdersResolverData {
  orders: Order[];
  pagination: any;
}

/**
 * Orders Resolver
 * Precarga órdenes antes de navegar a la ruta
 */
@Injectable({ providedIn: 'root' })
export class OrdersResolver implements Resolve<OrdersResolverData> {
  constructor(private ordersService: OrdersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<OrdersResolverData> {
    return this.ordersService.getOrders(0, 10, 'createdAt', 'desc', '').pipe(
      map(response => ({
        orders: response?.orders || [],
        pagination: response?.pagination || null
      })),
      catchError(() => of({ orders: [], pagination: null }))
    );
  }
}

