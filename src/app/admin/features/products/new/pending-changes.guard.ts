import { Injectable } from '@angular/core';
import { CanDeactivate } from '@angular/router';
import { Observable, of } from 'rxjs';
import { NewProductComponent } from './new-product.component';
import { ConfirmService } from '../../../core/services/confirm.service';

@Injectable({ providedIn: 'root' })
export class PendingChangesGuard implements CanDeactivate<NewProductComponent> {
  constructor(private confirm: ConfirmService) {}

  canDeactivate(component: NewProductComponent): Observable<boolean> | boolean {
    if (!component.isDirty) return true;
    return this.confirm.confirm({
      title: 'Descartar cambios',
      message: 'Hay cambios sin guardar. ¿Deseas salir igualmente?',
      confirmText: 'Salir',
      cancelText: 'Continuar editando',
      icon: 'warning_amber'
    });
  }
}


