import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { USERS_ROUTES } from './users.routes';
import { UsersComponent } from './users.component';
import { UserFormComponent } from './user-form/user-form.component';

@NgModule({
  imports: [
    RouterModule.forChild(USERS_ROUTES),
    UsersComponent,
    UserFormComponent
  ],
  exports: [
    UsersComponent,
    UserFormComponent
  ]
})
export class UsersModule { }
