import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { REPORTS_ROUTES } from './reports.routes';

@NgModule({
  imports: [
    RouterModule.forChild(REPORTS_ROUTES)
  ]
})
export class ReportsModule { }
