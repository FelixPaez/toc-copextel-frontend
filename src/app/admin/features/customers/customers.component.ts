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
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { CustomersService } from './customers.service';

// Types
import { NaturalCustomer } from './customers.types';
import { CustomersPagination } from './customers.types';

/**
 * Customers Component
 * Componente para gestión de clientes
 */
@Component({
  selector: 'app-customers',
  templateUrl: './customers.component.html',
  styleUrls: ['./customers.component.scss'],
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
    MatTabsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatSnackBarModule
  ]
})
export class CustomersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Tabs
  selectedTab = 0;

  // Table
  displayedColumns: string[] = [
    'avatar',
    'name',
    'email',
    'phone',
    'idNumber',
    'city',
    'actions'
  ];

  dataSource = new MatTableDataSource<NaturalCustomer>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  genderFilter = new FormControl('all');
  stateFilter = new FormControl('all');

  // Data
  customers: NaturalCustomer[] = [];
  
  // Statistics
  stats = {
    total: 0,
    natural: 0,
    legal: 0
  };
  
  // Pagination
  pagination: CustomersPagination | null = null;
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
    private _customersService: CustomersService,
    private _router: Router,
    private _snackBar: MatSnackBar
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Load customers
    this._loadCustomers();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadCustomers();
      });

    // Setup filters
    this.genderFilter.valueChanges
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

    // Subscribe to customers
    this._customersService.naturals$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(customers => {
        if (customers) {
          this.customers = customers;
          this._calculateStats();
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._customersService.pagination$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(pagination => {
        if (pagination) {
          // Convert TablePagination to CustomersPagination
          this.pagination = {
            length: pagination.length || 0,
            size: pagination.size || 10,
            page: pagination.page || 0,
            lastPage: pagination.lastPage || 0,
            startIndex: pagination.startIndex || 0,
            endIndex: pagination.endIndex || 0
          };
        }
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
   * On tab change
   */
  onTabChange(index: number): void {
    this.selectedTab = index;
    this.pageIndex = 0;
    if (index === 0) {
      this._loadCustomers();
    } else {
      // Load legal customers if needed
      // this._loadLegalCustomers();
    }
  }

  /**
   * Load customers
   */
  public loadCustomers(): void {
    this._loadCustomers();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadCustomers();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadCustomers();
  }

  /**
   * Get customer display name
   */
  getCustomerDisplayName(customer: NaturalCustomer): string {
    return `${customer.name} ${customer.lastname1} ${customer.lastname2 || ''}`.trim();
  }

  /**
   * Get customer initials
   */
  getCustomerInitials(customer: NaturalCustomer): string {
    const firstInitial = customer.name.charAt(0).toUpperCase();
    const lastInitial = customer.lastname1.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  /**
   * On view
   */
  onView(customer: NaturalCustomer): void {
    if (customer.id) {
      this._router.navigate(['/admin/customers', customer.id]);
    }
  }

  /**
   * On edit
   */
  onEdit(customer: NaturalCustomer): void {
    if (customer.id) {
      this._router.navigate(['/admin/customers', customer.id, 'edit']);
    }
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.genderFilter.setValue('all');
    this.stateFilter.setValue('all');
    this.pageIndex = 0;
    this._loadCustomers();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load customers
   */
  private _loadCustomers(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._customersService.getNaturalCustomers(
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
          error?.error?.message || 'Error al cargar los clientes',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Calculate statistics
   */
  private _calculateStats(): void {
    this.stats.total = this.customers.length;
    this.stats.natural = this.customers.length;
    // Legal customers would be calculated separately
    this.stats.legal = 0;
  }

  /**
   * Apply filters
   */
  private _applyFilters(): void {
    let filtered = [...this.customers];

    // Filter by gender
    const genderFilter = this.genderFilter.value;
    if (genderFilter && genderFilter !== 'all') {
      filtered = filtered.filter(c => c.gender === genderFilter);
    }

    // Filter by state
    const stateFilter = this.stateFilter.value;
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(c => c.state === stateFilter);
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
