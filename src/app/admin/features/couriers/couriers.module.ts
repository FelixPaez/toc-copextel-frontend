import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { COURIERS_ROUTES } from './couriers.routes';

@NgModule({
  imports: [
    RouterModule.forChild(COURIERS_ROUTES)
  ]
})
export class CouriersModule { }

