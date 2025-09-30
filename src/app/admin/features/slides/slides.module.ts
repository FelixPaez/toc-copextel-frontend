import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { SLIDES_ROUTES } from './slides.routes';

@NgModule({
  imports: [
    RouterModule.forChild(SLIDES_ROUTES)
  ]
})
export class SlidesModule { }
