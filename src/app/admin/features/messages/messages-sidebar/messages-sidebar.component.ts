import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { MessagesFolder } from '../messages.types';
import { MessagesService } from '../messages.service';

export const foldersData: MessagesFolder[] = [
  {
    id: 'all',
    title: 'Recibidos',
    slug: 'all',
    icon: 'inbox'
  },
  {
    id: 'sent',
    title: 'Enviados',
    slug: 'sent',
    icon: 'send'
  },
  {
    id: 'unread',
    title: 'No Leídos',
    slug: 'unread',
    icon: 'mark_email_unread'
  },
  {
    id: 'read',
    title: 'Leídos',
    slug: 'read',
    icon: 'mark_email_read'
  },
  {
    id: 'starred',
    title: 'Favoritos',
    slug: 'starred',
    icon: 'star'
  },
  {
    id: 'important',
    title: 'Importantes',
    slug: 'important',
    icon: 'label_important'
  }
];

@Component({
  selector: 'app-messages-sidebar',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule
  ],
  templateUrl: './messages-sidebar.component.html',
  styleUrls: ['./messages-sidebar.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesSidebarComponent implements OnInit, OnDestroy {
  public folders: MessagesFolder[] = foldersData;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _messagesService: MessagesService,
    private _changeDetectorRef: ChangeDetectorRef
  ) { }

  ngOnInit(): void {
    // Optionally, update counts or other dynamic data here
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  public markAllAsRead(): void {
    this._messagesService.markAllAsRead()
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          // Optionally show a snackbar message
          this._changeDetectorRef.markForCheck();
        },
        error: (err) => {
          console.error('Error marking all messages as read', err);
        }
      });
  }
}

