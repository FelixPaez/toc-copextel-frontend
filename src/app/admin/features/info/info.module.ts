import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { INFO_ROUTES } from './info.routes';

@NgModule({
  imports: [
    RouterModule.forChild(INFO_ROUTES)
  ]
})
export class InfoModule { }
