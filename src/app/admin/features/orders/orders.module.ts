import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { ORDERS_ROUTES } from './orders.routes';

@NgModule({
  imports: [
    RouterModule.forChild(ORDERS_ROUTES)
  ]
})
export class OrdersModule { }
