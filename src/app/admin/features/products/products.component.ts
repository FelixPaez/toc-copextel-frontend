import { Component, OnInit } from '@angular/core';
import { RouterModule } from '@angular/router';
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
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
  standalone: true,
  imports: [
    RouterModule,
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
export class ProductsComponent implements OnInit {
  
  // Datos de ejemplo para productos
  products = [
    { code: '0001', name: 'Cable de red', category: 'Redes', priceCupState: 'CUP 1.00', priceMlcState: 'MLC 1.00', priceCupNonState: 'CUP 1.00', priceMlcNonState: 'MLC 1.00', stock: 800, stockPercent: 80, offer: true, active: true, image: 'assets/images/products/headphone-1.jpg' },
    { code: '0002', name: 'Cable vendedor', category: 'Redes', priceCupState: 'CUP 1.00', priceMlcState: 'MLC 1.00', priceCupNonState: 'CUP 1.00', priceMlcNonState: 'MLC 1.00', stock: 900, stockPercent: 90, offer: true, active: true, image: 'assets/images/products/headphone-2.jpg' },
    { code: '0003', name: 'Tv Plano', category: 'Electro', priceCupState: 'CUP 25,000.00', priceMlcState: 'MLC 250.00', priceCupNonState: 'CUP 25,000.00', priceMlcNonState: 'MLC 250.00', stock: 40, stockPercent: 40, offer: false, active: true, image: 'assets/images/products/headphone-3.jpg' }
  ];

  displayedColumns: string[] = [
    'code', 'name', 'priceCupState', 'priceMlcState', 'priceCupNonState', 'priceMlcNonState', 'stock', 'offer', 'active', 'actions'
  ];

  constructor() { }

  ngOnInit(): void {
  }

  getStatusColor(status: string): 'primary' | 'accent' | 'warn' { return status === 'Activo' ? 'primary' : 'warn'; }

  onEdit(product: any): void {}

  onDelete(product: any): void {}

  onView(product: any): void {}
}
