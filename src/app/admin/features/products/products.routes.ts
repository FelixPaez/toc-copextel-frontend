import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { NewProductComponent } from './new/new-product.component';
import { PendingChangesGuard } from './new/pending-changes.guard';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsComponent
  },
  {
    path: 'new',
    component: NewProductComponent,
    canDeactivate: [PendingChangesGuard]
  }
];
