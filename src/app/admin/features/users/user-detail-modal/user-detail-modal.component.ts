import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';

export interface UserDetailData {
  user: {
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
  };
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
    return `${user.name} ${user.lastName} ${user.secondLastName || ''}`.trim();
  }

  getUserInitials(): string {
    const user = this.data.user;
    const firstInitial = user.name.charAt(0).toUpperCase();
    const lastInitial = user.lastName.charAt(0).toUpperCase();
    return firstInitial + lastInitial;
  }
}
