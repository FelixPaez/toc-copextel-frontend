import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule, RouterOutlet } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatProgressBarModule } from '@angular/material/progress-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil, tap } from 'rxjs/operators';

import { MessagesComponent } from '../messages.component';
import { MessagesService } from '../messages.service';
import { Message } from '../messages.types';
import { TablePagination } from '../../../core/models/shared.types';
import { MatSnackBar } from '@angular/material/snack-bar';
import { foldersData } from '../messages-sidebar/messages-sidebar.component';

@Component({
  selector: 'app-messages-list',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    ReactiveFormsModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    MatProgressBarModule
  ],
  providers: [DatePipe],
  templateUrl: './messages-list.component.html',
  styleUrls: ['./messages-list.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesListComponent implements OnInit, OnDestroy {
  public messages: Message[] = [];
  public pagination: TablePagination | null = null;
  public isLoading = false;
  public selectedMessage: Message | null = null;
  public currentFilter: string = 'all';
  public category: string = 'all';
  public currentFilterTitle: string = 'Recibidos';

  public searchControl: FormControl = new FormControl('');

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    public messagesComponent: MessagesComponent,
    private _messagesService: MessagesService,
    private _changeDetectorRef: ChangeDetectorRef,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Subscribe to messages changes
    this._messagesService.messages$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(messages => {
        this.messages = messages || [];
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to pagination changes
    this._messagesService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(pagination => {
        this.pagination = pagination;
        this._changeDetectorRef.markForCheck();
      });

    // Subscribe to selected message changes
    this._messagesService.message$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(message => {
        this.selectedMessage = message;
        this._changeDetectorRef.markForCheck();
      });

    // Listen to route changes for filter and page
    this._activatedRoute.paramMap
      .pipe(
        takeUntil(this._unsubscribeAll),
        tap(params => {
          const filter = params.get('filter') || 'all';
          const pageParam = params.get('page');
          const page = pageParam && !isNaN(parseInt(pageParam, 10)) ? parseInt(pageParam, 10) : 0;

          this.currentFilter = filter;
          this.category = filter;
          this.currentFilterTitle = foldersData.find(f => f.slug === filter)?.title || 'Recibidos';

          // Use page size 4 to match visual display
          const pageSize = 4;
          this.loadMessages(page, pageSize, this.currentFilter, this.searchControl.value || '');
        })
      ).subscribe();

    // Subscribe to search input changes
    this.searchControl.valueChanges
      .pipe(
        takeUntil(this._unsubscribeAll),
        debounceTime(300),
        distinctUntilChanged(),
        tap(() => {
          const pageSize = this.pagination?.size || 4;
          this.loadMessages(0, pageSize, this.currentFilter, this.searchControl.value || '');
        })
      )
      .subscribe();
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  public loadMessages(pageIndex: number, pageSize: number, filter: string, search: string): void {
    this.isLoading = true;
    this._changeDetectorRef.markForCheck();
    
    this._messagesService.getAllMessages(pageIndex, pageSize, 'createdAt', 'desc', filter, search)
      .subscribe({
        next: (response) => {
          this.isLoading = false;
          this._changeDetectorRef.markForCheck();
        },
        error: (error) => {
          this.isLoading = false;
          this._snackBar.open(error?.error?.message || 'Error al cargar mensajes', 'Cerrar', { duration: 5000, panelClass: ['error-snackbar'] });
          this._changeDetectorRef.markForCheck();
        }
      });
  }

  public onPageChange(event: { pageIndex: number; pageSize: number; length: number }): void {
    // Use absolute path to avoid route duplication
    this._router.navigate(['/messages', this.currentFilter, event.pageIndex.toString()]);
  }

  public onMessageSelected(message: Message): void {
    // Get current route params to avoid duplication
    const currentParams = this._activatedRoute.snapshot.params;
    const currentId = currentParams['id'];
    
    // If clicking the same message, don't navigate
    if (currentId === message.id) {
      return;
    }

    if (!message.read) {
      this._messagesService.updateMessage(message.id, { ...message, read: true })
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: () => {
            // Navigate to message detail - use absolute path to avoid duplication
            const filter = this.currentFilter;
            const page = this.pagination?.page || 0;
            this._router.navigate(['/messages', filter, page, message.id]);
          },
          error: () => {
            this._snackBar.open('Error al marcar mensaje como leído', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
    } else {
      // Navigate to message detail - use absolute path to avoid duplication
      const filter = this.currentFilter;
      const page = this.pagination?.page || 0;
      this._router.navigate(['/messages', filter, page, message.id]);
    }
  }

  public trackByFn(index: number, item: Message): string {
    return item.id;
  }
}

