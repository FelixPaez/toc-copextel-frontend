import { Routes } from '@angular/router';
import { CategoriesComponent } from './categories.component';
import { CategoriesResolver } from '../../core/resolvers/categories.resolver';

export const CATEGORIES_ROUTES: Routes = [
  {
    path: '',
    component: CategoriesComponent,
    resolve: {
      categories: CategoriesResolver
    }
  }
];
