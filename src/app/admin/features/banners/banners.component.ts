import { Component, OnInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatPaginatorModule } from '@angular/material/paginator';
import { MatSortModule } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';

export interface Banner {
  id: string;
  title: string;
  subtitle: string;
  category: string;
  image?: string;
  isActive: boolean;
  createdAt: Date;
  updatedAt: Date;
}

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
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
    MatMenuModule,
    MatSnackBarModule
  ]
})
export class BannersComponent implements OnInit {
  
  // Datos de ejemplo para banners
  banners: Banner[] = [
    {
      id: '1',
      title: 'Computadoras',
      subtitle: 'Computadoras con componentes de ultima generacion',
      category: 'Tecnología',
      image: 'assets/images/products/headphone-1.jpg',
      isActive: true,
      createdAt: new Date('2024-01-15'),
      updatedAt: new Date('2024-01-15')
    },
    {
      id: '2',
      title: 'Aire acondicionado',
      subtitle: 'Disfruta del máximo confort en tu hogar u oficina, incluso en los días más calurosos.',
      category: 'Electrodomésticos',
      image: 'assets/images/products/headphone-2.jpg',
      isActive: true,
      createdAt: new Date('2024-01-14'),
      updatedAt: new Date('2024-01-14')
    },
    {
      id: '3',
      title: 'Calentador solar',
      subtitle: 'Nuestros calentadores solares son eficientes, duraderos y ecológicos, brindándote agua caliente todo el día, incluso en días nublados.',
      category: 'Energía',
      image: 'assets/images/products/headphone-3.jpg',
      isActive: true,
      createdAt: new Date('2024-01-13'),
      updatedAt: new Date('2024-01-13')
    }
  ];

  displayedColumns: string[] = ['title', 'subtitle', 'isActive', 'actions'];

  constructor(
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
  }

  onEdit(banner: Banner): void {
    this.router.navigate(['/banners/edit', banner.id]);
  }

  onDelete(banner: Banner): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el banner "${banner.title}"?`)) {
      this.banners = this.banners.filter(b => b.id !== banner.id);
      this.snackBar.open('Banner eliminado correctamente', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  onToggleStatus(banner: Banner): void {
    banner.isActive = !banner.isActive;
    banner.updatedAt = new Date();
    
    const status = banner.isActive ? 'activado' : 'desactivado';
    this.snackBar.open(`Banner ${status} correctamente`, 'Cerrar', {
      duration: 3000,
      horizontalPosition: 'center',
      verticalPosition: 'top'
    });
  }
}
