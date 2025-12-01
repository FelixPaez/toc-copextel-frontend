import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil, take } from 'rxjs/operators';

import { MessagesService } from '../messages.service';
import { Message } from '../messages.types';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-messages-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatTooltipModule,
    DatePipe
  ],
  templateUrl: './messages-detail.component.html',
  styleUrls: ['./messages-detail.component.scss'],
  encapsulation: ViewEncapsulation.None,
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class MessagesDetailComponent implements OnInit, OnDestroy {
  public message: Message | null = null;
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _messagesService: MessagesService,
    private _activatedRoute: ActivatedRoute,
    private _router: Router,
    private _changeDetectorRef: ChangeDetectorRef,
    private _snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Listen to paramMap changes
    this._activatedRoute.paramMap
      .pipe(
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(params => {
        const messageId = params.get('id');
        if (messageId) {
          this.loadMessage(messageId);
        } else {
          this.message = null;
          this._changeDetectorRef.markForCheck();
        }
      });
    
    // Also try snapshot in case paramMap hasn't fired yet
    const snapshotId = this._activatedRoute.snapshot.params['id'] || 
                      this._activatedRoute.snapshot.paramMap.get('id');
    if (snapshotId) {
      this.loadMessage(snapshotId);
    }
  }

  private loadMessage(messageId: string): void {
    // First try to get from current messages list (take only first emission)
    this._messagesService.messages$
      .pipe(
        take(1),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(messages => {
        if (messages && messages.length > 0) {
          const foundMessage = messages.find(m => m.id === messageId);
              if (foundMessage) {
            this.message = foundMessage;
            this._changeDetectorRef.markForCheck();
            return;
          }
        }
        
        // If not found in list, try to get by ID from service
        this._messagesService.getMessageById(messageId)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: (message) => {
              if (message) {
                this.message = message;
                this._changeDetectorRef.markForCheck();
              } else {
                this.message = null;
                this._changeDetectorRef.markForCheck();
              }
            },
            error: (err) => {
              this.message = null;
              this._snackBar.open('Error al cargar el detalle del mensaje', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
              this._changeDetectorRef.markForCheck();
            }
          });
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  public toggleRead(): void {
    if (this.message) {
      const updatedMessage = { ...this.message, read: !this.message.read };
      this._messagesService.updateMessage(this.message.id, updatedMessage)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: () => {
            this.message = updatedMessage;
            this._snackBar.open(`Mensaje marcado como ${this.message?.read ? 'leído' : 'no leído'}`, 'Cerrar', { duration: 2000 });
            this._changeDetectorRef.markForCheck();
          },
          error: () => {
            this._snackBar.open('Error al actualizar estado de lectura', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
    }
  }

  public toggleImportant(): void {
    if (this.message) {
      const updatedMessage = { ...this.message, important: !this.message.important };
      this._messagesService.updateMessage(this.message.id, updatedMessage)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: () => {
            this.message = updatedMessage;
            this._snackBar.open(`Mensaje marcado como ${this.message?.important ? 'importante' : 'no importante'}`, 'Cerrar', { duration: 2000 });
            this._changeDetectorRef.markForCheck();
          },
          error: () => {
            this._snackBar.open('Error al actualizar estado de importancia', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
    }
  }

  public toggleStarred(): void {
    if (this.message) {
      const updatedMessage = { ...this.message, starred: !this.message.starred };
      this._messagesService.updateMessage(this.message.id, updatedMessage)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: () => {
            this.message = updatedMessage;
            this._snackBar.open(`Mensaje marcado como ${this.message?.starred ? 'favorito' : 'no favorito'}`, 'Cerrar', { duration: 2000 });
            this._changeDetectorRef.markForCheck();
          },
          error: () => {
            this._snackBar.open('Error al actualizar estado de favorito', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
    }
  }

  public goBack(): void {
    // Navigate back to list without the ID
    const parentRoute = this._activatedRoute.parent;
    if (parentRoute) {
      const filter = parentRoute.snapshot.params['filter'] || 'all';
      const page = parentRoute.snapshot.params['page'] || 0;
      this._router.navigate(['/messages', filter, page]);
    } else {
      this._router.navigate(['/messages/all/0']);
    }
  }
}

