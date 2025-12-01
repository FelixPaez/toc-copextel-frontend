import { Component, OnInit, OnDestroy, ViewChild, AfterViewInit } from '@angular/core';
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
import { MatDividerModule } from '@angular/material/divider';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, takeUntil } from 'rxjs/operators';

// Services
import { BannersService } from './banners.service';
import { ConfirmService } from '../../core/services/confirm.service';

// Types
import { Banner } from './banners.types';
import { TablePagination } from '../../core/models/shared.types';

// Constants
import { Icons } from '../../core/constants';

@Component({
  selector: 'app-banners',
  templateUrl: './banners.component.html',
  styleUrls: ['./banners.component.scss'],
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
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ]
})
export class BannersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Expose Icons for template
  Icons = Icons;

  // Table
  displayedColumns: string[] = ['title', 'subtitle', 'isActive', 'actions'];
  dataSource = new MatTableDataSource<Banner>([]);
  banners: Banner[] = [];

  // Search
  searchControl = new FormControl('');

  // Pagination
  pagination: TablePagination | null = null;
  pageSize = 10;
  pageIndex = 0;

  // Loading
  isLoading = false;

  // Private
  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _bannersService: BannersService,
    private _router: Router,
    private _activatedRoute: ActivatedRoute,
    private _snackBar: MatSnackBar,
    private _confirmService: ConfirmService
  ) { }

  ngOnInit(): void {
    // Subscribe to banners
    this._bannersService.banners$.pipe(takeUntil(this._unsubscribeAll)).subscribe(banners => {
      if (banners) {
        this.banners = banners;
        this.dataSource.data = banners;
      }
    });

    // Subscribe to pagination
    this._bannersService.pagination$.pipe(takeUntil(this._unsubscribeAll)).subscribe(pagination => {
      if (pagination) {
        this.pagination = pagination;
      }
    });

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(() => {
        this.pageIndex = 0;
        this._loadBanners();
      });

    // Load banners
    this._loadBanners();
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
    this.dataSource.sort = this.sort;
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  /**
   * Load banners
   */
  private _loadBanners(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'createdAt';
    const order = this.sort?.direction || 'desc';

    this._bannersService.getBanners(
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
        const errorMessage = error?.error?.message || error?.message || 'Error al cargar los banners';
        this._snackBar.open(errorMessage, 'Cerrar', {
          duration: 5000,
          panelClass: ['error-snackbar']
        });
      }
    });
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadBanners();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadBanners();
  }

  /**
   * On add banner
   */
  onAddBanner(): void {
    this._router.navigate(['./new'], { relativeTo: this._activatedRoute });
  }

  /**
   * On edit banner
   */
  onEdit(banner: Banner): void {
    if (banner.id) {
      this._router.navigate(['./', banner.id], { relativeTo: this._activatedRoute });
    }
  }

  /**
   * On delete banner
   */
  onDelete(banner: Banner): void {
    if (!banner.id) return;

    this._confirmService.confirm({
      title: 'Eliminar Banner',
      message: `¿Está seguro que desea eliminar el banner "${banner.title}"?`,
      icon: 'delete',
      type: 'warn'
    }).subscribe(confirmed => {
      if (confirmed) {
        this._bannersService.deleteBanner(banner.id!)
          .pipe(takeUntil(this._unsubscribeAll))
          .subscribe({
            next: () => {
              this._snackBar.open('Banner eliminado exitosamente', 'Cerrar', {
                duration: 3000,
                panelClass: ['success-snackbar']
              });
              this._loadBanners();
            },
            error: (error) => {
              const errorMessage = error?.error?.message || error?.message || 'Error al eliminar el banner';
              this._snackBar.open(errorMessage, 'Cerrar', {
                duration: 5000,
                panelClass: ['error-snackbar']
              });
            }
          });
      }
    });
  }

  /**
   * On toggle active
   */
  onToggleStatus(banner: Banner): void {
    if (!banner.id) return;

    this._bannersService.toggleBannerActive(banner.id, !banner.isActive)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: () => {
          this._snackBar.open(
            `Banner ${banner.isActive ? 'desactivado' : 'activado'} exitosamente`,
            'Cerrar',
            { duration: 3000, panelClass: ['success-snackbar'] }
          );
          this._loadBanners();
        },
        error: (error) => {
          const errorMessage = error?.error?.message || error?.message || 'Error al cambiar el estado';
          this._snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
        }
      });
  }

  /**
   * Clear filters
   */
  clearFilters(): void {
    this.searchControl.setValue('');
    this.pageIndex = 0;
    this._loadBanners();
  }
}
