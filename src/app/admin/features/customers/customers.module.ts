import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { CUSTOMERS_ROUTES } from './customers.routes';

@NgModule({
  imports: [
    RouterModule.forChild(CUSTOMERS_ROUTES)
  ]
})
export class CustomersModule { }
