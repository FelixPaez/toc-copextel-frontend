import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule, PageEvent } from '@angular/material/paginator';
import { MatSort, MatSortModule, Sort } from '@angular/material/sort';
import { MatChipsModule } from '@angular/material/chips';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { CopextelServicesService } from './services.service';
import { ConfirmService } from '../../core/services/confirm.service';

// Types
import { CopextelService } from './services.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

// Components
import { ServiceFormComponent } from './service-form/service-form.component';
import { ServiceDetailModal } from './service-detail-modal/service-detail-modal.component';

/**
 * Services Component
 * Componente para gestión de servicios de Copextel
 */
@Component({
  selector: 'app-services',
  standalone: true,
  imports: [
    RouterModule,
    CommonModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatSortModule,
    MatChipsModule,
    MatMenuModule,
    MatDividerModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './services.component.html',
  styleUrls: ['./services.component.scss']
})
export class ServicesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = ['name', 'priceCUP', 'priceMLC', 'active', 'actions'];
  dataSource = new MatTableDataSource<CopextelService>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');

  // Data
  services: CopextelService[] = [];
  
  // Pagination
  pagination: TablePagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _servicesService: CopextelServicesService,
    private _router: Router,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _confirmService: ConfirmService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Load services
    this._loadServices();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadServices();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to services
    this._servicesService.services$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(services => {
        if (services) {
          this.services = services;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._servicesService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(pagination => {
        this.pagination = pagination;
      });
  }

  /**
   * After view init
   */
  ngAfterViewInit(): void {
    // Set paginator and sort
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  /**
   * On destroy
   */
  ngOnDestroy(): void {
    // Unsubscribe from all subscriptions
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load services
   */
  public loadServices(): void {
    this._loadServices();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadServices();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadServices();
  }

  /**
   * Format price
   */
  formatPrice(price: number, currency: 'CUP' | 'MLC' = 'CUP'): string {
    if (!price) return '-';
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: currency === 'MLC' ? 'USD' : 'CUP',
      minimumFractionDigits: 2
    }).format(price);
  }

  /**
   * On add service
   */
  onAddService(): void {
    const dialogRef = this._dialog.open(ServiceFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        this._servicesService.createService(result).subscribe({
          next: () => {
            this._snackBar.open('Servicio agregado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadServices();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al agregar el servicio',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On edit service
   */
  onEditService(service: CopextelService): void {
    const dialogRef = this._dialog.open(ServiceFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { service }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        const updatedService = { ...service, ...result };
        this._servicesService.updateService(updatedService).subscribe({
          next: () => {
            this._snackBar.open('Servicio actualizado exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadServices();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al actualizar el servicio',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On delete service
   */
  onDeleteService(service: CopextelService): void {
    if (!service.id) {
      this._snackBar.open('Error: ID de servicio no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this._confirmService.confirm({
      title: 'Eliminar Servicio',
      message: `¿Está seguro de eliminar el servicio "${service.name}"?`,
      icon: 'delete',
      type: 'warn',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).pipe(takeUntil(this._unsubscribeAll)).subscribe(confirmed => {
      if (!confirmed) {
      return;
    }

    this.isLoading = true;
    this._servicesService.deleteService(service.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Servicio eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
        });
        this._loadServices();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar el servicio',
          'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
      });
    });
  }

  /**
   * On view service
   */
  onViewService(service: CopextelService): void {
    const dialogRef = this._dialog.open(ServiceDetailModal, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: false,
      autoFocus: false,
      data: { service }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(() => {
      // Modal closed
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(service: CopextelService): void {
    const updatedService = { ...service, active: !service.active };
    this._servicesService.updateService(updatedService).subscribe({
      next: () => {
        this._snackBar.open(
          `Servicio ${updatedService.active ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar el servicio',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.activeFilter.setValue('all');
    this.pageIndex = 0;
    this._loadServices();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load services
   */
  private _loadServices(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._servicesService.getServices(
      this.pageIndex,
      this.pageSize,
      sort,
      order as 'asc' | 'desc',
      search
    ).subscribe({
      next: () => {
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al cargar los servicios',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Apply filters
   */
  private _applyFilters(): void {
    let filtered = [...this.services];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(s => 
        activeFilter === 'active' ? s.active : !s.active
      );
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}

