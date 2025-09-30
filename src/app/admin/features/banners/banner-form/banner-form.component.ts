import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule, Router, ActivatedRoute } from '@angular/router';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatProgressBarModule } from '@angular/material/progress-bar';

export interface BannerFormData {
  title: string;
  subtitle: string;
  category: string;
  image?: File;
  isActive: boolean;
}

@Component({
  selector: 'app-banner-form',
  templateUrl: './banner-form.component.html',
  styleUrls: ['./banner-form.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatSnackBarModule,
    MatProgressBarModule
  ]
})
export class BannerFormComponent implements OnInit {
  bannerForm: FormGroup;
  isEditMode = false;
  bannerId: string | null = null;
  selectedFile: File | null = null;
  imagePreview: string | null = null;
  isUploading = false;

  // Categorías disponibles
  categories = [
    'Tecnología',
    'Electrodomésticos',
    'Energía',
    'Hogar',
    'Oficina',
    'Automotriz'
  ];

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private route: ActivatedRoute,
    private snackBar: MatSnackBar
  ) {
    this.bannerForm = this.fb.group({
      title: ['', [Validators.required, Validators.minLength(3)]],
      subtitle: ['', [Validators.maxLength(200)]],
      category: ['', [Validators.required]],
      isActive: [true]
    });
  }

  ngOnInit(): void {
    this.bannerId = this.route.snapshot.paramMap.get('id');
    this.isEditMode = !!this.bannerId;

    if (this.isEditMode) {
      this.loadBannerData();
    }
  }

  loadBannerData(): void {
    // Aquí se cargaría los datos del banner desde el servicio
    // Por ahora simulamos con datos de ejemplo
    const bannerData = {
      title: 'Computadoras',
      subtitle: 'Computadoras con componentes de ultima generacion',
      category: 'Tecnología',
      isActive: true
    };

    this.bannerForm.patchValue(bannerData);
  }

  onFileSelected(event: any): void {
    const file = event.target.files[0];
    if (file) {
      this.selectedFile = file;
      
      // Crear preview de la imagen
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagePreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
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
        this.selectedFile = file;
        
        // Crear preview de la imagen
        const reader = new FileReader();
        reader.onload = (e: any) => {
          this.imagePreview = e.target.result;
        };
        reader.readAsDataURL(file);
      } else {
        this.snackBar.open('Por favor, selecciona solo archivos de imagen', 'Cerrar', {
          duration: 3000
        });
      }
    }
  }

  removeImage(): void {
    this.selectedFile = null;
    this.imagePreview = null;
  }

  onSubmit(): void {
    if (this.bannerForm.valid) {
      this.isUploading = true;
      
      const formData = this.bannerForm.value;
      
      // Simular upload
      setTimeout(() => {
        this.isUploading = false;
        
        const message = this.isEditMode ? 'Banner actualizado correctamente' : 'Banner creado correctamente';
        this.snackBar.open(message, 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });

        this.router.navigate(['/banners']);
      }, 2000);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/banners']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.bannerForm.controls).forEach(key => {
      const control = this.bannerForm.get(key);
      control?.markAsTouched();
    });
  }

  // Getters para validación de formulario
  get titleError(): string {
    const title = this.bannerForm.get('title');
    if (title?.hasError('required')) return 'El título es requerido';
    if (title?.hasError('minlength')) return 'El título debe tener al menos 3 caracteres';
    return '';
  }

  get categoryError(): string {
    const category = this.bannerForm.get('category');
    if (category?.hasError('required')) return 'La categoría es requerida';
    return '';
  }
}
