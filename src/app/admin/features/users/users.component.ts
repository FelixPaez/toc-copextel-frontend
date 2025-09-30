import { Component, OnInit, ViewChild, AfterViewInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule, MatTableDataSource } from '@angular/material/table';
import { MatPaginator, MatPaginatorModule } from '@angular/material/paginator';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { FormControl, ReactiveFormsModule } from '@angular/forms';
import { debounceTime, distinctUntilChanged } from 'rxjs/operators';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { Router } from '@angular/router';

import { UserFormComponent } from './user-form/user-form.component';
import { UserDetailModalComponent } from './user-detail-modal/user-detail-modal.component';
import { PasswordUpdateModalComponent } from './password-update-modal/password-update-modal.component';

export interface User {
  id: number;
  name: string;
  lastName: string;
  secondLastName?: string;
  email: string;
  identityNumber: string;
  store: string;
  roles: string[];
  gender: string;
  active: boolean;
  organizationalUnit: string;
  hasPhoto: boolean;
}

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatPaginatorModule,
    MatDialogModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './users.component.html',
  styleUrls: ['./users.component.scss']
})
export class UsersComponent implements OnInit, AfterViewInit {
  users: User[] = [
    { 
      id: 1, 
      name: 'Administrador',
      lastName: '',
      secondLastName: '',
      email: 'tocadmin@tic.copextel.com.cu',
      identityNumber: '99121212121',
      store: 'Tienda Online de Copextel',
      roles: ['Administrador Del Sistema'],
      gender: 'Masculino',
      active: true,
      organizationalUnit: 'Tienda Online de Copextel',
      hasPhoto: false
    },
    { 
      id: 2, 
      name: 'Vendedor',
      lastName: 'De Prueba',
      secondLastName: 'Tecnostar',
      email: 'vendedor@tic.copextel.com.cu',
      identityNumber: '99121212122',
      store: 'Tecnostar Informática y Comunicaciones',
      roles: ['Vendedor'],
      gender: 'Masculino',
      active: true,
      organizationalUnit: 'Tecnostar Informática y Comunicaciones',
      hasPhoto: false
    }
  ];

  dataSource = new MatTableDataSource<User>(this.users);
  displayedColumns: string[] = ['photo', 'name', 'active', 'actions'];
  searchControl = new FormControl('');

  @ViewChild(MatPaginator) paginator!: MatPaginator;

  constructor(
    private router: Router,
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.searchControl.valueChanges.pipe(
      debounceTime(300),
      distinctUntilChanged()
    ).subscribe(value => {
      this.applyFilter(value || '');
    });
  }

  ngAfterViewInit(): void {
    this.dataSource.paginator = this.paginator;
  }

  applyFilter(filterValue: string): void {
    this.dataSource.filter = filterValue.trim().toLowerCase();
    if (this.dataSource.paginator) {
      this.dataSource.paginator.firstPage();
    }
  }

  onAddUser(): void {
    this.router.navigate(['/users/new']);
  }

  onEditUser(user: User): void {
    this.router.navigate(['/users/edit', user.id]);
  }

  onViewUser(user: User): void {
    const dialogRef = this.dialog.open(UserDetailModalComponent, {
      width: '400px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      // Modal closed
    });
  }

  onUpdatePassword(user: User): void {
    const dialogRef = this.dialog.open(PasswordUpdateModalComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { user }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        this.snackBar.open('Contraseña actualizada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onDeleteUser(user: User): void {
    if (confirm(`¿Estás seguro de que deseas eliminar el usuario "${user.name} ${user.lastName} ${user.secondLastName || ''}"?`)) {
      this.users = this.users.filter(u => u.id !== user.id);
      this.dataSource.data = this.users;
      this.snackBar.open('Usuario eliminado exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  getUserDisplayName(user: User): string {
    return `${user.name} ${user.lastName} ${user.secondLastName || ''}`.trim();
  }

  getUserInitials(user: User): string {
    const firstInitial = user.name.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }
}
