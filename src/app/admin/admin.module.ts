import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

// Shared Module
import { SharedModule } from '../shared/shared.module';

// Layout Module
import { LayoutModule } from './layout/layout.module';

// Admin Routes
import { ADMIN_ROUTES } from './admin.routes';

@NgModule({
  declarations: [],
  imports: [
    CommonModule,
    SharedModule,
    LayoutModule,
    RouterModule.forChild(ADMIN_ROUTES)
  ],
  exports: []
})
export class AdminModule { }
