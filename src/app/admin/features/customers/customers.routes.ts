import { Routes } from '@angular/router';
import { CustomersComponent } from './customers.component';
import { CustomersResolver } from '../../core/resolvers/customers.resolver';

export const CUSTOMERS_ROUTES: Routes = [
  {
    path: '',
    component: CustomersComponent,
    resolve: {
      data: CustomersResolver
    }
  }
];
