import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatTableModule } from '@angular/material/table';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Router } from '@angular/router';

// Components
import { SlideFormComponent } from './slide-form/slide-form.component';

// Models
export interface Slide {
  id: number;
  title: string;
  subtitle: string;
  imageUrl?: string;
  active: boolean;
}

@Component({
  selector: 'app-slides',
  standalone: true,
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule,
    MatIconModule,
    MatTableModule,
    MatDialogModule
  ],
  templateUrl: './slides.component.html',
  styleUrls: ['./slides.component.scss']
})
export class SlidesComponent implements OnInit {
  // Slides data
  slides: Slide[] = [
    { id: 1, title: 'qweqwe', subtitle: 'qweqwe', active: true },
    { id: 2, title: 'Diapositiva 2', subtitle: 'Subtítulo de ejemplo', active: false },
    { id: 3, title: 'Diapositiva 3', subtitle: 'Otro subtítulo', active: true }
  ];
  
  displayedColumns: string[] = ['title', 'subtitle', 'active', 'actions'];

  constructor(
    private dialog: MatDialog,
    private snackBar: MatSnackBar,
    private router: Router
  ) { }

  ngOnInit(): void {
    // Component initialization
  }

  // Slides actions
  onAddSlide(): void {
    const dialogRef = this.dialog.open(SlideFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const newSlide: Slide = {
          id: this.slides.length + 1,
          title: result.title,
          subtitle: result.subtitle,
          imageUrl: result.imageUrl,
          active: result.active
        };
        this.slides.push(newSlide);
        this.snackBar.open('Diapositiva agregada exitosamente!', 'Cerrar', {
          duration: 3000,
          horizontalPosition: 'center',
          verticalPosition: 'top'
        });
      }
    });
  }

  onEditSlide(slide: Slide): void {
    const dialogRef = this.dialog.open(SlideFormComponent, {
      width: '600px',
      maxWidth: '90vw',
      disableClose: true,
      autoFocus: false,
      data: { slide }
    });

    dialogRef.afterClosed().subscribe(result => {
      if (result) {
        const index = this.slides.findIndex(s => s.id === slide.id);
        if (index !== -1) {
          this.slides[index] = { ...slide, ...result };
          this.snackBar.open('Diapositiva actualizada exitosamente!', 'Cerrar', {
            duration: 3000,
            horizontalPosition: 'center',
            verticalPosition: 'top'
          });
        }
      }
    });
  }

  onDeleteSlide(slide: Slide): void {
    if (confirm(`¿Estás seguro de que deseas eliminar la diapositiva "${slide.title}"?`)) {
      this.slides = this.slides.filter(s => s.id !== slide.id);
      this.snackBar.open('Diapositiva eliminada exitosamente!', 'Cerrar', {
        duration: 3000,
        horizontalPosition: 'center',
        verticalPosition: 'top'
      });
    }
  }
}
