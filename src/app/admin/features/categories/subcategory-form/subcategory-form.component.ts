import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';
import { MatSelectModule } from '@angular/material/select';

export interface SubcategoryFormData {
  subcategory?: {
    id: number;
    name: string;
    categoryId: number;
    active: boolean;
  };
  categories: {
    id: number;
    name: string;
    active: boolean;
  }[];
}

@Component({
  selector: 'app-subcategory-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSlideToggleModule,
    MatIconModule,
    MatSelectModule
  ],
  templateUrl: './subcategory-form.component.html',
  styleUrls: ['./subcategory-form.component.scss']
})
export class SubcategoryFormComponent implements OnInit {
  subcategoryForm: FormGroup;
  isEditMode = false;
  categories: { id: number; name: string; active: boolean; }[] = [];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SubcategoryFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SubcategoryFormData
  ) {
    this.isEditMode = !!data?.subcategory;
    this.categories = data?.categories || [];
    
    this.subcategoryForm = this.fb.group({
      name: ['', [Validators.required, Validators.minLength(2)]],
      categoryId: ['', [Validators.required]],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.subcategory) {
      this.subcategoryForm.patchValue({
        name: this.data.subcategory.name,
        categoryId: this.data.subcategory.categoryId,
        active: this.data.subcategory.active
      });
    }
  }

  onSubmit(): void {
    if (this.subcategoryForm.valid) {
      this.dialogRef.close(this.subcategoryForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.subcategoryForm.controls).forEach(key => {
      const control = this.subcategoryForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar sub categoría' : 'Agregar sub categoría';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Agregar';
  }
}
