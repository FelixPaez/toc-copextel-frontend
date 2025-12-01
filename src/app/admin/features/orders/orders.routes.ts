import { Routes } from '@angular/router';
import { OrdersComponent } from './orders.component';
import { OrderDetailComponent } from './order-detail/order-detail.component';
import { OrderInvoiceComponent } from './order-invoice/order-invoice.component';
import { OrdersResolver } from '../../core/resolvers/orders.resolver';

export const ORDERS_ROUTES: Routes = [
  {
    path: '',
    component: OrdersComponent,
    resolve: {
      data: OrdersResolver
    }
  },
  {
    path: ':id',
    component: OrderDetailComponent
  },
  {
    path: ':id/invoice',
    component: OrderInvoiceComponent
  }
];
