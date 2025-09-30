import { Routes } from '@angular/router';
import { VendorsComponent } from './vendors.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';

export const VENDORS_ROUTES: Routes = [
  {
    path: '',
    component: VendorsComponent
  },
  {
    path: 'new',
    component: VendorFormComponent
  },
  {
    path: 'edit/:id',
    component: VendorFormComponent
  }
];
