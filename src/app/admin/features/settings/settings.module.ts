import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';

// Routes
import { SETTINGS_ROUTES } from './settings.routes';

@NgModule({
  imports: [
    RouterModule.forChild(SETTINGS_ROUTES)
  ]
})
export class SettingsModule { }
