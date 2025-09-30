import { Routes } from '@angular/router';
import { SlidesComponent } from './slides.component';
import { SlideFormComponent } from './slide-form/slide-form.component';

export const SLIDES_ROUTES: Routes = [
  {
    path: '',
    component: SlidesComponent
  },
  {
    path: 'new',
    component: SlideFormComponent
  },
  {
    path: 'edit/:id',
    component: SlideFormComponent
  }
];
