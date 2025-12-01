import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatChipsModule } from '@angular/material/chips';
import { MatDividerModule } from '@angular/material/divider';
import { MatTableModule } from '@angular/material/table';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatMenuModule } from '@angular/material/menu';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdersService } from '../orders.service';
import { Order, OrderStatus, PaymentWay, PaymentStatus } from '../orders.types';
import { ConfirmService } from '../../../core/services/confirm.service';

@Component({
  selector: 'app-order-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatChipsModule,
    MatDividerModule,
    MatTableModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatMenuModule
  ],
  templateUrl: './order-detail.component.html',
  styleUrls: ['./order-detail.component.scss']
})
export class OrderDetailComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = false;
  orderId: number | null = null;

  displayedColumns: string[] = ['product', 'quantity', 'price', 'total'];

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
    private confirmService: ConfirmService,
    private snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.orderId = +params['id'];
        if (this.orderId) {
          this.loadOrder();
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadOrder(): void {
    if (!this.orderId) return;

    this.isLoading = true;
    this.ordersService.getOrderById(this.orderId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (order) => {
          this.order = order;
          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error al cargar la orden';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  getStatusColor(status: OrderStatus): string {
    const statusColors: Record<OrderStatus, string> = {
      'Pendiente de pago': 'warn',
      'Pagada': 'primary',
      'Lista': 'accent',
      'Transportando': 'primary',
      'Entregada': 'success',
      'Cancelada': 'error',
      'Reembolsada': 'error',
      'Pendiente de Reembolso': 'warn'
    };
    return statusColors[status] || 'primary';
  }

  getPaymentStatusColor(status: PaymentStatus): string {
    return status === 'Pagada' ? 'success' : 'warn';
  }

  onUpdateStatus(newStatus: Partial<OrderStatus>): void {
    if (!this.order || !this.orderId) return;

    this.confirmService.confirm({
      title: 'Actualizar Estado',
      message: `¿Está seguro que desea actualizar el estado de la orden?`,
      icon: 'info',
      type: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        // Implementation depends on OrdersService.updateOrderStatus
        this.snackBar.open('Funcionalidad en desarrollo', 'Cerrar', {
          duration: 3000
        });
      }
    });
  }

  onViewInvoice(): void {
    if (this.orderId) {
      this.router.navigate(['invoice'], { relativeTo: this.route });
    }
  }

  onPrint(): void {
    window.print();
  }

  onBack(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  getProductTotal(product: any): number {
    return (product.productPrice || 0) * (product.quantity || 0);
  }
}

