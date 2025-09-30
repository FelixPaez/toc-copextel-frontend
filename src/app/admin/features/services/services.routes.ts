import { Routes } from '@angular/router';
import { ServicesComponent } from './services.component';
import { ServiceFormComponent } from './service-form/service-form.component';

export const SERVICES_ROUTES: Routes = [
  {
    path: '',
    component: ServicesComponent
  },
  {
    path: 'new',
    component: ServiceFormComponent
  },
  {
    path: 'edit/:id',
    component: ServiceFormComponent
  }
];
