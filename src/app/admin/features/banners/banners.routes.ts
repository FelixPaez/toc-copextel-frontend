import { Routes } from '@angular/router';
import { BannersComponent } from './banners.component';
import { BannerFormComponent } from './banner-form/banner-form.component';

export const BANNERS_ROUTES: Routes = [
  {
    path: '',
    component: BannersComponent
  },
  {
    path: 'new',
    component: BannerFormComponent
  },
  {
    path: 'edit/:id',
    component: BannerFormComponent
  }
];
