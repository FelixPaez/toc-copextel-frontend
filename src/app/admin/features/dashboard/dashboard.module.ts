import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { DASHBOARD_ROUTES } from './dashboard.routes';

@NgModule({
  imports: [
    RouterModule.forChild(DASHBOARD_ROUTES)
  ]
})
export class DashboardModule { }
