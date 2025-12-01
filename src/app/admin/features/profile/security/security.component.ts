import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, FormBuilder, FormGroup, ValidationErrors, ValidatorFn, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { UsersService } from '../../users/users.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-profile-security',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './security.component.html',
  styleUrls: ['./security.component.scss']
})
export class ProfileSecurityComponent implements OnInit, OnDestroy {
  securityForm: FormGroup;
  hideOldPassword = true;
  hideNewPassword = true;
  hideConfirmPassword = true;
  isLoading = false;

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private usersService: UsersService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const passwordPattern = /((?=.*\d)|(?=.*\W+))(?![.\n])(?=.*[A-Z])(?=.*[a-z]).*$/;
    
    this.securityForm = this.fb.group({
      oldPassword: ['', [Validators.required, Validators.pattern(passwordPattern)]],
      newPassword: ['', [Validators.required, Validators.pattern(passwordPattern)]],
      confirmPassword: ['', [Validators.required, Validators.pattern(passwordPattern)]]
    }, {
      validators: this.mustMatch('newPassword', 'confirmPassword')
    });
  }

  ngOnInit(): void {}

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  mustMatch(controlPath: string, matchingControlPath: string): ValidatorFn {
    return (formGroup: AbstractControl): ValidationErrors | null => {
      const control = formGroup.get(controlPath);
      const matchingControl = formGroup.get(matchingControlPath);

      if (!control || !matchingControl) {
        return null;
      }

      if (matchingControl.hasError('mustMatch')) {
        delete matchingControl.errors!['mustMatch'];
        matchingControl.updateValueAndValidity();
      }

      if (this._isEmptyInputValue(matchingControl.value) || control.value === matchingControl.value) {
        return null;
      }

      const errors = { mustMatch: 'Las contraseñas no coinciden' };
      matchingControl.setErrors(errors);
      return errors;
    };
  }

  private _isEmptyInputValue(value: any): boolean {
    return value == null || value.length === 0;
  }

  onUpdatePassword(): void {
    if (this.securityForm.invalid) {
      return;
    }

    this.confirmService.confirm({
      title: 'Actualizar Contraseña',
      message: '¿Está seguro que desea actualizar la contraseña? Deberá iniciar sesión nuevamente con la contraseña nueva.',
      icon: 'lock',
      type: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isLoading = true;
        this.securityForm.disable();

        const passwords = {
          oldPassword: this.securityForm.get('oldPassword')?.value,
          newPassword: this.securityForm.get('newPassword')?.value
        };

        this.usersService.resetPassword(passwords)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: (response) => {
              this.isLoading = false;
              this.securityForm.enable();
              
              this.snackBar.open(
                response.message || 'Contraseña actualizada exitosamente',
                'Cerrar',
                {
                  duration: 3000,
                  horizontalPosition: 'center',
                  verticalPosition: 'top',
                  panelClass: ['success-snackbar']
                }
              );

              setTimeout(() => {
                this.authService.signOut().subscribe(() => {
                  this.router.navigate(['/admin/auth/login']);
                });
              }, 2000);
            },
            error: (error) => {
              this.isLoading = false;
              this.securityForm.enable();
              
              const errorMessage = error?.error?.message || error?.message || 'Error al actualizar la contraseña';
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

