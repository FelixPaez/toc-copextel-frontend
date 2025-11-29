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
import { MatExpansionModule } from '@angular/material/expansion';
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
import { CategoriesService } from './categories.service';

// Types
import { Category } from './categories.types';
import { TablePagination } from '../../core/models/shared.types';

// Components
import { CategoryFormComponent } from './category-form/category-form.component';
import { SubcategoryFormComponent } from './subcategory-form/subcategory-form.component';

/**
 * Categories Component
 * Componente para gestión de categorías
 */
@Component({
  selector: 'app-categories',
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
    MatExpansionModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table
  displayedColumns: string[] = ['name', 'active', 'actions'];
  dataSource = new MatTableDataSource<Category>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');

  // Data
  categories: Category[] = [];
  
  // Pagination
  pagination: TablePagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // State
  categoriesExpanded = false;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  /**
   * Constructor
   */
  constructor(
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

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadCategories();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to categories
    this._categoriesService.categories$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(categories => {
        if (categories) {
          this.categories = categories;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._categoriesService.pagination$
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
   * Load categories
   */
  public loadCategories(): void {
    this._loadCategories();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadCategories();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadCategories();
  }

  /**
   * On add category
   */
  onAddCategory(): void {
    const dialogRef = this._dialog.open(CategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        this._categoriesService.createCategory(result).subscribe({
          next: () => {
            this._snackBar.open('Categoría agregada exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadCategories();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al agregar la categoría',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On edit category
   */
  onEditCategory(category: Category): void {
    const dialogRef = this._dialog.open(CategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { category }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        const updatedCategory = { ...category, ...result };
        this._categoriesService.updateCategory(updatedCategory).subscribe({
          next: () => {
            this._snackBar.open('Categoría actualizada exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadCategories();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al actualizar la categoría',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On delete category
   */
  onDeleteCategory(category: Category): void {
    if (!category.id) {
      this._snackBar.open('Error: ID de categoría no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    if (!confirm(`¿Está seguro de eliminar la categoría "${category.name}"?`)) {
      return;
    }

    this.isLoading = true;
    this._categoriesService.deleteCategory(category.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Categoría eliminada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
        this._loadCategories();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar la categoría',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(category: Category): void {
    const updatedCategory = { ...category, active: !category.active };
    this._categoriesService.updateCategory(updatedCategory).subscribe({
      next: () => {
        this._snackBar.open(
          `Categoría ${updatedCategory.active ? 'activada' : 'desactivada'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar la categoría',
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
    this.pageIndex = 0;
    this._loadCategories();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load categories
   */
  private _loadCategories(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._categoriesService.getSortsCategories(
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
          error?.error?.message || 'Error al cargar las categorías',
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
    let filtered = [...this.categories];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(c => 
        activeFilter === 'active' ? c.active : !c.active
      );
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
