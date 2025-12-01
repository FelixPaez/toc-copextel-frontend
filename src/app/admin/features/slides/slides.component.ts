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
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { SlidesService } from './slides.service';
import { ConfirmService } from '../../core/services/confirm.service';

// Types
import { Slide } from './slides.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

// Components
import { SlideFormComponent } from './slide-form/slide-form.component';

/**
 * Slides Component
 * Componente para gestión de slides/banners
 */
@Component({
  selector: 'app-slides',
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
  ],
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss']
})
export class SlidesComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = ['image', 'title', 'subtitle', 'active', 'actions'];
  dataSource = new MatTableDataSource<Slide>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');

  // Data
  slides: Slide[] = [];
  
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
    private _slidesService: SlidesService,
    private _router: Router,
    private _dialog: MatDialog,
    private _snackBar: MatSnackBar,
    private _confirmService: ConfirmService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Lifecycle hooks
  // -----------------------------------------------------------------------------------------------------

  /**
   * On init
   */
  ngOnInit(): void {
    // Load slides
    this._loadSlides();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadSlides();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to slides
    this._slidesService.slides$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(slides => {
        if (slides) {
          this.slides = slides;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._slidesService.pagination$
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
   * Load slides
   */
  public loadSlides(): void {
    this._loadSlides();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadSlides();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadSlides();
  }

  /**
   * On add slide
   */
  onAddSlide(): void {
    const dialogRef = this._dialog.open(SlideFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        this._slidesService.createSlide(result).subscribe({
          next: () => {
            this._snackBar.open('Diapositiva agregada exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadSlides();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al agregar la diapositiva',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On edit slide
   */
  onEditSlide(slide: Slide): void {
    const dialogRef = this._dialog.open(SlideFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { slide }
    });

    dialogRef.afterClosed().pipe(
      takeUntil(this._unsubscribeAll)
    ).subscribe(result => {
      if (result) {
        const updatedSlide = { ...slide, ...result };
        this._slidesService.updateSlide(updatedSlide).subscribe({
          next: () => {
            this._snackBar.open('Diapositiva actualizada exitosamente', 'Cerrar', {
              duration: 3000,
              horizontalPosition: 'center',
              verticalPosition: 'top'
            });
            this._loadSlides();
          },
          error: (error) => {
            this._snackBar.open(
              error?.error?.message || 'Error al actualizar la diapositiva',
              'Cerrar',
              { duration: 5000 }
            );
          }
        });
      }
    });
  }

  /**
   * On delete slide
   */
  onDeleteSlide(slide: Slide): void {
    if (!slide.id) {
      this._snackBar.open('Error: ID de diapositiva no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    this._confirmService.confirm({
      title: 'Eliminar Diapositiva',
      message: `¿Está seguro de eliminar la diapositiva "${slide.title}"?`,
      icon: 'delete',
      type: 'warn',
      confirmText: 'Eliminar',
      cancelText: 'Cancelar'
    }).pipe(takeUntil(this._unsubscribeAll)).subscribe(confirmed => {
      if (!confirmed) {
      return;
    }

    this.isLoading = true;
    this._slidesService.deleteSlide(slide.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Diapositiva eliminada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
            verticalPosition: 'top',
            panelClass: ['success-snackbar']
        });
        this._loadSlides();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar la diapositiva',
          'Cerrar',
            { duration: 5000, panelClass: ['error-snackbar'] }
        );
      }
      });
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(slide: Slide): void {
    const updatedSlide = { ...slide, active: !slide.active };
    this._slidesService.updateSlide(updatedSlide).subscribe({
      next: () => {
        this._snackBar.open(
          `Diapositiva ${updatedSlide.active ? 'activada' : 'desactivada'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar la diapositiva',
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
    this._loadSlides();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load slides
   */
  private _loadSlides(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._slidesService.getSortsSlides(
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
          error?.error?.message || 'Error al cargar las diapositivas',
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
    let filtered = [...this.slides];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(s => 
        activeFilter === 'active' ? s.active : !s.active
      );
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
