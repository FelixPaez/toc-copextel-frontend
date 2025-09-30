import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { BANNERS_ROUTES } from './banners.routes';

@NgModule({
  imports: [
    RouterModule.forChild(BANNERS_ROUTES)
  ]
})
export class BannersModule { }
