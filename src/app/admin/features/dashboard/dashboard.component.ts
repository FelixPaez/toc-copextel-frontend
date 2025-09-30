import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule
  ]
})
export class DashboardComponent implements OnInit {
  currentUser = { fullName: 'Administrador Sistema', email: 'admin@tienda.com' };
  
  // Datos de ejemplo para las métricas
  metrics = [
    {
      title: 'Ventas Totales',
      value: '$45,231',
      change: '+20.1%',
      icon: 'trending_up',
      color: 'primary'
    },
    {
      title: 'Pedidos',
      value: '2,350',
      change: '+180.1%',
      icon: 'shopping_cart',
      color: 'accent'
    },
    {
      title: 'Clientes',
      value: '12,234',
      change: '+19%',
      icon: 'people',
      color: 'warn'
    },
    {
      title: 'Productos',
      value: '573',
      change: '+201',
      icon: 'inventory',
      color: 'primary'
    }
  ];

  // Datos de ejemplo para gráficos
  recentOrders = [
    { id: '#3210', customer: 'Juan Pérez', amount: '$185.00', status: 'Completado' },
    { id: '#3209', customer: 'María García', amount: '$92.00', status: 'Pendiente' },
    { id: '#3208', customer: 'Carlos López', amount: '$250.00', status: 'En proceso' },
    { id: '#3207', customer: 'Ana Martínez', amount: '$120.00', status: 'Completado' }
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'Completado': return 'primary';
      case 'Pendiente': return 'warn';
      case 'En proceso': return 'accent';
      default: return 'primary';
    }
  }
}
