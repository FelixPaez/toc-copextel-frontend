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
import { MatBadgeModule } from '@angular/material/badge';

@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
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
    MatMenuModule,
    MatBadgeModule
  ]
})
export class OrdersComponent implements OnInit {
  
  // Datos de ejemplo para pedidos
  orders = [
    {
      id: '#3210',
      customer: 'Juan Pérez',
      email: 'juan.perez@email.com',
      date: '2024-01-15',
      total: 185.00,
      status: 'Completado',
      items: 3,
      payment: 'Tarjeta'
    },
    {
      id: '#3209',
      customer: 'María García',
      email: 'maria.garcia@email.com',
      date: '2024-01-14',
      total: 92.00,
      status: 'Pendiente',
      items: 2,
      payment: 'PayPal'
    },
    {
      id: '#3208',
      customer: 'Carlos López',
      email: 'carlos.lopez@email.com',
      date: '2024-01-13',
      total: 250.00,
      status: 'En proceso',
      items: 4,
      payment: 'Tarjeta'
    },
    {
      id: '#3207',
      customer: 'Ana Martínez',
      email: 'ana.martinez@email.com',
      date: '2024-01-12',
      total: 120.00,
      status: 'Completado',
      items: 1,
      payment: 'Efectivo'
    },
    {
      id: '#3206',
      customer: 'Luis Rodríguez',
      email: 'luis.rodriguez@email.com',
      date: '2024-01-11',
      total: 75.50,
      status: 'Cancelado',
      items: 2,
      payment: 'Tarjeta'
    }
  ];

  displayedColumns: string[] = ['id', 'customer', 'date', 'total', 'items', 'status', 'payment', 'actions'];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'Completado': return 'primary';
      case 'Pendiente': return 'warn';
      case 'En proceso': return 'accent';
      case 'Cancelado': return 'warn';
      default: return 'primary';
    }
  }

  getPaymentIcon(payment: string): string {
    switch (payment) {
      case 'Tarjeta': return 'credit_card';
      case 'PayPal': return 'account_balance_wallet';
      case 'Efectivo': return 'money';
      default: return 'payment';
    }
  }

  onView(order: any): void {
    console.log('Ver pedido:', order);
  }

  onEdit(order: any): void {
    console.log('Editar pedido:', order);
  }

  onDelete(order: any): void {
    console.log('Eliminar pedido:', order);
  }

  onProcess(order: any): void {
    console.log('Procesar pedido:', order);
  }
}
