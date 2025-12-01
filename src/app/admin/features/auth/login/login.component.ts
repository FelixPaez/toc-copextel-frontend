import { Component, OnInit } from '@angular/core';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatIconModule,
    MatSnackBarModule
  ]
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  hidePassword = true;
  isLoading = false;
  returnUrl: string = '/admin/dashboard';
  private loginSuccessful = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private authService: AuthService,
    private snackBar: MatSnackBar
  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  ngOnInit(): void {
    this.returnUrl = this.route.snapshot.queryParams['returnUrl'] || '/admin/dashboard';
    
    if (!this.isLoading && !this.loginSuccessful) {
      this.authService.check().subscribe(isAuthenticated => {
        if (isAuthenticated && !this.loginSuccessful) {
          this.router.navigateByUrl(this.returnUrl).catch(() => {
            window.location.href = this.returnUrl;
          });
        }
      });
    }
  }

  onSubmit(): void {
    if (this.loginForm.valid && !this.isLoading) {
      this.isLoading = true;
      
      const credentials = {
        email: this.loginForm.value.email,
        password: this.loginForm.value.password
      };

      this.authService.signIn(credentials).subscribe({
        next: (response) => {
          if (response && response.ok) {
            this.loginSuccessful = true;
            
            const user = response.user || this.authService.getCurrentUser();
            const userName = user?.name || user?.email || 'Usuario';
            
            this.snackBar.open(`Bienvenido, ${userName}!`, 'Cerrar', {
              duration: 2000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['success-snackbar']
            });
            
            setTimeout(() => {
              this.authService.check().subscribe({
                next: (isAuthenticated) => {
                  this.isLoading = false;
                  
                  if (isAuthenticated) {
                    window.location.href = '/admin/dashboard';
                  } else {
                    setTimeout(() => {
                      this.authService.check().subscribe(auth => {
                        if (auth) {
                          window.location.href = '/admin/dashboard';
                        } else {
                          this.snackBar.open('Error de autenticación. Intente nuevamente.', 'Cerrar', {
                            duration: 3000,
                            horizontalPosition: 'center',
                            verticalPosition: 'top',
                            panelClass: ['error-snackbar']
                          });
                        }
                      });
                    }, 300);
                  }
                },
                error: () => {
                  this.isLoading = false;
                  setTimeout(() => {
                    window.location.href = '/admin/dashboard';
                  }, 200);
                }
              });
            }, 150);
          } else {
            this.isLoading = false;
            this.snackBar.open('Error en el login. Intente nuevamente.', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top',
              panelClass: ['error-snackbar']
            });
          }
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error?.error?.message || error?.message || 'Correo electrónico o contraseña incorrecta';
          
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['error-snackbar']
          });
        }
      });
    }
  }

  onForgotPassword(): void {
    this.router.navigate(['/admin/auth/forgot-password']);
  }
}
