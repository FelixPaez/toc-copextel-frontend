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
import { MatTabsModule } from '@angular/material/tabs';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { CustomersService } from './customers.service';

// Components
import { NaturalCustomerDetailComponent } from './natural-customer-detail/natural-customer-detail.component';
import { LegalCustomerDetailComponent } from './legal-customer-detail/legal-customer-detail.component';

// Types
import { NaturalCustomer, LegalCustomer } from './customers.types';
import { CustomersPagination } from './customers.types';

// Constants
import { Icons } from '../../core/constants';

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

  // Expose Icons for template
  Icons = Icons;

  // Tabs
  selectedTab = 0;

  // Table - Natural
  displayedColumns: string[] = [
    'avatar',
    'name',
    'email',
    'phone',
    'idNumber',
    'city',
    'actions'
  ];

  // Table - Legal
  displayedColumnsLegal: string[] = [
    'logo',
    'code',
    'name',
    'email',
    'organism',
    'state',
    'actions'
  ];

  dataSource = new MatTableDataSource<NaturalCustomer>([]);
  dataSourceLegal = new MatTableDataSource<LegalCustomer>([]);
  
  // Search
  searchControl = new FormControl('');
  searchControlLegal = new FormControl('');

  // Filters
  genderFilter = new FormControl('all');
  stateFilter = new FormControl('all');
  stateFilterLegal = new FormControl('all');

  // Data
  customers: NaturalCustomer[] = [];
  legalCustomers: LegalCustomer[] = [];
  
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
    private _snackBar: MatSnackBar,
    private _dialog: MatDialog,
    private _activatedRoute: ActivatedRoute
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Check query params for tab selection
    this._activatedRoute.queryParams.pipe(takeUntil(this._unsubscribeAll)).subscribe(params => {
      if (params['tab']) {
        const tabIndex = parseInt(params['tab'], 10);
        if (tabIndex === 0 || tabIndex === 1) {
          this.selectedTab = tabIndex;
        }
      }
    });

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

    // Setup legal search
    this.searchControlLegal.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this._applyLegalFilters();
      });

    // Setup legal filters
    this.stateFilterLegal.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this._applyLegalFilters();
      });

    // Subscribe to legal customers
    this._customersService.legals$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(legals => {
        if (legals) {
          this.legalCustomers = legals;
          this._calculateStats();
          this._applyLegalFilters();
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
      this._loadLegalCustomers();
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
    this._dialog.open(NaturalCustomerDetailComponent, {
      width: '900px',
      maxWidth: '95vw',
      data: { customer }
    });
  }

  /**
   * On edit
   */
  onEdit(customer: NaturalCustomer): void {
    if (customer.id) {
      this._router.navigate(['./', customer.id, 'edit'], { relativeTo: this._router.routerState.root });
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
   * Load legal customers
   */
  private _loadLegalCustomers(): void {
    this.isLoading = true;
    
    this._customersService.getLegalCustomers().subscribe({
      next: (legals) => {
        this.legalCustomers = legals || [];
        this._applyLegalFilters();
        this.isLoading = false;
        this._calculateStats();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al cargar los clientes legales',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * Apply legal filters
   */
  private _applyLegalFilters(): void {
    let filtered = [...this.legalCustomers];

    // Filter by search
    const search = this.searchControlLegal.value?.toLowerCase() || '';
    if (search) {
      filtered = filtered.filter(l => 
        l.name.toLowerCase().includes(search) ||
        l.code.toLowerCase().includes(search) ||
        l.email.toLowerCase().includes(search) ||
        l.organism.toLowerCase().includes(search)
      );
    }

    // Filter by state
    const stateFilter = this.stateFilterLegal.value;
    if (stateFilter && stateFilter !== 'all') {
      filtered = filtered.filter(l => l.state === stateFilter);
    }

    this.dataSourceLegal.data = filtered;
  }

  /**
   * Calculate statistics
   */
  private _calculateStats(): void {
    this.stats.natural = this.customers.length;
    this.stats.legal = this.legalCustomers.length;
    this.stats.total = this.stats.natural + this.stats.legal;
  }

  /**
   * Get legal customer display name
   */
  getLegalDisplayName(legal: LegalCustomer): string {
    return legal.name || 'Sin nombre';
  }

  /**
   * On view legal
   */
  onViewLegal(legal: LegalCustomer): void {
    this._dialog.open(LegalCustomerDetailComponent, {
      width: '1000px',
      maxWidth: '95vw',
      data: { customer: legal }
    });
  }

  /**
   * Clear legal filters
   */
  clearLegalFilters(): void {
    this.searchControlLegal.setValue('');
    this.stateFilterLegal.setValue('all');
    this._applyLegalFilters();
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
