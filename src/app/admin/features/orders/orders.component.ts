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
import { MatBadgeModule } from '@angular/material/badge';
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
import { OrdersService } from './orders.service';
import { AuthService } from '../../core/services/auth.service';

// Types
import { Order, OrderStatus, PaymentWay, PaymentStatus } from './orders.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

/**
 * Orders Component
 * Componente para gestión de pedidos
 */
@Component({
  selector: 'app-orders',
  templateUrl: './orders.component.html',
  styleUrls: ['./orders.component.scss'],
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
    MatBadgeModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class OrdersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = [
    'orderNo',
    'customer',
    'date',
    'total',
    'items',
    'status',
    'payment',
    'actions'
  ];

  dataSource = new MatTableDataSource<Order>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  statusFilter = new FormControl('all');
  paymentFilter = new FormControl('all');
  currencyFilter = new FormControl('all');

  // Data
  orders: Order[] = [];
  
  // Statistics
  stats = {
    total: 0,
    pending: 0,
    paid: 0,
    ready: 0,
    shipped: 0,
    delivered: 0,
    canceled: 0
  };
  
  // Pagination
  pagination: TablePagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // Current user
  currentUser: any = null;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  // Order statuses
  orderStatuses: OrderStatus[] = [
    'Pendiente de pago',
    'Pagada',
    'Lista',
    'Transportando',
    'Entregada',
    'Cancelada'
  ];

  /**
   * Constructor
   */
  constructor(
    private _ordersService: OrdersService,
    private _authService: AuthService,
    private _router: Router,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Get current user
    this._authService.authState$.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(authState => {
      this.currentUser = authState.user;
    });

    // Load orders
    this._loadOrders();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadOrders();
      });

    // Setup filters
    this.statusFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.paymentFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.currencyFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to orders
    this._ordersService.orders$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(orders => {
        if (orders) {
          this.orders = orders;
          this._calculateStats();
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._ordersService.pagination$
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
   * Load orders
   */
  public loadOrders(): void {
    this._loadOrders();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadOrders();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadOrders();
  }

  /**
   * Format currency
   */
  formatCurrency(amount: number, currency: 'CUP' | 'MLC' = 'CUP'): string {
    if (!amount) return '-';
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: currency === 'MLC' ? 'USD' : 'CUP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  /**
   * Get status color
   */
  getStatusColor(status: OrderStatus): 'primary' | 'accent' | 'warn' {
    switch (status) {
      case 'Entregada':
      case 'Pagada':
        return 'primary';
      case 'Pendiente de pago':
      case 'Cancelada':
        return 'warn';
      case 'Lista':
      case 'Transportando':
        return 'accent';
      default:
        return 'primary';
    }
  }

  /**
   * Get status icon
   */
  getStatusIcon(status: OrderStatus): string {
    switch (status) {
      case 'Entregada':
        return 'check_circle';
      case 'Pagada':
        return 'payment';
      case 'Pendiente de pago':
        return 'schedule';
      case 'Cancelada':
        return 'cancel';
      case 'Lista':
        return 'inventory';
      case 'Transportando':
        return 'local_shipping';
      default:
        return 'info';
    }
  }

  /**
   * Get payment icon
   */
  getPaymentIcon(paymentWay: PaymentWay): string {
    switch (paymentWay) {
      case 'Enzona':
        return 'account_balance_wallet';
      case 'Transfermóvil':
        return 'phone_android';
      case 'Efectivo':
        return 'money';
      default:
        return 'payment';
    }
  }

  /**
   * Get customer name
   */
  getCustomerName(order: Order): string {
    if (order.beneficiaryName) {
      return `${order.beneficiaryName} ${order.beneficiaryLastname1 || ''} ${order.beneficiaryLastname2 || ''}`.trim();
    }
    return 'Cliente';
  }

  /**
   * Get items count
   */
  getItemsCount(order: Order): number {
    return order.products?.length || 0;
  }

  /**
   * On view
   */
  onView(order: Order): void {
    if (order.id) {
      this._router.navigate(['./', order.id], { relativeTo: this._router.routerState.root });
    }
  }

  /**
   * On edit
   */
  onEdit(order: Order): void {
    if (order.id) {
      this._router.navigate(['./', order.id, 'edit'], { relativeTo: this._router.routerState.root });
    }
  }

  /**
   * On update status
   */
  onUpdateStatus(order: Order, newStatus: OrderStatus): void {
    if (!order.id) {
      this._snackBar.open('Error: ID de pedido no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    this._ordersService.updateOrderStatus({
      orderId: order.id,
      status: newStatus
    }).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Estado del pedido actualizado correctamente', 'Cerrar', {
          duration: 3000
        });
        this._loadOrders();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar el estado del pedido',
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
    this.statusFilter.setValue('all');
    this.paymentFilter.setValue('all');
    this.currencyFilter.setValue('all');
    this.pageIndex = 0;
    this._loadOrders();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load orders
   */
  private _loadOrders(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'orderNo';
    const order = this.sort?.direction || 'desc';

    // Check if user has vendorId to filter by vendor
    const userUo = this.currentUser?.uo || this.currentUser?.vendorId;

    if (userUo) {
      this._ordersService.getOrdersByVendor(
        this.pageIndex,
        this.pageSize,
        sort,
        order as 'asc' | 'desc',
        search,
        userUo
      ).subscribe({
        next: () => {
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          this._snackBar.open(
            error?.error?.message || 'Error al cargar los pedidos',
            'Cerrar',
            { duration: 5000 }
          );
        }
      });
    } else {
      this._ordersService.getOrders(
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
            error?.error?.message || 'Error al cargar los pedidos',
            'Cerrar',
            { duration: 5000 }
          );
        }
      });
    }
  }

  /**
   * Calculate statistics
   */
  private _calculateStats(): void {
    this.stats.total = this.orders.length;
    this.stats.pending = this.orders.filter(o => o.status === 'Pendiente de pago').length;
    this.stats.paid = this.orders.filter(o => o.status === 'Pagada').length;
    this.stats.ready = this.orders.filter(o => o.status === 'Lista').length;
    this.stats.shipped = this.orders.filter(o => o.status === 'Transportando').length;
    this.stats.delivered = this.orders.filter(o => o.status === 'Entregada').length;
    this.stats.canceled = this.orders.filter(o => o.status === 'Cancelada').length;
  }

  /**
   * Apply filters
   */
  private _applyFilters(): void {
    let filtered = [...this.orders];

    // Filter by status
    const statusFilter = this.statusFilter.value;
    if (statusFilter && statusFilter !== 'all') {
      filtered = filtered.filter(o => o.status === statusFilter);
    }

    // Filter by payment
    const paymentFilter = this.paymentFilter.value;
    if (paymentFilter && paymentFilter !== 'all') {
      filtered = filtered.filter(o => o.paymentWay === paymentFilter);
    }

    // Filter by currency
    const currencyFilter = this.currencyFilter.value;
    if (currencyFilter && currencyFilter !== 'all') {
      filtered = filtered.filter(o => o.currency === currencyFilter);
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
