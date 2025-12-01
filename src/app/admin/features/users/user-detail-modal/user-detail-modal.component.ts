import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

import { User } from '../users.types';

export interface UserDetailData {
  user: User;
}

@Component({
  selector: 'app-user-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule
  ],
  templateUrl: './user-detail-modal.component.html',
  styleUrls: ['./user-detail-modal.component.scss']
})
export class UserDetailModalComponent {
  constructor(
    private dialogRef: MatDialogRef<UserDetailModalComponent>,
    @Inject(MAT_DIALOG_DATA) public data: UserDetailData
  ) { }

  onClose(): void {
    this.dialogRef.close();
  }

  getUserDisplayName(): string {
    const user = this.data.user;
    return `${user.name || ''} ${user.lastname1 || ''} ${user.lastname2 || ''}`.trim();
  }

  getUserInitials(): string {
    const user = this.data.user;
    const name = user.name || '';
    const lastname1 = user.lastname1 || '';
    
    if (!name && !lastname1) {
      return '??';
    }
    
    const firstInitial = name ? name.charAt(0).toUpperCase() : '';
    const lastInitial = lastname1 ? lastname1.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || '??';
  }
}
