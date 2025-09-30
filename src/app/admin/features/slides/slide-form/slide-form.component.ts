import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatIconModule } from '@angular/material/icon';

export interface SlideFormData {
  slide?: {
    id: number;
    title: string;
    subtitle: string;
    imageUrl?: string;
    active: boolean;
  };
}

@Component({
  selector: 'app-slide-form',
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
  templateUrl: './slide-form.component.html',
  styleUrls: ['./slide-form.component.scss']
})
export class SlideFormComponent implements OnInit {
  slideForm: FormGroup;
  isEditMode = false;
  isUploading = false;

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SlideFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SlideFormData
  ) {
    this.isEditMode = !!data?.slide;
    this.slideForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(2)]],
      subtitle: ['', [Validators.required, Validators.minLength(2)]],
      imageUrl: [''],
      active: [true]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.slide) {
      this.slideForm.patchValue({
        title: this.data.slide.title,
        subtitle: this.data.slide.subtitle,
        imageUrl: this.data.slide.imageUrl,
        active: this.data.slide.active
      });
    }
  }

  onSubmit(): void {
    if (this.slideForm.valid) {
      this.dialogRef.close(this.slideForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  onImageUpload(event: any): void {
    const file = event.target.files[0];
    if (file && file.type.startsWith('image/')) {
      // Crear URL temporal para mostrar la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.slideForm.patchValue({ imageUrl: e.target.result });
      };
      reader.readAsDataURL(file);
    }
  }

  onImageDelete(): void {
    this.slideForm.patchValue({ imageUrl: '' });
  }

  onDragOver(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDragLeave(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();
  }

  onDrop(event: DragEvent): void {
    event.preventDefault();
    event.stopPropagation();

    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        // Crear URL temporal para mostrar la imagen
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.slideForm.patchValue({ imageUrl: e.target.result });
        };
        reader.readAsDataURL(file);
      }
    }
  }

  private markFormGroupTouched(): void {
    Object.keys(this.slideForm.controls).forEach(key => {
      const control = this.slideForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar diapositiva' : 'Agregar diapositiva';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Agregar';
  }
}
