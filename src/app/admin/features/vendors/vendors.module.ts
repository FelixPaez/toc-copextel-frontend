import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { VENDORS_ROUTES } from './vendors.routes';
import { VendorsComponent } from './vendors.component';
import { VendorFormComponent } from './vendor-form/vendor-form.component';

@NgModule({
  imports: [
    RouterModule.forChild(VENDORS_ROUTES),
    VendorsComponent,
    VendorFormComponent
  ]
})
export class VendorsModule { }
