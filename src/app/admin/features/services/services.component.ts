import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';

// Components
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceDetailModal } from './service-detail-modal/service-detail-modal.component';

// Models
export interface Service {
  id: number;
  name: string;
  specifications: string;
  priceCUP: number;
  priceMLC: number;
  active: boolean;
}

@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatFormFieldModule,
    MatInputModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit {
  // Services data
  services: Service[] = [
    { id: 1, name: 'mi servicio', specifications: 'Especificaciones del servicio', priceCUP: 5000.00, priceMLC: 50.00, active: true }
  ];
  
  displayedColumns: string[] = ['name', 'priceCUP', 'priceMLC', 'active', 'actions'];
  
  // Search functionality
  searchControl = new FormControl('');
  
  // Pagination
  pageSize = 10;
  pageIndex = 0;
  totalItems = 0;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Initialize search functionality
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged()
      )
      .subscribe(searchTerm => {
        this.filterServices(searchTerm || '');
      });

    // Initialize data
    this.updateTableData();
  }

  // Filter services based on search term
  private filterServices(searchTerm: string): void {
    // In a real app, this would be handled by the backend
    // For now, we'll just update the total items count
    this.updateTableData();
  }

  // Update table data and pagination
  private updateTableData(): void {
    this.totalItems = this.services.length;
  }

  // Add new service
  onAddService(): void {
    const dialogRef = this.dialog.open(ServiceFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newService: Service = {
          id: this.services.length + 1,
          name: result.name,
          specifications: result.specifications,
          priceCUP: result.priceCUP,
          priceMLC: result.priceMLC,
          active: result.active
        };
        this.services.push(newService);
        this.updateTableData();
        this.snackBar.open('Servicio agregado exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  // Edit service
  onEditService(service: Service): void {
    const dialogRef = this.dialog.open(ServiceFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { service }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.services.findIndex(s => s.id === service.id);
        if (index !== -1) {
          this.services[index] = { ...service, ...result };
          this.updateTableData();
          this.snackBar.open('Servicio actualizado exitosamente!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
    });
  }

  // Delete service
  onDeleteService(service: Service): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el servicio "${service.name}"?`)) {
      this.services = this.services.filter(s => s.id !== service.id);
      this.updateTableData();
      this.snackBar.open('Servicio eliminado exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  // View service details
  onViewService(service: Service): void {
    const dialogRef = this.dialog.open(ServiceDetailModal, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: false,
      data: { service }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Modal closed
    });
  }

  // Handle page change
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    // In a real app, you would fetch new data from the backend
  }

  // Format price for display
  formatPrice(price: number): string {
    return price.toLocaleString('es-CU', {
      minimumFractionDigits: 2,
      maximumFractionDigits: 2
    });
  }
}
