import { Component, OnDestroy, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
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
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

import { OnSaleProductService } from '../on-sale.service';
import { InventoryProduct } from '../products.types';
import { InventoryPagination } from '../products.types';

// Constants
import { Icons } from '../../../core/constants';

@Component({
  selector: 'app-on-sale',
  templateUrl: './on-sale.component.html',
  styleUrls: ['./on-sale.component.scss'],
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
    MatFormFieldModule,
    MatInputModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatTooltipModule
  ]
})
export class OnSaleComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = [
    'image',
    'code',
    'name',
    'category',
    'stock',
    'onSale',
    'price',
    'active',
    'actions'
  ];

  dataSource = new MatTableDataSource<InventoryProduct>([]);

  // Search
  searchControl = new FormControl('');

  // Pagination
  pagination: InventoryPagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _onSaleService: OnSaleProductService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar
  ) {}

  ngOnInit(): void {
    this._loadProducts();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this._loadProducts();
      });
  }

  ngAfterViewInit(): void {
    if (this.sort) {
      this.sort.sortChange
        .pipe(takeUntil(this._unsubscribeAll))
        .subscribe(() => {
          this.pageIndex = 0;
          this._loadProducts();
        });
    }
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadProducts();
  }

  /**
   * On view
   */
  onView(product: InventoryProduct): void {
    if (product.id) {
      this._router.navigate(['../', product.id], { relativeTo: this._activatedRoute });
    }
  }

  /**
   * Get product image
   */
  getProductImage(product: InventoryProduct): string | null {
    if (product.images && Array.isArray(product.images) && product.images.length > 0) {
      return product.images[0];
    }
    return null;
  }

  /**
   * Get product initials
   */
  getProductInitials(product: InventoryProduct): string {
    if (product.name) {
      return product.name.substring(0, 2).toUpperCase();
    }
    return '??';
  }

  /**
   * Get stock status
   */
  getStockStatus(stock: number): string {
    if (stock === 0) return 'out';
    if (stock < 10) return 'low';
    if (stock < 30) return 'medium';
    return 'high';
  }

  /**
   * Get stock percentage
   */
  getStockPercentage(stock: number, onSale: number): number {
    const total = stock + (onSale || 0);
    if (total === 0) return 0;
    return (stock / total) * 100;
  }

  /**
   * Get price display
   */
  getPriceDisplay(product: InventoryProduct): string {
    // Prioridad: Natural MLC > Natural CUP > Legal MLC > Legal CUP
    if (product.sellToNaturalPriceMlc && product.naturalPriceMlc > 0) {
      return `MLC ${product.naturalPriceMlc.toFixed(2)}`;
    }
    if (product.sellToNaturalPriceCup && product.naturalPriceCup > 0) {
      return `CUP ${product.naturalPriceCup.toFixed(2)}`;
    }
    if (product.sellToLegalPriceMlc && product.legalPriceMlc > 0) {
      return `MLC ${product.legalPriceMlc.toFixed(2)}`;
    }
    if (product.sellToLegalPriceCup && product.legalPriceCup > 0) {
      return `CUP ${product.legalPriceCup.toFixed(2)}`;
    }
    return 'N/A';
  }

  /**
   * Load products
   */
  private _loadProducts(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._onSaleService.getOnSaleProducts(
      this.pageIndex,
      this.pageSize,
      sort,
      order as 'asc' | 'desc' | '',
      search
    ).subscribe({
      next: (response) => {
        if (response.pagination) {
          this.pagination = response.pagination;
        }
        if (response.products) {
          this.dataSource.data = response.products;
        }
        this.isLoading = false;
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al cargar los productos en oferta',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }
}

