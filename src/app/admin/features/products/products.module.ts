import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { PRODUCTS_ROUTES } from './products.routes';

@NgModule({
  imports: [
    RouterModule.forChild(PRODUCTS_ROUTES)
  ]
})
export class ProductsModule { }
