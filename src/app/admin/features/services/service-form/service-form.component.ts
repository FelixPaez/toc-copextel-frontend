import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

export interface ServiceFormData {
  service?: {
    id: number;
    name: string;
    specifications: string;
    priceCUP: number;
    priceMLC: number;
    active: boolean;
  };
}

@Component({
  selector: 'app-service-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule
  ],
  templateUrl: './service-form.component.html',
  styleUrls: ['./service-form.component.scss']
})
export class ServiceFormComponent implements OnInit {
  serviceForm: FormGroup;
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<ServiceFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceFormData
  ) {
    this.isEditMode = !!data?.service;
    this.serviceForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      specifications: ['', [Validators.required, Validators.minLength(10)]],
      priceCUP: [0, [Validators.required, Validators.min(0)]],
      priceMLC: [0, [Validators.required, Validators.min(0)]],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.service) {
      this.serviceForm.patchValue({
        name: this.data.service.name,
        specifications: this.data.service.specifications,
        priceCUP: this.data.service.priceCUP,
        priceMLC: this.data.service.priceMLC,
        active: this.data.service.active
      });
    }
  }

  onSubmit(): void {
    if (this.serviceForm.valid) {
      this.dialogRef.close(this.serviceForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.serviceForm.controls).forEach(key => {
      const control = this.serviceForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar servicio' : 'Agregar servicio';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Agregar';
  }
}
