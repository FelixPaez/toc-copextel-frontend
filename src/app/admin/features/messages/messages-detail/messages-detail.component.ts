import { ChangeDetectionStrategy, ChangeDetectorRef, Component, OnDestroy, OnInit, ViewEncapsulation } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

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
    // Get message id from route
    this._activatedRoute.paramMap
      .pipe(
        takeUntil(this._unsubscribeAll),
        // switchMap(params => this._messagesService.getMessageById(params.get('id') as string))
      )
      .subscribe(params => {
        const messageId = params.get('id');
        if (messageId) {
          this._messagesService.getMessageById(messageId)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: (message) => {
                this.message = message;
                this._changeDetectorRef.markForCheck();
              },
              error: (err) => {
                console.error('Error loading message detail:', err);
                this._snackBar.open('Error al cargar el detalle del mensaje', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
                this._router.navigate(['../'], { relativeTo: this._activatedRoute });
              }
            });
        }
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
          error: (err) => {
            console.error('Error toggling read status:', err);
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
          error: (err) => {
            console.error('Error toggling important status:', err);
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
          error: (err) => {
            console.error('Error toggling starred status:', err);
            this._snackBar.open('Error al actualizar estado de favorito', 'Cerrar', { duration: 3000, panelClass: ['error-snackbar'] });
          }
        });
    }
  }

  public goBack(): void {
    this._router.navigate(['../'], { relativeTo: this._activatedRoute });
  }
}

