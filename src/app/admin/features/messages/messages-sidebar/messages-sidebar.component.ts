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
import { MOCK_MESSAGES } from '../../../mocks/data/messages.mock';
import { MockService } from '../../../core/services/mock.service';

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
    private _changeDetectorRef: ChangeDetectorRef,
    private _mockService: MockService
  ) { }

  ngOnInit(): void {
    // Load all messages without pagination to get accurate counts initially
    this._loadAllMessagesForCounts();
    
    // Subscribe to individual message changes to update counts immediately
    this._messagesService.message$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // When a message is updated (read, starred, important, etc), reload all messages to update counts
        this._loadAllMessagesForCounts();
      });
    
    // Also subscribe to messages list changes
    this._messagesService.messages$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        // When messages list changes, reload all messages to get accurate counts
        this._loadAllMessagesForCounts();
      });
  }

  private _loadAllMessagesForCounts(): void {
    // In mock mode, use MOCK_MESSAGES directly to avoid affecting pagination
    if (this._mockService.isMockMode) {
      // Use MOCK_MESSAGES directly without calling the service
      // This prevents affecting the current pagination state
      this._updateCountsFromMessages([...MOCK_MESSAGES]);
      return;
    }
    
    // For real API, get all messages without pagination to count them correctly
    // Note: This will update pagination, but it's necessary for accurate counts
    this._messagesService.getAllMessages(0, 1000, 'createdAt', 'desc', 'all', '')
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (response) => {
          const allMessages = response.contactMessages || [];
          this._updateCountsFromMessages(allMessages);
        },
        error: () => {
          // Silently fail - counts will update on next successful load
        }
      });
  }

  private _updateCountsFromMessages(allMessages: any[]): void {
    // Update folder counts with all messages
    this.folders = this.folders.map(folder => {
      let count = 0;
      switch (folder.slug) {
        case 'unread':
          count = allMessages.filter(m => !m.read).length;
          break;
        case 'read':
          count = allMessages.filter(m => m.read).length;
          break;
        case 'starred':
          count = allMessages.filter(m => m.starred).length;
          break;
        case 'important':
          count = allMessages.filter(m => m.important).length;
          break;
        case 'sent':
          count = allMessages.filter(m => m.sent).length;
          break;
        default:
          count = allMessages.length;
      }
      return { ...folder, count: count > 0 ? count : 0 };
    });
    this._changeDetectorRef.markForCheck();
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
          this._changeDetectorRef.markForCheck();
        },
        error: () => {
          this._changeDetectorRef.markForCheck();
        }
      });
  }
}

