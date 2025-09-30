import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatExpansionModule } from '@angular/material/expansion';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';

// Components
import { CategoryFormComponent } from './category-form/category-form.component';
import { SubcategoryFormComponent } from './subcategory-form/subcategory-form.component';

// Models
export interface Category {
  id: number;
  name: string;
  active: boolean;
}

export interface Subcategory {
  id: number;
  name: string;
  categoryId: number;
  active: boolean;
}

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatExpansionModule,
    MatDialogModule
  ],
  templateUrl: './categories.component.html',
  styleUrls: ['./categories.component.scss']
})
export class CategoriesComponent implements OnInit {
  // Categories
  categories: Category[] = [
    { id: 1, name: 'Accesorios', active: true },
    { id: 2, name: 'Electrodomésticos', active: true },
    { id: 3, name: 'Ofimática', active: true },
    { id: 4, name: 'Muebles', active: true }
  ];
  
  categoriesDisplayedColumns: string[] = ['name', 'active', 'actions'];

  // Subcategories
  subcategories: Subcategory[] = [
    { id: 1, name: 'Adornos', categoryId: 4, active: true },
    { id: 2, name: 'Muebles', categoryId: 4, active: true },
    { id: 3, name: 'Escritorios', categoryId: 4, active: true },
    { id: 4, name: 'Sillas', categoryId: 4, active: true }
  ];
  
  subcategoriesDisplayedColumns: string[] = ['name', 'active', 'actions'];

  // State
  categoriesExpanded = false;
  subcategoriesExpanded = false;

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    // Component initialization
  }

  // Categories actions
  onAddCategory(): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newCategory: Category = {
          id: this.categories.length + 1,
          name: result.name,
          active: result.active
        };
        this.categories.push(newCategory);
        this.snackBar.open('Categoría agregada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onEditCategory(category: Category): void {
    const dialogRef = this.dialog.open(CategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { category }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.categories.findIndex(c => c.id === category.id);
        if (index !== -1) {
          this.categories[index] = { ...category, ...result };
          this.snackBar.open('Categoría actualizada exitosamente!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
    });
  }

  onDeleteCategory(category: Category): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la categoría "${category.name}"?`)) {
      this.categories = this.categories.filter(c => c.id !== category.id);
      this.snackBar.open('Categoría eliminada exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  // Subcategories actions
  onAddSubcategory(): void {
    const dialogRef = this.dialog.open(SubcategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { categories: this.categories }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newSubcategory: Subcategory = {
          id: this.subcategories.length + 1,
          name: result.name,
          categoryId: result.categoryId,
          active: result.active
        };
        this.subcategories.push(newSubcategory);
        this.snackBar.open('Subcategoría agregada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onEditSubcategory(subcategory: Subcategory): void {
    const dialogRef = this.dialog.open(SubcategoryFormComponent, {
      width: '500px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { 
        subcategory,
        categories: this.categories
      }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.subcategories.findIndex(s => s.id === subcategory.id);
        if (index !== -1) {
          this.subcategories[index] = { ...subcategory, ...result };
          this.snackBar.open('Subcategoría actualizada exitosamente!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
    });
  }

  onDeleteSubcategory(subcategory: Subcategory): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la subcategoría "${subcategory.name}"?`)) {
      this.subcategories = this.subcategories.filter(s => s.id !== subcategory.id);
      this.snackBar.open('Subcategoría eliminada exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }

  getCategoryName(categoryId: number): string {
    const category = this.categories.find(c => c.id === categoryId);
    return category ? category.name : 'Sin categoría';
  }
}
