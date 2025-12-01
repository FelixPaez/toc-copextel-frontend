import { Component, Input, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UsersService } from '../../users/users.service';
import { User } from '../../users/users.types';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-profile-account',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './account.component.html',
  styleUrls: ['./account.component.scss']
})
export class ProfileAccountComponent implements OnInit, OnDestroy {
  @Input() user: User | null = null;

  profileForm: FormGroup;
  titles: string[] = [];
  isLoading = false;

  genders = [
    { value: 'femenino', label: 'Femenino' },
    { value: 'masculino', label: 'Masculino' }
  ];

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private confirmService: ConfirmService,
    private snackBar: MatSnackBar
  ) {
    this.profileForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      lastname1: ['', Validators.required],
      lastname2: [''],
      email: ['', [Validators.required, Validators.email]],
      gender: [''],
      idNumber: ['']
    });
  }

  ngOnInit(): void {
    if (this.user) {
      this.profileForm.patchValue(this.user);
    }

    this.usersService.titles$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(titles => {
        this.titles = titles || [];
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onUpdate(): void {
    if (this.profileForm.invalid) {
      return;
    }

    this.confirmService.confirm({
      title: 'Actualizar Perfil',
      message: '¿Está seguro que todos los datos son correctos?',
      icon: 'help_outline',
      type: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.profileForm.disable();

        const userData = this.profileForm.getRawValue();

        this.usersService.updateUserProfile(userData).subscribe({
          next: (updatedUser) => {
            this.isLoading = false;
            this.profileForm.enable();
            
            this.snackBar.open(
              `Perfil de ${updatedUser.name} ${updatedUser.lastname1} actualizado correctamente`,
              'Cerrar',
              {
                duration: 3000,
                horizontalPosition: 'center',
                verticalPosition: 'top',
                panelClass: ['success-snackbar']
              }
            );
          },
          error: (error) => {
            this.isLoading = false;
            this.profileForm.enable();
            
            const errorMessage = error?.error?.message || error?.message || 'Error al actualizar el perfil';
            this.snackBar.open(errorMessage, 'Cerrar', {
              duration: 5000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        });
      }
    });
  }
}

