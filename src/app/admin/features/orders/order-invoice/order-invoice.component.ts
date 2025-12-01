import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { OrdersService } from '../orders.service';
import { Order } from '../orders.types';

@Component({
  selector: 'app-order-invoice',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatSnackBarModule
  ],
  templateUrl: './order-invoice.component.html',
  styleUrls: ['./order-invoice.component.scss']
})
export class OrderInvoiceComponent implements OnInit, OnDestroy {
  order: Order | null = null;
  isLoading = false;
  orderId: number | null = null;

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private ordersService: OrdersService,
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
          this.router.navigate(['../../'], { relativeTo: this.route });
        }
      });
  }

  onPrint(): void {
    window.print();
  }

  onBack(): void {
    if (this.orderId) {
      this.router.navigate(['../'], { relativeTo: this.route });
    } else {
      this.router.navigate(['../../'], { relativeTo: this.route });
    }
  }

  getProductTotal(product: any): number {
    return (product.productPrice || 0) * (product.quantity || 0);
  }

  get showPayedDate(): boolean {
    return this.order?.payed === true && !!this.order?.payedAt;
  }
}

