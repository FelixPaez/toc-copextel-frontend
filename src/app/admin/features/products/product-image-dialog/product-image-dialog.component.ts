import { Component, Inject, OnInit } from '@angular/core';
import { MAT_DIALOG_DATA, MatDialogRef, MatDialogModule } from '@angular/material/dialog';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatTooltipModule } from '@angular/material/tooltip';
import { InventoryProduct } from '../products.types';

@Component({
  selector: 'app-product-image-dialog',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatTooltipModule
  ],
  templateUrl: './product-image-dialog.component.html',
  styleUrls: ['./product-image-dialog.component.scss']
})
export class ProductImageDialogComponent implements OnInit {
  product: InventoryProduct;
  images: string[] = [];
  selectedFiles: File[] = [];
  isUploading = false;

  constructor(
    public dialogRef: MatDialogRef<ProductImageDialogComponent>,
    @Inject(MAT_DIALOG_DATA) public data: { product: InventoryProduct }
  ) {
    this.product = data.product;
  }

  ngOnInit(): void {
    if (this.product.images && Array.isArray(this.product.images)) {
      this.images = [...this.product.images];
    }
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0) {
      Array.from(input.files).forEach(file => {
        if (file.type.startsWith('image/')) {
          this.selectedFiles.push(file);
          const reader = new FileReader();
          reader.onload = (e) => {
            const src = (e.target as FileReader).result as string;
            if (!this.images.includes(src)) {
              this.images.push(src);
            }
          };
          reader.readAsDataURL(file);
        }
      });
    }
  }

  removeImage(index: number): void {
    this.images.splice(index, 1);
    // Also remove from selectedFiles if it was a new file
    if (index < this.selectedFiles.length) {
      this.selectedFiles.splice(index, 1);
    }
  }

  onSave(): void {
    this.dialogRef.close({ images: this.images });
  }

  onCancel(): void {
    this.dialogRef.close();
  }
}

