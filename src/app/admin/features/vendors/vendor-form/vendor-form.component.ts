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
import { ActivatedRoute, Router } from '@angular/router';

export interface VendorFormData {
  vendor?: {
    id: number;
    name: string;
    email: string;
    phone: string;
    telegramChannel: string;
    whatsappGroup: string;
    address: string;
    province: string;
    municipality: string;
    description: string;
    imageUrl?: string;
    logoUrl?: string;
    enzonaCredentials?: {
      currency: string;
      account: string;
      merchantUuid: string;
      consumerKey: string;
      consumerSecret: string;
    };
    transfermovilCredentials?: {
      currency: string;
      account: string;
      userName: string;
      source: string;
    };
    active: boolean;
  };
}

@Component({
  selector: 'app-vendor-form',
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
    MatExpansionModule
  ],
  templateUrl: './vendor-form.component.html',
  styleUrls: ['./vendor-form.component.scss']
})
export class VendorFormComponent implements OnInit {
  vendorForm: FormGroup;
  isEditMode = false;
  isUploading = false;

  // Provincias y municipios de Cuba
  provinces = [
    'La Habana', 'Santiago de Cuba', 'Camagüey', 'Holguín', 'Villa Clara',
    'Granma', 'Pinar del Río', 'Matanzas', 'Guantánamo', 'Las Tunas',
    'Ciego de Ávila', 'Sancti Spíritus', 'Cienfuegos', 'Mayabeque', 'Artemisa'
  ];

  municipalities: { [key: string]: string[] } = {
    'La Habana': ['Plaza de la Revolución', 'Centro Habana', 'La Habana Vieja', 'Regla', 'San Miguel del Padrón'],
    'Santiago de Cuba': ['Santiago de Cuba', 'Contramaestre', 'Mella', 'Palma Soriano', 'San Luis'],
    'Camagüey': ['Camagüey', 'Florida', 'Guáimaro', 'Minas', 'Nuevitas'],
    'Guantánamo': ['Guantánamo', 'Baracoa', 'El Salvador', 'Imías', 'Maisí']
  };

  selectedProvince = '';
  availableMunicipalities: string[] = [];

  // Expansion panel states
  generalInfoExpanded = true;
  descriptionExpanded = false;
  enzonaExpanded = false;
  transfermovilExpanded = false;

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
      const vendorId = this.route.snapshot.paramMap.get('id');
      if (vendorId) {
        // Aquí cargarías los datos del vendedor desde el servicio
        // Por ahora usamos datos de ejemplo
        const vendorData = {
          name: 'Vendedor de Ejemplo',
          email: 'ejemplo@copextel.com.cu',
          phone: '+53 7 1234567',
          telegramChannel: 'https://t.me/EjemploCopextel',
          whatsappGroup: 'https://chat.whatsapp.com/Ejemplo123',
          address: 'Calle Ejemplo #123',
          province: 'La Habana',
          municipality: 'Plaza de la Revolución',
          description: 'Descripción del vendedor de ejemplo',
          active: true
        };

        this.vendorForm.patchValue(vendorData);

        if (vendorData.province) {
          this.onProvinceChange(vendorData.province);
        }
      }
    }
  }

  private initializeForm(): void {
    this.vendorForm = this.fb.group({
      // Información General
      name: ['', [Validators.required, Validators.minLength(2)]],
      email: ['', [Validators.required, Validators.email]],
      phone: ['', [Validators.required, Validators.pattern(/^\+?[\d\s\-\(\)]+$/)]],
      telegramChannel: ['', [Validators.required, Validators.pattern(/^https:\/\/t\.me\/.+/)]],
      whatsappGroup: ['', [Validators.required, Validators.pattern(/^https:\/\/chat\.whatsapp\.com\/.+/)]],
      address: ['', [Validators.required]],
      province: [''],
      municipality: [''],
      active: [true],

      // Descripción e imágenes
      description: ['', [Validators.required, Validators.minLength(10)]],
      imageUrl: [''],
      logoUrl: [''],

      // Credenciales Enzona
      enzonaCredentials: this.fb.group({
        currency: ['CUP'],
        account: [''],
        merchantUuid: [''],
        consumerKey: [''],
        consumerSecret: ['']
      }),

      // Credenciales Transfermovil
      transfermovilCredentials: this.fb.group({
        currency: ['CUP'],
        account: [''],
        userName: [''],
        source: ['0']
      })
    });
  }

  onProvinceChange(province: string): void {
    this.selectedProvince = province;
    this.availableMunicipalities = this.municipalities[province] || [];
    this.vendorForm.get('municipality')?.setValue('');
  }

  onImageUpload(event: any, type: 'image' | 'logo'): void {
    const file = event.target.files[0];
    if (file) {
      this.isUploading = true;
      const reader = new FileReader();
      reader.onload = (e: any) => {
        const imageUrl = e.target.result;
        if (type === 'image') {
          this.vendorForm.patchValue({ imageUrl });
        } else {
          this.vendorForm.patchValue({ logoUrl: imageUrl });
        }
        this.isUploading = false;
      };
      reader.readAsDataURL(file);
    }
  }

  onImageDelete(type: 'image' | 'logo'): void {
    if (type === 'image') {
      this.vendorForm.patchValue({ imageUrl: '' });
    } else {
      this.vendorForm.patchValue({ logoUrl: '' });
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

  onDrop(event: DragEvent, type: 'image' | 'logo'): void {
    event.preventDefault();
    event.stopPropagation();
    
    const files = event.dataTransfer?.files;
    if (files && files.length > 0) {
      const file = files[0];
      if (file.type.startsWith('image/')) {
        this.isUploading = true;
        const reader = new FileReader();
        reader.onload = (e: any) => {
          const imageUrl = e.target.result;
          if (type === 'image') {
            this.vendorForm.patchValue({ imageUrl });
          } else {
            this.vendorForm.patchValue({ logoUrl: imageUrl });
          }
          this.isUploading = false;
        };
        reader.readAsDataURL(file);
      }
    }
  }

  onSubmit(): void {
    if (this.vendorForm.valid) {
      // Aquí enviarías los datos al servicio
      console.log('Vendor data:', this.vendorForm.value);
      
      this.snackBar.open(
        this.isEditMode ? 'Vendedor actualizado exitosamente!' : 'Vendedor creado exitosamente!', 
        'Cerrar', 
        {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        }
      );
      
      // Navegar de vuelta al listado
      this.router.navigate(['/vendors']);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.router.navigate(['/vendors']);
  }

  private markFormGroupTouched(): void {
    Object.keys(this.vendorForm.controls).forEach(key => {
      const control = this.vendorForm.get(key);
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
    return this.isEditMode ? 'Editar Vendedor' : 'Nuevo Vendedor';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Guardar';
  }

  get telegramExample(): string {
    return 'Ejemplo: https://t.me/Empresa_Copextel';
  }

  get whatsappExample(): string {
    return 'Ejemplo: https://chat.whatsapp.com/JCOiOwRU3IAOWOKbka9XMG';
  }
}
