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
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { ProductsService } from './products.service';
import { CategoriesService } from '../categories/categories.service';

// Types
import { InventoryProduct } from './products.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

/**
 * Products Component
 * Componente para gestión de productos/inventario
 */
@Component({
  selector: 'app-products',
  templateUrl: './products.component.html',
  styleUrls: ['./products.component.scss'],
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
  ]
})
export class ProductsComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = [
    'code',
    'name',
    'category',
    'priceCupState',
    'priceMlcState',
    'priceCupNonState',
    'priceMlcNonState',
    'stock',
    'onSale',
    'active',
    'actions'
  ];

  dataSource = new MatTableDataSource<InventoryProduct>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  categoryFilter = new FormControl('');
  activeFilter = new FormControl('all');
  onSaleFilter = new FormControl('all');

  // Data
  products: InventoryProduct[] = [];
  categories: any[] = [];
  
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
    private _productsService: ProductsService,
    private _categoriesService: CategoriesService,
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
    // Load categories
    this._loadCategories();

    // Load products
    this._loadProducts();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadProducts();
      });

    // Setup filters
    this.categoryFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._loadProducts();
      });

    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.onSaleFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to products
    this._productsService.products$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(products => {
        if (products) {
          this.products = products;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._productsService.pagination$
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
   * Load products
   */
  public loadProducts(): void {
    this._loadProducts();
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
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadProducts();
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
   * Get stock percentage
   */
  getStockPercentage(stock: number, onSale: number): number {
    if (!stock || stock === 0) return 0;
    const total = stock + (onSale || 0);
    return Math.min(100, Math.round((stock / total) * 100));
  }

  /**
   * Get stock status
   */
  getStockStatus(stock: number): 'ok' | 'low' | 'out' {
    if (!stock || stock === 0) return 'out';
    if (stock < 10) return 'low';
    return 'ok';
  }

  /**
   * On edit
   */
  onEdit(product: InventoryProduct): void {
    this._router.navigate(['./', product.id, 'edit'], { relativeTo: this._router.routerState.root });
  }

  /**
   * On view
   */
  onView(product: InventoryProduct): void {
    this._router.navigate(['./', product.id], { relativeTo: this._router.routerState.root });
  }

  /**
   * On delete
   */
  onDelete(product: InventoryProduct): void {
    if (!confirm(`¿Está seguro de eliminar el producto "${product.name}"?`)) {
      return;
    }

    if (!product.id) {
      this._snackBar.open('Error: ID de producto no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this.isLoading = true;
    this._productsService.deleteProduct(product.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Producto eliminado correctamente', 'Cerrar', {
          duration: 3000
        });
        this._loadProducts();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar el producto',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(product: InventoryProduct): void {
    const updatedProduct = { ...product, active: !product.active };
    this._productsService.updateProduct(updatedProduct).subscribe({
      next: () => {
        this._snackBar.open(
          `Producto ${updatedProduct.active ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar el producto',
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
    this.categoryFilter.setValue('');
    this.activeFilter.setValue('all');
    this.onSaleFilter.setValue('all');
    this.pageIndex = 0;
    this._loadProducts();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load categories
   */
  private _loadCategories(): void {
    this._categoriesService.getCategories().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe({
      next: (response) => {
        if (response.categories) {
          this.categories = response.categories;
        }
      },
      error: () => {
        // Handle error silently
      }
    });
  }

  /**
   * Load products
   */
  private _loadProducts(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'orderNo';
    const order = this.sort?.direction || 'asc';

    this._productsService.getProducts(
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
          error?.error?.message || 'Error al cargar los productos',
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
    let filtered = [...this.products];

    // Filter by category
    const categoryFilter = this.categoryFilter.value;
    if (categoryFilter) {
      filtered = filtered.filter(p => 
        p.categoryId?.toString() === categoryFilter || 
        p.category?.id?.toString() === categoryFilter
      );
    }

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(p => 
        activeFilter === 'active' ? p.active : !p.active
      );
    }

    // Filter by onSale
    const onSaleFilter = this.onSaleFilter.value;
    if (onSaleFilter !== 'all') {
      filtered = filtered.filter(p => 
        onSaleFilter === 'onSale' ? (p.onSale > 0) : (p.onSale === 0)
      );
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
