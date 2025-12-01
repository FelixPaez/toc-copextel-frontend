import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { MatTabsModule } from '@angular/material/tabs';
import { LegalCustomer } from '../customers.types';

@Component({
  selector: 'app-legal-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    MatTabsModule
  ],
  templateUrl: './legal-customer-detail.component.html',
  styleUrls: ['./legal-customer-detail.component.scss']
})
export class LegalCustomerDetailComponent {
  customer: LegalCustomer;

  constructor(
    public dialogRef: MatDialogRef<LegalCustomerDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: LegalCustomer }
  ) {
    this.customer = data.customer;
  }

  getCustomerLogo(): string | null {
    return this.customer.logoUrl || this.customer.logo || null;
  }

  getCustomerInitials(): string {
    if (this.customer.name) {
      return this.customer.name.substring(0, 2).toUpperCase();
    }
    return '??';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

