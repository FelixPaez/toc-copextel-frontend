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
import { UsersService } from './users.service';

// Types
import { User } from './users.types';
import { TablePagination } from '../../core/models/shared.types';

// Components
import { UserDetailModalComponent } from './user-detail-modal/user-detail-modal.component';
import { PasswordUpdateModalComponent } from './password-update-modal/password-update-modal.component';

/**
 * Users Component
 * Componente para gestión de usuarios
 */
@Component({
  selector: 'app-users',
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
    MatSelectModule,
    MatProgressSpinnerModule,
    MatTooltipModule,
    MatDialogModule,
    MatSnackBarModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit, OnDestroy {
  @ViewChild(MatPaginator) paginator!: MatPaginator;
  @ViewChild(MatSort) sort!: MatSort;

  // Table
  displayedColumns: string[] = [
    'photo',
    'name',
    'email',
    'uo',
    'roles',
    'active',
    'actions'
  ];

  dataSource = new MatTableDataSource<User>([]);
  
  // Search
  searchControl = new FormControl('');

  // Filters
  activeFilter = new FormControl('all');
  roleFilter = new FormControl('all');

  // Data
  users: User[] = [];
  
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
    private _usersService: UsersService,
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
    // Load users
    this._loadUsers();

    // Setup search
    this.searchControl.valueChanges
      .pipe(
        debounceTime(300),
        distinctUntilChanged(),
        takeUntil(this._unsubscribeAll)
      )
      .subscribe(search => {
        this.pageIndex = 0;
        this._loadUsers();
      });

    // Setup filters
    this.activeFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    this.roleFilter.valueChanges
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(() => {
        this.pageIndex = 0;
        this._applyFilters();
      });

    // Subscribe to users
    this._usersService.users$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(users => {
        if (users) {
          this.users = users;
          this._applyFilters();
        }
      });

    // Subscribe to pagination
    this._usersService.pagination$
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
   * Load users
   */
  public loadUsers(): void {
    this._loadUsers();
  }

  /**
   * On page change
   */
  onPageChange(event: PageEvent): void {
    this.pageIndex = event.pageIndex;
    this.pageSize = event.pageSize;
    this._loadUsers();
  }

  /**
   * On sort change
   */
  onSortChange(sort: Sort): void {
    this._loadUsers();
  }

  /**
   * Get user display name
   */
  getUserDisplayName(user: User): string {
    return `${user.name} ${user.lastname1} ${user.lastname2 || ''}`.trim();
  }

  /**
   * Get user initials
   */
  getUserInitials(user: User): string {
    const firstInitial = user.name.charAt(0).toUpperCase();
    const lastInitial = user.lastname1.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }

  /**
   * Get roles display
   */
  getRolesDisplay(user: User): string {
    if (!user.roles || user.roles.length === 0) {
      return 'Sin roles';
    }
    return user.roles.join(', ');
  }

  /**
   * On add user
   */
  onAddUser(): void {
    this._router.navigate(['/admin/users/new']);
  }

  /**
   * On edit user
   */
  onEditUser(user: User): void {
    if (user.id) {
      this._router.navigate(['/admin/users', user.id, 'edit']);
    }
  }

  /**
   * On view user
   */
  onViewUser(user: User): void {
    const dialogRef = this._dialog.open(UserDetailModalComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Modal closed
    });
  }

  /**
   * On update password
   */
  onUpdatePassword(user: User): void {
    const dialogRef = this._dialog.open(PasswordUpdateModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this._snackBar.open('Contraseña actualizada exitosamente', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  /**
   * On delete user
   */
  onDeleteUser(user: User): void {
    if (!user.id) {
      this._snackBar.open('Error: ID de usuario no válido', 'Cerrar', {
        duration: 3000
      });
      return;
    }

    const displayName = this.getUserDisplayName(user);
    if (!confirm(`¿Está seguro de eliminar el usuario "${displayName}"?`)) {
      return;
    }

    this.isLoading = true;
    this._usersService.deleteUser(user.id).subscribe({
      next: () => {
        this.isLoading = false;
        this._snackBar.open('Usuario eliminado exitosamente', 'Cerrar', {
          duration: 3000
        });
        this._loadUsers();
      },
      error: (error) => {
        this.isLoading = false;
        this._snackBar.open(
          error?.error?.message || 'Error al eliminar el usuario',
          'Cerrar',
          { duration: 5000 }
        );
      }
    });
  }

  /**
   * On toggle active
   */
  onToggleActive(user: User): void {
    const updatedUser = { ...user, active: !user.active };
    this._usersService.updateUser(updatedUser).subscribe({
      next: () => {
        this._snackBar.open(
          `Usuario ${updatedUser.active ? 'activado' : 'desactivado'}`,
          'Cerrar',
          { duration: 3000 }
        );
      },
      error: (error) => {
        this._snackBar.open(
          error?.error?.message || 'Error al actualizar el usuario',
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
    this.roleFilter.setValue('all');
    this.pageIndex = 0;
    this._loadUsers();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Private methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Load users
   */
  private _loadUsers(): void {
    this.isLoading = true;

    const search = this.searchControl.value || '';
    const sort = this.sort?.active || 'name';
    const order = this.sort?.direction || 'asc';

    this._usersService.getUsers(
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
          error?.error?.message || 'Error al cargar los usuarios',
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
    let filtered = [...this.users];

    // Filter by active
    const activeFilter = this.activeFilter.value;
    if (activeFilter !== 'all') {
      filtered = filtered.filter(u => 
        activeFilter === 'active' ? u.active : !u.active
      );
    }

    // Filter by role
    const roleFilter = this.roleFilter.value;
    if (roleFilter && roleFilter !== 'all') {
      filtered = filtered.filter(u => 
        u.roles && u.roles.includes(roleFilter)
      );
    }

    // Update data source
    this.dataSource.data = filtered;
  }
}
