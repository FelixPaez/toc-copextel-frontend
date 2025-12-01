import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatRippleModule } from '@angular/material/core';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UsersService } from '../../users/users.service';
import { User } from '../../users/users.types';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-profile-image',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatRippleModule,
    MatSnackBarModule
  ],
  templateUrl: './image.component.html',
  styleUrls: ['./image.component.scss']
})
export class ProfileImageComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isLoading = false;

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private usersService: UsersService,
    private confirmService: ConfirmService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    if (this.user?.imageUrl) {
      this.imagePreview = this.user.imageUrl;
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      const file = input.files[0];
      
      if (!file.type.startsWith('image/')) {
        this.snackBar.open('Por favor seleccione un archivo de imagen válido', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      if (file.size > 5 * 1024 * 1024) {
        this.snackBar.open('La imagen no debe exceder 5MB', 'Cerrar', {
          duration: 3000,
          panelClass: ['error-snackbar']
        });
        return;
      }

      this.selectedFile = file;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  onRemoveImage(): void {
    if (!this.user) return;

    this.confirmService.confirm({
      title: 'Eliminar Imagen',
      message: '¿Desea eliminar su imagen de perfil?',
      icon: 'delete',
      type: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        
        const updatedUser = { ...this.user, imageUrl: '' };
        
        this.usersService.updateUserProfile(updatedUser)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: (updated) => {
              this.isLoading = false;
              this.user = updated;
              this.imagePreview = null;
              this.selectedFile = null;
              
              this.snackBar.open('Imagen eliminada correctamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
            },
            error: (error) => {
              this.isLoading = false;
              const errorMessage = error?.error?.message || error?.message || 'Error al eliminar la imagen';
              this.snackBar.open(errorMessage, 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  onUploadImage(): void {
    if (!this.selectedFile || !this.user) return;

    this.isLoading = true;

    const reader = new FileReader();
    reader.onload = (e: any) => {
      const imageUrl = e.target.result;
      
      const updatedUser = { ...this.user, imageUrl };
      
      this.usersService.updateUserProfile(updatedUser)
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe({
          next: (updated) => {
            this.isLoading = false;
            this.user = updated;
            this.selectedFile = null;
            
            this.snackBar.open('Imagen actualizada correctamente', 'Cerrar', {
              duration: 3000,
              panelClass: ['success-snackbar']
            });
          },
          error: (error) => {
            this.isLoading = false;
            const errorMessage = error?.error?.message || error?.message || 'Error al actualizar la imagen';
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              panelClass: ['error-snackbar']
            });
          }
        });
    };
    reader.readAsDataURL(this.selectedFile);
  }

  getUserInitials(): string {
    if (!this.user) return '??';
    const firstInitial = this.user.name ? this.user.name.charAt(0).toUpperCase() : '';
    const lastInitial = this.user.lastname1 ? this.user.lastname1.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || '??';
  }
}

