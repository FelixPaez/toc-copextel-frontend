import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

export interface Vendor {
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
}

@Component({
  selector: 'app-vendors',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit, AfterViewInit {
  vendors: Vendor[] = [
    { 
      id: 1, 
      name: 'Guantánamo', 
      email: 'guantanamo@copextel.com.cu',
      phone: '+53 21 1234567',
      telegramChannel: 'https://t.me/Guantanamo_Copextel',
      whatsappGroup: 'https://chat.whatsapp.com/Guantanamo123',
      address: 'Calle 1ra #123, Guantánamo',
      province: 'Guantánamo',
      municipality: 'Guantánamo',
      description: 'Vendedor de Guantánamo especializado en servicios locales',
      active: true
    },
    { 
      id: 2, 
      name: 'Mundo Electrónico', 
      email: 'mundo@copextel.com.cu',
      phone: '+53 7 9876543',
      telegramChannel: 'https://t.me/MundoElectronico',
      whatsappGroup: 'https://chat.whatsapp.com/Mundo456',
      address: 'Avenida 5ta #456, La Habana',
      province: 'La Habana',
      municipality: 'Plaza',
      description: 'Vendedor especializado en electrónicos y tecnología',
      active: true
    },
    { 
      id: 3, 
      name: 'TOC - Plaza', 
      email: 'plaza@copextel.com.cu',
      phone: '+53 7 5555555',
      telegramChannel: 'https://t.me/TOCPlaza',
      whatsappGroup: 'https://chat.whatsapp.com/TOCPlaza789',
      address: 'Plaza de la Revolución, La Habana',
      province: 'La Habana',
      municipality: 'Plaza de la Revolución',
      description: 'Tienda Online de Copextel - Plaza de la Revolución',
      active: true
    },
    { 
      id: 4, 
      name: 'Tecnostar Informática y Comunicaciones', 
      email: 'tecnostar@copextel.com.cu',
      phone: '+53 7 4444444',
      telegramChannel: 'https://t.me/TecnostarInfo',
      whatsappGroup: 'https://chat.whatsapp.com/Tecnostar012',
      address: 'Calle 17 #345, Vedado',
      province: 'La Habana',
      municipality: 'Plaza de la Revolución',
      description: 'Especialistas en informática y comunicaciones',
      active: true
    },
    { 
      id: 5, 
      name: 'Tienda Online de Copextel', 
      email: 'online@copextel.com.cu',
      phone: '+53 7 3333333',
      telegramChannel: 'https://t.me/TiendaOnlineCopextel',
      whatsappGroup: 'https://chat.whatsapp.com/TiendaOnline345',
      address: 'Edificio Focsa, Calle 17 esquina M, Vedado',
      province: 'La Habana',
      municipality: 'Plaza de la Revolución',
      description: 'Tienda Online principal de Copextel',
      active: true
    }
  ];

  dataSource = new MatTableDataSource<Vendor>(this.vendors);
  displayedColumns: string[] = ['name', 'active', 'actions'];
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAddVendor(): void {
    this.router.navigate(['/vendors/new']);
  }

  onEditVendor(vendor: Vendor): void {
    this.router.navigate(['/vendors/edit', vendor.id]);
  }

  onDeleteVendor(vendor: Vendor): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el vendedor "${vendor.name}"?`)) {
      this.vendors = this.vendors.filter(v => v.id !== vendor.id);
      this.dataSource.data = this.vendors;
      this.snackBar.open('Vendedor eliminado exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
