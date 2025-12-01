import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';

// Constants
import { Icons } from '../../core/constants';

// Services
import { ConfirmService } from '../../core/services/confirm.service';

// Components
import { SocialNetworkFormComponent } from './social-network-form/social-network-form.component';

// Models
export interface SocialNetwork {
  id: number;
  name: string;
  url: string;
}

@Component({
  selector: 'app-info',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatDialogModule,
    MatMenuModule,
    MatDividerModule,
    ReactiveFormsModule
  ],
  templateUrl: './info.component.html',
  styleUrls: ['./info.component.scss']
})
export class InfoComponent implements OnInit {
  // Expose Icons for template
  Icons = Icons;

  // Form data
  footerInfoForm: FormGroup;
  consumerProtectionForm: FormGroup;
  termsConditionsForm: FormGroup;

  // Social networks data
  socialNetworks: SocialNetwork[] = [
    { id: 1, name: 'Twitter/X', url: 'qwe' }
  ];
  
  displayedColumns: string[] = ['name', 'url', 'actions'];

  // Expansion panel states
  footerExpanded = false;
  consumerProtectionExpanded = false;
  termsConditionsExpanded = false;
  socialNetworksExpanded = false;

  // Edit mode state
  isEditMode = false;

  constructor(
    private fb: FormBuilder,
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private confirmService: ConfirmService
  ) {
    // Initialize forms
    this.footerInfoForm = this.fb.group({
      address: ['Edificio Focsa, Calle 17 esquina M, Vedado, municipio Plaza de la Revolución, La Habana, Cuba, CP 10400', [Validators.required]],
      email: ['toc@copextel.com.cu', [Validators.required, Validators.email]],
      phone: ['+535 213 9893', [Validators.required]]
    });

    this.consumerProtectionForm = this.fb.group({
      description: ['', [Validators.required]]
    });

    this.termsConditionsForm = this.fb.group({
      description: ['', [Validators.required]]
    });

    // Initially disable all forms
    this.footerInfoForm.disable();
    this.consumerProtectionForm.disable();
    this.termsConditionsForm.disable();
  }

  ngOnInit(): void {
    // Component initialization
  }

  // Social networks actions
  onAddSocialNetwork(): void {
    const dialogRef = this.dialog.open(SocialNetworkFormComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newSocialNetwork: SocialNetwork = {
          id: this.socialNetworks.length + 1,
          name: result.name,
          url: result.url
        };
        this.socialNetworks.push(newSocialNetwork);
        this.snackBar.open('Red social agregada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onEditSocialNetwork(socialNetwork: SocialNetwork): void {
    const dialogRef = this.dialog.open(SocialNetworkFormComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { socialNetwork }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.socialNetworks.findIndex(s => s.id === socialNetwork.id);
        if (index !== -1) {
          this.socialNetworks[index] = { ...socialNetwork, ...result };
          this.snackBar.open('Red social actualizada exitosamente!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
    });
  }

  onDeleteSocialNetwork(socialNetwork: SocialNetwork): void {
    this.confirmService.confirm({
      title: 'Eliminar Red Social',
      message: `¿Estás seguro de que deseas eliminar la red social "${socialNetwork.name}"?`,
      icon: 'delete',
      type: 'warn',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).subscribe(confirmed => {
      if (confirmed) {
      this.socialNetworks = this.socialNetworks.filter(s => s.id !== socialNetwork.id);
      this.snackBar.open('Red social eliminada exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
          verticalPosition: 'top',
          panelClass: ['success-snackbar']
      });
    }
    });
  }

  // Toggle edit mode and expand all sections
  onUpdateAll(): void {
    if (!this.isEditMode) {
      // Enable edit mode
      this.isEditMode = true;
      
      // Enable all forms
      this.footerInfoForm.enable();
      this.consumerProtectionForm.enable();
      this.termsConditionsForm.enable();
      
      // Expand all sections
      this.footerExpanded = true;
      this.consumerProtectionExpanded = true;
      this.termsConditionsExpanded = true;
      this.socialNetworksExpanded = true;
      
      this.snackBar.open('Modo de edición activado. Todos los campos están habilitados.', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } else {
      // Save changes and exit edit mode
      this.saveAllChanges();
    }
  }

  // Save all changes
  private saveAllChanges(): void {
    // Validate all forms
    this.footerInfoForm.markAllAsTouched();
    this.consumerProtectionForm.markAllAsTouched();
    this.termsConditionsForm.markAllAsTouched();

    if (this.footerInfoForm.valid && this.consumerProtectionForm.valid && this.termsConditionsForm.valid) {
      // Here you would typically send data to your API
      console.log('All data updated:', {
        footerInfo: this.footerInfoForm.value,
        consumerProtection: this.consumerProtectionForm.value,
        termsConditions: this.termsConditionsForm.value
      });

      // Disable all forms
      this.footerInfoForm.disable();
      this.consumerProtectionForm.disable();
      this.termsConditionsForm.disable();

      // Exit edit mode
      this.isEditMode = false;

      this.snackBar.open('Toda la información ha sido actualizada exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    } else {
      this.snackBar.open('Por favor, completa todos los campos requeridos antes de guardar.', 'Cerrar', {
        duration: 4000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  // Cancel edit mode
  onCancelEdit(): void {
    // Reset forms to original values (you might want to implement this)
    this.footerInfoForm.disable();
    this.consumerProtectionForm.disable();
    this.termsConditionsForm.disable();
    
    this.isEditMode = false;
    
    this.snackBar.open('Edición cancelada.', 'Cerrar', {
      duration: 2000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
