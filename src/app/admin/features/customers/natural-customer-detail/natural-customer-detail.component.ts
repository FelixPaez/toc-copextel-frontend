import { Component, Inject } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule, DatePipe } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatDividerModule } from '@angular/material/divider';
import { NaturalCustomer } from '../customers.types';

@Component({
  selector: 'app-natural-customer-detail',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatDividerModule,
    DatePipe
  ],
  templateUrl: './natural-customer-detail.component.html',
  styleUrls: ['./natural-customer-detail.component.scss']
})
export class NaturalCustomerDetailComponent {
  customer: NaturalCustomer;

  constructor(
    public dialogRef: MatDialogRef<NaturalCustomerDetailComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { customer: NaturalCustomer }
  ) {
    this.customer = data.customer;
  }

  getCustomerDisplayName(): string {
    return `${this.customer.name} ${this.customer.lastname1} ${this.customer.lastname2}`.trim();
  }

  getCustomerInitials(): string {
    const firstInitial = this.customer.name ? this.customer.name.charAt(0).toUpperCase() : '';
    const lastInitial = this.customer.lastname1 ? this.customer.lastname1.charAt(0).toUpperCase() : '';
    return (firstInitial + lastInitial) || '??';
  }

  onClose(): void {
    this.dialogRef.close();
  }
}

