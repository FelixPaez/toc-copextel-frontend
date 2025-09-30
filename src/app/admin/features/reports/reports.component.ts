import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatDatepickerModule } from '@angular/material/datepicker';
import { MatNativeDateModule } from '@angular/material/core';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-reports',
  templateUrl: './reports.component.html',
  styleUrls: ['./reports.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTabsModule,
    MatTableModule,
    MatPaginatorModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule,
    MatInputModule,
    MatDatepickerModule,
    MatNativeDateModule
  ]
})
export class ReportsComponent implements OnInit {
  
  // Datos de ejemplo para reportes
  salesData = [
    { period: 'Enero 2024', sales: 45000, orders: 234, customers: 189, growth: '+12.5%' },
    { period: 'Febrero 2024', sales: 52000, orders: 267, customers: 203, growth: '+15.6%' },
    { period: 'Marzo 2024', sales: 48000, orders: 245, customers: 198, growth: '+8.2%' },
    { period: 'Abril 2024', sales: 61000, orders: 312, customers: 245, growth: '+27.1%' },
    { period: 'Mayo 2024', sales: 55000, orders: 289, customers: 223, growth: '+14.3%' }
  ];

  topProducts = [
    { name: 'Laptop HP Pavilion', sales: 45, revenue: 40500, growth: '+18.2%' },
    { name: 'Smartphone Samsung Galaxy', sales: 38, revenue: 22800, growth: '+12.5%' },
    { name: 'Auriculares Bluetooth', sales: 67, revenue: 6030, growth: '+25.8%' },
    { name: 'Tablet iPad Pro', sales: 23, revenue: 29900, growth: '+8.9%' },
    { name: 'Monitor Gaming 27"', sales: 31, revenue: 8680, growth: '+15.3%' }
  ];

  displayedColumns: string[] = ['period', 'sales', 'orders', 'customers', 'growth'];

  constructor() { }

  ngOnInit(): void {
  }

  getGrowthColor(growth: string): string {
    return growth.startsWith('+') ? 'success' : 'warn';
  }

  onExportReport(type: string): void {
    console.log('Exportar reporte:', type);
  }

  onGenerateReport(): void {
    console.log('Generar reporte personalizado');
  }
}
