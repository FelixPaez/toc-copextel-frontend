import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { MESSAGES_ROUTES } from './messages.routes';

@NgModule({
  imports: [
    RouterModule.forChild(MESSAGES_ROUTES)
  ]
})
export class MessagesModule { }

