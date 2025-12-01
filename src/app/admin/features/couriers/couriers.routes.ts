import { Routes } from '@angular/router';
import { CouriersComponent } from './couriers.component';
import { CourierDetailComponent } from './courier-detail/courier-detail.component';

export const COURIERS_ROUTES: Routes = [
  {
    path: '',
    component: CouriersComponent
  },
  {
    path: 'new',
    component: CourierDetailComponent
  },
  {
    path: ':id',
    component: CourierDetailComponent
  }
];

