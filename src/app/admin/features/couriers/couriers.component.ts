import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
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
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { CouriersService } from '../orders/couriers.service';
import { Courier } from '../orders/couriers.types';
import { TablePagination } from '../../core/models/shared.types';
import { ConfirmService } from '../../core/services/confirm.service';

// Constants
import { Icons } from '../../core/constants';

@Component({
  selector: 'app-couriers',
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
    MatSlideToggleModule,
    MatSnackBarModule
  ],
  templateUrl: './couriers.component.html',
  styleUrls: ['./couriers.component.scss']
})
export class CouriersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = [
    'name',
    'contact',
    'email',
    'phone',
    'city',
    'state',
    'active',
    'actions'
  ];

  dataSource = new MatTableDataSource<Courier>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');
  stateFilter = new FormControl('all');

  // Data
  couriers: Courier[] = [];
  
  // Pagination
  pagination: TablePagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _couriersService: CouriersService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _confirmService: ConfirmService
  ) {}

  ngOnInit(): void {
    this._loadCouriers();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this._loadCouriers();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.stateFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to couriers
    this._couriersService.couriers$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(couriers => {
        if (couriers) {
          this.couriers = couriers;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._couriersService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(pagination => {
        this.pagination = pagination;
      });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadCouriers();
  }

  onSortChange(sort: Sort): void {
    this._loadCouriers();
  }

  onView(courier: Courier): void {
    if (courier.id) {
      this._router.navigate(['./', courier.id], { relativeTo: this._activatedRoute });
    }
  }

  onEdit(courier: Courier): void {
    if (courier.id) {
      this._router.navigate(['./', courier.id], { relativeTo: this._activatedRoute });
    }
  }

  onToggleActive(courier: Courier): void {
    this._couriersService.toggleCourierActive(courier.id!, !courier.active)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this._snackBar.open(
            `Transportista ${courier.active ? 'desactivado' : 'activado'} exitosamente`,
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this._loadCouriers();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Error al cambiar el estado';
          this._snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  onDelete(courier: Courier): void {
    if (!courier.id) return;

    this._confirmService.confirm({
      title: 'Eliminar Transportista',
      message: `¿Está seguro que desea eliminar el transportista "${courier.name}"?`,
      icon: 'delete',
      type: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        this._couriersService.deleteCourier(courier.id!)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: () => {
              this._snackBar.open('Transportista eliminado exitosamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this._loadCouriers();
            },
            error: (error) => {
              const errorMessage = error?.error?.message || error?.message || 'Error al eliminar el transportista';
              this._snackBar.open(errorMessage, 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  onNew(): void {
    this._router.navigate(['./new'], { relativeTo: this._activatedRoute });
  }

  clearFilters(): void {
    this.searchControl.setValue('');
    this.activeFilter.setValue('all');
    this.stateFilter.setValue('all');
    this.pageIndex = 0;
    this._loadCouriers();
  }

  private _loadCouriers(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._couriersService.getCouriers(
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
          error?.error?.message || 'Error al cargar los transportistas',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  private _applyFilters(): void {
    let filtered = [...this.couriers];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter && activeFilter !== 'all') {
      filtered = filtered.filter(c => {
        if (activeFilter === 'active') return c.active === true;
        if (activeFilter === 'inactive') return c.active === false;
        return true;
      });
    }

    // Filter by state
    const stateFilter = this.stateFilter.value;
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(c => c.state === stateFilter);
    }

    this.dataSource.data = filtered;
  }
}

