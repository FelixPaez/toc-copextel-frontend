import { Component, OnDestroy, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatDividerModule } from '@angular/material/divider';
import { MatMenuModule } from '@angular/material/menu';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

// Services
import { AuthService } from '../../core/services/auth.service';
import { DashboardService } from './dashboard.service';
import { OrdersService } from '../orders/orders.service';
import { ProductsService } from '../products/products.service';
import { CustomersService } from '../customers/customers.service';

// Types
import { Order } from '../orders/orders.types';
import { InventoryProduct } from '../products/products.types';
import { NaturalCustomer } from '../customers/customers.types';

/**
 * Dashboard Component
 * Componente principal del dashboard con métricas y estadísticas
 */
@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.component.html',
  styleUrls: ['./dashboard.component.scss'],
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatIconModule,
    MatButtonModule,
    MatDividerModule,
    MatMenuModule,
    MatProgressSpinnerModule
  ]
})
export class DashboardComponent implements OnInit, OnDestroy {
  // Current user
  currentUser: any = null;

  // Loading states
  isLoading = true;
  isLoadingStats = false;

  // Data observables
  orders$ = this._ordersService.orders$;
  products$ = this._productsService.products$;
  customers$ = this._customersService.naturals$;

  // Metrics data
  metrics = {
    totalOrders: 0,
    pendingOrders: 0,
    completedOrders: 0,
    totalProducts: 0,
    totalCustomers: 0,
    totalRevenue: 0
  };

  // Orders by status
  ordersByStatus = {
    pending: [] as Order[],
    paid: [] as Order[],
    ready: [] as Order[],
    shipped: [] as Order[],
    delivered: [] as Order[],
    canceled: [] as Order[]
  };

  // Recent orders
  recentOrders: Order[] = [];

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
    private _authService: AuthService,
    private _dashboardService: DashboardService,
    private _ordersService: OrdersService,
    private _productsService: ProductsService,
    private _customersService: CustomersService
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

    // Load initial data
    this._loadData();

    // Subscribe to orders
    this.orders$.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(orders => {
      if (orders) {
        this._processOrders(orders);
      }
    });

    // Subscribe to products
    this.products$.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(products => {
      if (products) {
        this.metrics.totalProducts = products.length;
      }
    });

    // Subscribe to customers
    this.customers$.pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(customers => {
      if (customers) {
        this.metrics.totalCustomers = customers.length;
      }
    });
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
   * Get status color
   */
  getStatusColor(status: string): 'primary' | 'accent' | 'warn' {
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
  getStatusIcon(status: string): string {
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
   * Format currency
   */
  formatCurrency(amount: number, currency: string = 'CUP'): string {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: currency === 'MLC' ? 'USD' : 'CUP',
      minimumFractionDigits: 2
    }).format(amount);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load initial data
   */
  private _loadData(): void {
    this.isLoading = true;

    // Load orders
    this._ordersService.getOrders(0, 100).pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe({
      next: () => {
        // Orders are processed in the subscription
        this.isLoading = false;
      },
      error: () => {
        this.isLoading = false;
      }
    });

    // Load products
    this._productsService.getProducts(0, 100).pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe({
      next: () => {
        // Products are processed in the subscription
      },
      error: () => {
        // Handle error silently
      }
    });

    // Load customers
    this._customersService.getNaturalCustomers(0, 100).pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe({
      next: () => {
        // Customers are processed in the subscription
      },
      error: () => {
        // Handle error silently
      }
    });
  }

  /**
   * Process orders data
   */
  private _processOrders(orders: Order[]): void {
    // Filter orders by status
    this.ordersByStatus.pending = orders.filter(o => o.status === 'Pendiente de pago');
    this.ordersByStatus.paid = orders.filter(o => o.status === 'Pagada');
    this.ordersByStatus.ready = orders.filter(o => o.status === 'Lista');
    this.ordersByStatus.shipped = orders.filter(o => o.status === 'Transportando');
    this.ordersByStatus.delivered = orders.filter(o => o.status === 'Entregada');
    this.ordersByStatus.canceled = orders.filter(o => o.status === 'Cancelada');

    // Calculate metrics
    this.metrics.totalOrders = orders.length;
    this.metrics.pendingOrders = this.ordersByStatus.pending.length;
    this.metrics.completedOrders = this.ordersByStatus.delivered.length;

    // Calculate total revenue from delivered orders
    this.metrics.totalRevenue = this.ordersByStatus.delivered.reduce((sum, order) => {
      return sum + (order.total || 0);
    }, 0);

    // Get recent orders (last 5)
    this.recentOrders = orders
      .sort((a, b) => {
        const dateA = new Date(a.createdAt || 0).getTime();
        const dateB = new Date(b.createdAt || 0).getTime();
        return dateB - dateA;
      })
      .slice(0, 5);
  }
}
