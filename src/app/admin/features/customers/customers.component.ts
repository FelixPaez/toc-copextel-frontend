
import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule
  ]
})
export class CustomersComponent implements OnInit {
  
  // Datos de ejemplo para clientes
  customers = [
    {
      id: 1,
      name: 'Juan Pérez',
      email: 'juan.perez@email.com',
      phone: '+34 612 345 678',
      joinDate: '2023-01-15',
      orders: 12,
      totalSpent: 1850.50,
      status: 'Activo',
      avatar: 'assets/images/faces/1.jpg'
    },
    {
      id: 2,
      name: 'María García',
      email: 'maria.garcia@email.com',
      phone: '+34 623 456 789',
      joinDate: '2023-02-20',
      orders: 8,
      totalSpent: 920.00,
      status: 'Activo',
      avatar: 'assets/images/faces/2.jpg'
    },
    {
      id: 3,
      name: 'Carlos López',
      email: 'carlos.lopez@email.com',
      phone: '+34 634 567 890',
      joinDate: '2023-03-10',
      orders: 15,
      totalSpent: 2500.75,
      status: 'VIP',
      avatar: 'assets/images/faces/3.jpg'
    },
    {
      id: 4,
      name: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      phone: '+34 645 678 901',
      joinDate: '2023-04-05',
      orders: 5,
      totalSpent: 450.25,
      status: 'Activo',
      avatar: 'assets/images/faces/4.jpg'
    },
    {
      id: 5,
      name: 'Luis Rodríguez',
      email: 'luis.rodriguez@email.com',
      phone: '+34 656 789 012',
      joinDate: '2023-05-12',
      orders: 0,
      totalSpent: 0.00,
      status: 'Inactivo',
      avatar: 'assets/images/faces/5.jpg'
    }
  ];

  displayedColumns: string[] = ['avatar', 'name', 'email', 'phone', 'joinDate', 'orders', 'totalSpent', 'status', 'actions'];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'VIP': return 'accent';
      case 'Activo': return 'primary';
      case 'Inactivo': return 'warn';
      default: return 'primary';
    }
  }

  getInitials(name: string): string {
    return name.split(' ').map(n => n[0]).join('').toUpperCase();
  }

  onView(customer: any): void {
    console.log('Ver cliente:', customer);
  }

  onEdit(customer: any): void {
    console.log('Editar cliente:', customer);
  }

  onDelete(customer: any): void {
    console.log('Eliminar cliente:', customer);
  }

  onContact(customer: any): void {
    console.log('Contactar cliente:', customer);
  }
}
