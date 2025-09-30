import { Component } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { ConfirmService } from '../../../core/services/confirm.service';
import { NotificationService } from '../../../core/services/notification.service';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { RouterModule } from '@angular/router';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

@Component({
  selector: 'app-new-product',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatExpansionModule,
    MatSlideToggleModule
  ],
  templateUrl: './new-product.component.html',
  styleUrls: ['./new-product.component.scss']
})
export class NewProductComponent {
  isDirty = false;
  imagePreviews: string[] = [];
  isDragging = false;

  constructor(
    private router: Router,
    private route: ActivatedRoute,
    private confirm: ConfirmService,
    private notifications: NotificationService
  ) {}

  onCancel(): void {
    if (!this.isDirty) { this.router.navigate(['../'], { relativeTo: this.route }); return; }
    this.confirm.confirm({
      title: 'Descartar cambios',
      subtitle: 'Tu información no se guardará',
      message: 'Hay cambios sin guardar. ¿Deseas salir igualmente?',
      confirmText: 'Salir',
      cancelText: 'Continuar editando',
      type: 'danger',
      icon: 'warning_amber'
    }).subscribe(ok => {
      if (ok) {
        this.isDirty = false; // Evita que el guard vuelva a preguntar
        // Navegar relativo a la ruta actual (evita recalcular rutas manuales)
        this.router.navigate(['../'], { relativeTo: this.route });
      }
    });
  }

  onSave(): void {
    this.isDirty = false;
    this.notifications.success('Producto guardado correctamente');
  }

  onImagesSelected(evt: Event): void {
    const input = evt.target as HTMLInputElement;
    if (!input.files || input.files.length === 0) return;
    Array.from(input.files).forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = (e.target as FileReader).result as string;
        this.imagePreviews.push(src);
      };
      reader.readAsDataURL(file);
    });
    this.isDirty = true;
  }

  removeImage(index: number): void {
    this.imagePreviews.splice(index, 1);
    this.isDirty = true;
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = true;
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    this.isDragging = false;
    if (!event.dataTransfer) return;
    const files = Array.from(event.dataTransfer.files).filter(f => f.type.startsWith('image/'));
    if (files.length === 0) return;
    files.forEach(file => {
      const reader = new FileReader();
      reader.onload = e => {
        const src = (e.target as FileReader).result as string;
        this.imagePreviews.push(src);
      };
      reader.readAsDataURL(file);
    });
    this.isDirty = true;
  }
}


