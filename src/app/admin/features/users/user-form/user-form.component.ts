import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatCardModule } from '@angular/material/card';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatRadioModule } from '@angular/material/radio';
import { ActivatedRoute, Router } from '@angular/router';

@Component({
  selector: 'app-user-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule,
    MatExpansionModule,
    MatCheckboxModule,
    MatRadioModule
  ],
  templateUrl: './user-form.component.html',
  styleUrls: ['./user-form.component.scss']
})
export class UserFormComponent implements OnInit {
  userForm: FormGroup;
  isEditMode = false;
  hidePassword = true;
  hideConfirmPassword = true;

  // Stores available
  stores = [
    'Mundo Electrónico',
    'Tecnostar Informática y Comunicaciones',
    'Tienda Online de Copextel',
    'TOC - Plaza',
    'Guantánamo'
  ];

  // Roles available
  roles = [
    'Corporativo',
    'Vendedor',
    'Administrador Del Sistema'
  ];

  // Gender options
  genders = [
    'Femenino',
    'Masculino'
  ];

  // Expansion panel states
  generalInfoExpanded = true;
  passwordExpanded = false;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.isEditMode = this.route.snapshot.url.some(segment => segment.path === 'edit');
    this.initializeForm();
  }

  ngOnInit(): void {
    if (this.isEditMode) {
      const userId = this.route.snapshot.paramMap.get('id');
      if (userId) {
        // Aquí cargarías los datos del usuario desde el servicio
        // Por ahora usamos datos de ejemplo
        const userData = {
          name: 'Usuario de Ejemplo',
          lastName: 'Apellido',
          secondLastName: 'Segundo',
          email: 'ejemplo@copextel.com.cu',
          identityNumber: '99121212123',
          store: 'Mundo Electrónico',
          roles: ['Vendedor'],
          gender: 'Masculino',
          active: true,
          password: '',
          confirmPassword: ''
        };

        this.userForm.patchValue(userData);
      }
    }
  }

  private initializeForm(): void {
    this.userForm = this.fb.group({
      // Información General
      name: ['', [Validators.required, Validators.minLength(2)]],
      lastName: ['', [Validators.required, Validators.minLength(2)]],
      secondLastName: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      identityNumber: ['', [Validators.required, Validators.pattern(/^\d{11}$/)]],
      store: ['', [Validators.required]],
      roles: [[], [Validators.required]],
      gender: ['', [Validators.required]],
      active: [true],

      // Contraseña (solo para nuevo usuario)
      password: ['', this.isEditMode ? [] : [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', this.isEditMode ? [] : [Validators.required]]
    }, { validators: this.passwordMatchValidator.bind(this) });
  }

  private passwordMatchValidator(form: FormGroup) {
    if (!this.isEditMode) {
      const password = form.get('password');
      const confirmPassword = form.get('confirmPassword');
      
      if (password && confirmPassword && password.value !== confirmPassword.value) {
        confirmPassword.setErrors({ passwordMismatch: true });
        return { passwordMismatch: true };
      }
    }
    
    return null;
  }

  onSubmit(): void {
    if (this.userForm.valid) {
      // Aquí enviarías los datos al servicio
      console.log('User data:', this.userForm.value);
      
      this.snackBar.open(
        this.isEditMode ? 'Usuario actualizado exitosamente!' : 'Usuario creado exitosamente!', 
        'Cerrar', 
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      
      // Navegar de vuelta al listado
      this.router.navigate(['/users']);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/users']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.userForm.controls).forEach(key => {
      const control = this.userForm.get(key);
      if (control instanceof FormGroup) {
        Object.keys(control.controls).forEach(subKey => {
          control.get(subKey)?.markAsTouched();
        });
      } else {
        control?.markAsTouched();
      }
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar Usuario' : 'Nuevo Usuario';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Guardar';
  }

  onRoleChange(role: string, isChecked: boolean): void {
    const currentRoles = this.userForm.get('roles')?.value || [];
    if (isChecked) {
      this.userForm.patchValue({
        roles: [...currentRoles, role]
      });
    } else {
      this.userForm.patchValue({
        roles: currentRoles.filter((r: string) => r !== role)
      });
    }
  }

  isRoleSelected(role: string): boolean {
    const currentRoles = this.userForm.get('roles')?.value || [];
    return currentRoles.includes(role);
  }

  togglePasswordVisibility(): void {
    this.hidePassword = !this.hidePassword;
  }

  toggleConfirmPasswordVisibility(): void {
    this.hideConfirmPassword = !this.hideConfirmPassword;
  }
}
