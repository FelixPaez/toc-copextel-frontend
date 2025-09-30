import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CATEGORIES_ROUTES } from './categories.routes';

@NgModule({
  imports: [
    RouterModule.forChild(CATEGORIES_ROUTES)
  ]
})
export class CategoriesModule { }
