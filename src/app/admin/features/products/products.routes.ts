import { Routes } from '@angular/router';
import { ProductsComponent } from './products.component';
import { NewProductComponent } from './new/new-product.component';
import { ProductDetailComponent } from './product-detail/product-detail.component';
import { OnSaleComponent } from './on-sale/on-sale.component';
import { PendingChangesGuard } from './new/pending-changes.guard';
import { ProductsResolver } from '../../core/resolvers/products.resolver';

export const PRODUCTS_ROUTES: Routes = [
  {
    path: '',
    component: ProductsComponent,
    resolve: {
      data: ProductsResolver
    }
  },
  {
    path: 'new',
    component: NewProductComponent,
    canDeactivate: [PendingChangesGuard]
  },
  {
    path: 'on-sale',
    component: OnSaleComponent
  },
  {
    path: ':id',
    component: ProductDetailComponent
  }
];
