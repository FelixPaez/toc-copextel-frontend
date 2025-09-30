import { Component, Inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, Validators, ReactiveFormsModule } from '@angular/forms';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatSelectModule } from '@angular/material/select';
import { MatIconModule } from '@angular/material/icon';

export interface SocialNetworkFormData {
  socialNetwork?: {
    id: number;
    name: string;
    url: string;
  };
}

@Component({
  selector: 'app-social-network-form',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatDialogModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatSelectModule,
    MatIconModule
  ],
  templateUrl: './social-network-form.component.html',
  styleUrls: ['./social-network-form.component.scss']
})
export class SocialNetworkFormComponent implements OnInit {
  socialNetworkForm: FormGroup;
  isEditMode = false;

  // Available social networks
  socialNetworkOptions = [
    { value: 'Facebook', label: 'Facebook' },
    { value: 'Twitter', label: 'Twitter' },
    { value: 'Instagram', label: 'Instagram' },
    { value: 'LinkedIn', label: 'LinkedIn' },
    { value: 'YouTube', label: 'YouTube' },
    { value: 'TikTok', label: 'TikTok' },
    { value: 'WhatsApp', label: 'WhatsApp' },
    { value: 'Telegram', label: 'Telegram' }
  ];

  constructor(
    private fb: FormBuilder,
    private dialogRef: MatDialogRef<SocialNetworkFormComponent>,
    @Inject(MAT_DIALOG_DATA) public data: SocialNetworkFormData
  ) {
    this.isEditMode = !!data?.socialNetwork;
    this.socialNetworkForm = this.fb.group({
      name: ['', [Validators.required]],
      url: ['', [Validators.required]]
    });
  }

  ngOnInit(): void {
    if (this.isEditMode && this.data.socialNetwork) {
      this.socialNetworkForm.patchValue({
        name: this.data.socialNetwork.name,
        url: this.data.socialNetwork.url
      });
    }
  }

  onSubmit(): void {
    if (this.socialNetworkForm.valid) {
      this.dialogRef.close(this.socialNetworkForm.value);
    } else {
      this.markFormGroupTouched();
    }
  }

  onCancel(): void {
    this.dialogRef.close();
  }

  private markFormGroupTouched(): void {
    Object.keys(this.socialNetworkForm.controls).forEach(key => {
      const control = this.socialNetworkForm.get(key);
      control?.markAsTouched();
    });
  }

  get title(): string {
    return this.isEditMode ? 'Editar red social' : 'Agregar red social';
  }

  get submitText(): string {
    return this.isEditMode ? 'Actualizar' : 'Agregar';
  }
}
