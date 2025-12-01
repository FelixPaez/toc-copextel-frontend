import { Injectable } from '@angular/core';
import { MatDialog } from '@angular/material/dialog';
import { Observable } from 'rxjs';
import { map } from 'rxjs/operators';
import { ConfirmDialogComponent, ConfirmDialogData } from '../ui/confirm-dialog/confirm-dialog.component';
import { Icons } from '../constants/icons.constants';

@Injectable({ providedIn: 'root' })
export class ConfirmService {
  constructor(private dialog: MatDialog) {}

  confirm(data: Partial<ConfirmDialogData>): Observable<boolean> {
    const dialogRef = this.dialog.open(ConfirmDialogComponent, {
      width: '520px',
      maxWidth: '94vw',
      maxHeight: '72vh',
      autoFocus: false,
      restoreFocus: true,
      panelClass: 'admin-dialog',
      enterAnimationDuration: '140ms',
      exitAnimationDuration: '100ms',
      data: {
        title: 'Confirmación',
        subtitle: '',
        message: '¿Seguro que deseas continuar?',
        confirmText: 'Confirmar',
        cancelText: 'Cancelar',
        icon: Icons.INFO.HELP_OUTLINE,
        type: 'primary',
        ...data
      } as ConfirmDialogData
    });

    return dialogRef.afterClosed().pipe(map(result => !!result));
  }
}


