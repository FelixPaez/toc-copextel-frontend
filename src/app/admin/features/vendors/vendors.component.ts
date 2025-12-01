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
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { VendorsService } from './vendors.service';
import { ConfirmService } from '../../core/services/confirm.service';

// Types
import { Vendor } from './vendors.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

// Components
import { VendorFormComponent } from './vendor-form/vendor-form.component';

/**
 * Vendors Component
 * Componente para gestión de vendedores
 */
@Component({
  selector: 'app-vendors',
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
    MatSnackBarModule
  ],
  templateUrl: './vendors.component.html',
  styleUrls: ['./vendors.component.scss']
})
export class VendorsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = ['name', 'email', 'phone', 'province', 'active', 'actions'];
  dataSource = new MatTableDataSource<Vendor>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');
  provinceFilter = new FormControl('all');

  // Data
  vendors: Vendor[] = [];
  
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
    private _vendorsService: VendorsService,
    private _router: Router,
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
    // Load vendors
    this._loadVendors();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadVendors();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.provinceFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to vendors
    this._vendorsService.vendors$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(vendors => {
        if (vendors) {
          this.vendors = vendors;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._vendorsService.pagination$
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
   * Load vendors
   */
  public loadVendors(): void {
    this._loadVendors();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadVendors();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadVendors();
  }

  /**
   * On add vendor
   */
  onAddVendor(): void {
    this._router.navigate(['./new'], { relativeTo: this._router.routerState.root });
  }

  /**
   * On edit vendor
   */
  onEditVendor(vendor: Vendor): void {
    if (vendor.id) {
      this._router.navigate(['./', vendor.id, 'edit'], { relativeTo: this._router.routerState.root });
    }
  }

  /**
   * On delete vendor
   */
  onDeleteVendor(vendor: Vendor): void {
    if (!vendor.id) {
      this._snackBar.open('Error: ID de vendedor no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this._confirmService.confirm({
      title: 'Eliminar Vendedor',
      message: `¿Está seguro de eliminar el vendedor "${vendor.name}"?`,
      icon: 'delete',
      type: 'warn',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).pipe(takeUntil(this._unsubscribeAll)).subscribe(confirmed => {
      if (!confirmed) {
      return;
    }

    this.isLoading = true;
    this._vendorsService.deleteVendor(vendor.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Vendedor eliminado exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
        });
        this._loadVendors();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar el vendedor',
          'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
      });
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(vendor: Vendor): void {
    const updatedVendor = { ...vendor, active: !vendor.active };
    this._vendorsService.updateVendor(updatedVendor).subscribe({
      next: () => {
        this._snackBar.open(
          `Vendedor ${updatedVendor.active ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar el vendedor',
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
    this.provinceFilter.setValue('all');
    this.pageIndex = 0;
    this._loadVendors();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load vendors
   */
  private _loadVendors(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._vendorsService.getSortsVendors(
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
          error?.error?.message || 'Error al cargar los vendedores',
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
    let filtered = [...this.vendors];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(v => 
        activeFilter === 'active' ? v.active : !v.active
      );
    }

    // Filter by province (using state as province)
    const provinceFilter = this.provinceFilter.value;
    if (provinceFilter && provinceFilter !== 'all') {
      filtered = filtered.filter(v => (v.province || v.state) === provinceFilter);
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
