import { Component, OnDestroy, OnInit } from '@angular/core';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { FormArray, FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatSnackBar, MatSnackBarModule } from '@angular/material/snack-bar';
import { MatDialog, MatDialogModule } from '@angular/material/dialog';
import { MatTooltipModule } from '@angular/material/tooltip';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';

import { ProductsService } from '../products.service';
import { CategoriesService } from '../../categories/categories.service';
import { CopextelServicesService } from '../../services/services.service';
import { AuthService } from '../../../core/services/auth.service';
import { ConfirmService } from '../../../core/services/confirm.service';
import { InventoryProduct, InventoryCategory } from '../products.types';
import { Category } from '../../categories/categories.types';
import { CopextelService } from '../../services/services.types';
import { ProductImageDialogComponent } from '../product-image-dialog/product-image-dialog.component';

@Component({
  selector: 'app-product-detail',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    ReactiveFormsModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatSlideToggleModule,
    MatExpansionModule,
    MatProgressSpinnerModule,
    MatSnackBarModule,
    MatDialogModule,
    MatTooltipModule
  ],
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.scss']
})
export class ProductDetailComponent implements OnInit, OnDestroy {
  productForm: FormGroup;
  isEditMode = false;
  productId: number | null = null;
  isLoading = false;
  isSaving = false;
  product: InventoryProduct | null = null;

  categories: Category[] = [];
  services: CopextelService[] = [];
  units = ['U', 'kg', 'L'];

  // Expansion panels state
  generalInfoExpanded = true;
  pricesExpanded = false;
  servicesExpanded = false;
  imagesExpanded = false;

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private router: Router,
    private productsService: ProductsService,
    private categoriesService: CategoriesService,
    private servicesService: CopextelServicesService,
    private authService: AuthService,
    private confirmService: ConfirmService,
    private snackBar: MatSnackBar,
    private dialog: MatDialog
  ) {
    this.productForm = this.fb.group({
      id: [null],
      name: ['', Validators.required],
      code: [''],
      description: [''],
      categoryId: [null, Validators.required],
      stock: [0, [Validators.required, Validators.min(0)]],
      onSale: [0, [Validators.min(0)]],
      unit: ['U', Validators.required],
      guaranty: [''],
      weight: [''],
      volume: [''],
      dimensions: [''],
      active: [true],
      
      // Legal customer prices
      sellToLegalCustomer: [false],
      sellToLegalPriceCup: [false],
      legalPriceCup: [0, [Validators.min(0)]],
      sellToLegalPriceMlc: [false],
      legalPriceMlc: [0, [Validators.min(0)]],
      
      // Natural customer prices
      sellToNaturalCustomer: [false],
      sellToNaturalPriceCup: [false],
      naturalPriceCup: [0, [Validators.min(0)]],
      sellToNaturalPriceMlc: [false],
      naturalPriceMlc: [0, [Validators.min(0)]],
      
      // Pymes customer prices
      sellToPymesCustomer: [false],
      sellToPymesPriceCup: [false],
      pymesPriceCup: [0, [Validators.min(0)]],
      sellToPymesPriceMlc: [false],
      pymesPriceMlc: [0, [Validators.min(0)]],
      
      services: this.fb.array([]),
      images: this.fb.array([])
    }, {
      validators: this._checkOnSaleQty('stock', 'onSale')
    });
  }

  ngOnInit(): void {
    this.route.params
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(params => {
        this.productId = +params['id'];
        this.isEditMode = !!this.productId;
        
        if (this.isEditMode && this.productId) {
          this.loadProduct();
        }
      });

    // Load categories
    this.categoriesService.getCategories().subscribe();
    this.categoriesService.categories$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(categories => {
        this.categories = categories || [];
      });

    // Load services
    this.servicesService.getServices().subscribe();
    this.servicesService.services$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(services => {
        this.services = services || [];
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  loadProduct(): void {
    if (!this.productId) return;

    this.isLoading = true;
    this.productsService.getProductById(this.productId)
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe({
        next: (product) => {
          this.product = product;
          this.productForm.patchValue({
            ...product,
            categoryId: product.categoryId || product.category?.id
          });

          // Setup services form array
          if (product.services && product.services.length > 0) {
            const servicesArray = this.productForm.get('services') as FormArray;
            servicesArray.clear();
            product.services.forEach(service => {
              servicesArray.push(this.fb.group({ id: [service] }));
            });
          }

          // Setup images form array
          if (product.images && product.images.length > 0) {
            const imagesArray = this.productForm.get('images') as FormArray;
            imagesArray.clear();
            product.images.forEach(image => {
              imagesArray.push(this.fb.control(image));
            });
          }

          this.isLoading = false;
        },
        error: (error) => {
          this.isLoading = false;
          const errorMessage = error?.error?.message || error?.message || 'Error al cargar el producto';
          this.snackBar.open(errorMessage, 'Cerrar', {
            duration: 5000,
            panelClass: ['error-snackbar']
          });
          this.router.navigate(['../'], { relativeTo: this.route });
        }
      });
  }

  onSubmit(): void {
    if (this.productForm.invalid) {
      return;
    }

    this.confirmService.confirm({
      title: this.isEditMode ? 'Actualizar Producto' : 'Crear Producto',
      message: '¿Está seguro que toda la información es correcta?',
      icon: 'help_outline',
      type: 'primary'
    }).subscribe(confirmed => {
      if (confirmed) {
        this.isSaving = true;
        const formData = this.productForm.getRawValue();
        
        // Prepare product data
        const productData: InventoryProduct = {
          ...formData,
          uo: this.authService.getCurrentUser()?.vendorId || '',
          images: (this.productForm.get('images') as FormArray).value
        };

        if (this.isEditMode && this.productId) {
          productData.id = this.productId;
          this.productsService.updateProduct(productData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.snackBar.open('Producto actualizado exitosamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.router.navigate(['../'], { relativeTo: this.route });
              },
              error: (error) => {
                this.isSaving = false;
                const errorMessage = error?.error?.message || error?.message || 'Error al actualizar el producto';
                this.snackBar.open(errorMessage, 'Cerrar', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        } else {
          this.productsService.createProduct(productData)
            .pipe(takeUntil(this._unsubscribeAll))
            .subscribe({
              next: () => {
                this.isSaving = false;
                this.snackBar.open('Producto creado exitosamente', 'Cerrar', {
                  duration: 3000,
                  panelClass: ['success-snackbar']
                });
                this.router.navigate(['../'], { relativeTo: this.route });
              },
              error: (error) => {
                this.isSaving = false;
                const errorMessage = error?.error?.message || error?.message || 'Error al crear el producto';
                this.snackBar.open(errorMessage, 'Cerrar', {
                  duration: 5000,
                  panelClass: ['error-snackbar']
                });
              }
            });
        }
      }
    });
  }

  onCancel(): void {
    this.router.navigate(['../'], { relativeTo: this.route });
  }

  onManageImages(): void {
    if (!this.product) return;

    const dialogRef = this.dialog.open(ProductImageDialogComponent, {
      width: '800px',
      maxWidth: '95vw',
      data: { product: this.product }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result && result.images) {
        const imagesArray = this.productForm.get('images') as FormArray;
        imagesArray.clear();
        result.images.forEach((image: string) => {
          imagesArray.push(this.fb.control(image));
        });
        if (this.product) {
          this.product.images = result.images;
        }
      }
    });
  }

  get servicesFormArray(): FormArray {
    return this.productForm.get('services') as FormArray;
  }

  get imagesFormArray(): FormArray {
    return this.productForm.get('images') as FormArray;
  }

  addService(): void {
    const servicesArray = this.productForm.get('services') as FormArray;
    servicesArray.push(this.fb.group({ id: [null] }));
  }

  removeService(index: number): void {
    const servicesArray = this.productForm.get('services') as FormArray;
    servicesArray.removeAt(index);
  }

  private _checkOnSaleQty(stockControl: string, onSaleControl: string) {
    return (formGroup: FormGroup) => {
      const stock = formGroup.get(stockControl);
      const onSale = formGroup.get(onSaleControl);

      if (!stock || !onSale) {
        return null;
      }

      if (onSale.value > stock.value) {
        onSale.setErrors({ invalid: 'La cantidad en venta no puede ser mayor que la cantidad disponible' });
        return { invalid: true };
      }

      onSale.setErrors(null);
      return null;
    };
  }
}

