import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogModule, MatDialogRef } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { CommonModule } from '@angular/common';
import { Icons } from '../../constants/icons.constants';

export type ConfirmDialogType = 'primary' | 'warn' | 'danger' | 'success';
export interface ConfirmDialogData {
  title: string;
  message: string;
  confirmText: string;
  cancelText: string;
  icon?: string;
  subtitle?: string;
  type?: ConfirmDialogType;
}

@Component({
  selector: 'app-confirm-dialog',
  standalone: true,
  imports: [CommonModule, MatDialogModule, MatButtonModule, MatIconModule],
  templateUrl: './confirm-dialog.component.html',
  styleUrls: ['./confirm-dialog.component.scss']
})
export class ConfirmDialogComponent {
  // Exponer Icons para uso en templates
  Icons = Icons;

  constructor(
    public dialogRef: MatDialogRef<ConfirmDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: ConfirmDialogData
  ) {}

  get typeClass(): string {
    const t = this.data.type || 'primary';
    return `type-${t}`;
  }

  get iconName(): string {
    if (this.data.icon) return this.data.icon;
    const t = this.data.type || 'primary';
    switch (t) {
      case 'warn': return Icons.STATUS.WARNING_AMBER;
      case 'danger': return Icons.STATUS.REPORT;
      case 'success': return Icons.STATUS.TASK_ALT;
      default: return Icons.INFO.HELP_OUTLINE;
    }
  }
}


