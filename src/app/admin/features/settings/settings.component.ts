import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatDividerModule } from '@angular/material/divider';
import { MatChipsModule } from '@angular/material/chips';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';

@Component({
  selector: 'app-settings',
  templateUrl: './settings.component.html',
  styleUrls: ['./settings.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatDividerModule,
    MatChipsModule,
    ReactiveFormsModule
  ]
})
export class SettingsComponent implements OnInit {
  
  generalForm: FormGroup;
  notificationsForm: FormGroup;
  securityForm: FormGroup;
  
  // Configuraciones de ejemplo
  storeSettings = {
    name: 'Mi Tienda Online',
    email: 'admin@mitienda.com',
    phone: '+34 612 345 678',
    address: 'Calle Principal 123, Madrid',
    currency: 'EUR',
    language: 'es',
    timezone: 'Europe/Madrid'
  };

  notificationSettings = {
    emailNotifications: true,
    orderNotifications: true,
    stockAlerts: true,
    marketingEmails: false,
    weeklyReports: true
  };

  securitySettings = {
    twoFactorAuth: false,
    sessionTimeout: 30,
    passwordExpiry: 90,
    loginAttempts: 5
  };

  constructor(private fb: FormBuilder) {
    this.generalForm = this.fb.group({
      name: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      phone: [''],
      address: [''],
      currency: [''],
      language: [''],
      timezone: ['']
    });

    this.notificationsForm = this.fb.group({
      emailNotifications: [true],
      orderNotifications: [true],
      stockAlerts: [true],
      marketingEmails: [false],
      weeklyReports: [true]
    });

    this.securityForm = this.fb.group({
      twoFactorAuth: [false],
      sessionTimeout: [30],
      passwordExpiry: [90],
      loginAttempts: [5]
    });
  }

  ngOnInit(): void {
    this.loadSettings();
  }

  loadSettings(): void {
    this.generalForm.patchValue(this.storeSettings);
    this.notificationsForm.patchValue(this.notificationSettings);
    this.securityForm.patchValue(this.securitySettings);
  }

  onSaveGeneral(): void {
    if (this.generalForm.valid) {
      console.log('Guardando configuración general:', this.generalForm.value);
      // Aquí se enviaría al backend
    }
  }

  onSaveNotifications(): void {
    console.log('Guardando configuración de notificaciones:', this.notificationsForm.value);
    // Aquí se enviaría al backend
  }

  onSaveSecurity(): void {
    console.log('Guardando configuración de seguridad:', this.securityForm.value);
    // Aquí se enviaría al backend
  }

  onResetSettings(): void {
    this.loadSettings();
  }

  onExportSettings(): void {
    console.log('Exportando configuración');
  }

  onImportSettings(): void {
    console.log('Importando configuración');
  }
}
