import { Component, Inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatDialogRef, MAT_DIALOG_DATA, MatDialogModule } from '@angular/material/dialog';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatCardModule } from '@angular/material/card';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSlideToggleModule } from '@angular/material/slide-toggle';

export interface Service {
  id: number;
  name: string;
  specifications: string;
  priceCUP: number;
  priceMLC: number;
  active: boolean;
}

export interface ServiceDetailData {
  service: Service;
}

@Component({
  selector: 'app-service-detail-modal',
  standalone: true,
  imports: [
    CommonModule,
    MatDialogModule,
    MatButtonModule,
    MatIconModule,
    MatCardModule,
    MatFormFieldModule,
    MatInputModule,
    MatSlideToggleModule
  ],
  template: `
    <div class="service-detail-dialog">
      <h2 mat-dialog-title class="dialog-title">Detalles del Servicio</h2>
      
      <mat-dialog-content class="dialog-content">
        <div class="service-details">
          
          <!-- Información básica -->
          <div class="detail-section">
            <label class="section-label">Nombre del Servicio</label>
            <div class="detail-value service-name">{{ data.service.name }}</div>
          </div>

          <!-- Estado -->
          <div class="detail-section">
            <label class="section-label">Estado</label>
            <div class="status-container">
              <mat-slide-toggle 
                [checked]="data.service.active" 
                [disabled]="true" 
                color="primary">
                {{ data.service.active ? 'Activo' : 'Inactivo' }}
              </mat-slide-toggle>
            </div>
          </div>

          <!-- Especificaciones -->
          <div class="detail-section">
            <label class="section-label">Especificaciones</label>
            <div class="detail-value specifications">{{ data.service.specifications }}</div>
          </div>

          <!-- Precios -->
          <div class="detail-section">
            <label class="section-label">Precios</label>
            <div class="price-fields">
              <div class="price-item">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Precio CUP</mat-label>
                  <input matInput [value]="data.service.priceCUP" readonly>
                  <span matSuffix>CUP</span>
                </mat-form-field>
              </div>
              <div class="price-item">
                <mat-form-field appearance="outline" class="half-width">
                  <mat-label>Precio MLC</mat-label>
                  <input matInput [value]="data.service.priceMLC" readonly>
                  <span matSuffix>MLC</span>
                </mat-form-field>
              </div>
            </div>
          </div>

          <!-- Información adicional -->
          <div class="detail-section">
            <label class="section-label">Información Adicional</label>
            <div class="additional-info">
              <div class="info-item">
                <span class="info-label">ID del Servicio:</span>
                <span class="info-value">{{ data.service.id }}</span>
              </div>
            </div>
          </div>

        </div>
      </mat-dialog-content>

      <div class="actions-footer">
        <button mat-stroked-button type="button" (click)="onClose()">
          <mat-icon>arrow_back</mat-icon>
          Cerrar
        </button>
      </div>
    </div>
  `,
  styles: [`
    .service-detail-dialog {
      padding: 24px;
      min-width: 500px;
      max-width: 600px;

      .dialog-title {
        font-size: 20px;
        font-weight: 700;
        color: var(--admin-gray-800);
        margin: 0 0 20px 0;
        text-align: center;
      }

      .dialog-content {
        padding: 0;
        margin-bottom: 20px;

        .service-details {
          display: flex;
          flex-direction: column;
          gap: 20px;

          .detail-section {
            display: flex;
            flex-direction: column;
            gap: 8px;

            .section-label {
              font-size: 14px;
              font-weight: 600;
              color: var(--admin-gray-700);
            }

            .detail-value {
              font-size: 16px;
              color: var(--admin-gray-800);
              padding: 12px 16px;
              background: var(--admin-gray-100);
              border-radius: var(--admin-radius);
              border: 1px solid var(--admin-gray-200);

              &.service-name {
                font-weight: 600;
                font-size: 18px;
              }

              &.specifications {
                line-height: 1.6;
                white-space: pre-wrap;
                min-height: 60px;
              }
            }

            .status-container {
              padding: 16px;
              background: var(--admin-gray-100);
              border-radius: var(--admin-radius);

              .mat-mdc-slide-toggle {
                pointer-events: none;
                
                .mdc-switch {
                  .mdc-switch__track {
                    background-color: var(--admin-gray-300);
                  }

                  &.mdc-switch--checked .mdc-switch__track {
                    background-color: var(--admin-primary);
                  }
                }
              }
            }

            .price-fields {
              display: flex;
              gap: 16px;

              .price-item {
                flex: 1;

                .half-width {
                  width: 100%;
                }

                .mat-mdc-form-field {
                  .mat-mdc-text-field-wrapper {
                    background-color: var(--admin-gray-100);
                  }

                  .mat-mdc-input-element {
                    color: var(--admin-gray-800);
                  }
                }
              }
            }

            .additional-info {
              padding: 16px;
              background: var(--admin-gray-100);
              border-radius: var(--admin-radius);

              .info-item {
                display: flex;
                justify-content: space-between;
                align-items: center;
                padding: 8px 0;
                border-bottom: 1px solid var(--admin-gray-200);

                &:last-child {
                  border-bottom: none;
                }

                .info-label {
                  font-size: 14px;
                  color: var(--admin-gray-600);
                  font-weight: 500;
                }

                .info-value {
                  font-size: 14px;
                  color: var(--admin-gray-800);
                  font-weight: 600;
                }
              }
            }
          }
        }
      }

      .actions-footer { 
        margin-top: 24px;
        padding: 16px 0; 
        display: flex; 
        gap: 12px; 
        justify-content: flex-end; 
      }
    }

    /* Responsive */
    @media (max-width: 768px) {
      .service-detail-dialog {
        min-width: 300px;
        padding: 16px;

        .price-fields {
          flex-direction: column;
          gap: 12px;

          .price-item {
            width: 100%;
          }
        }

        .actions-footer {
          flex-direction: column;

          button {
            width: 100%;
          }
        }
      }
    }
  `]
})
export class ServiceDetailModal {
  constructor(
    public dialogRef: MatDialogRef<ServiceDetailModal>,
    @Inject(MAT_DIALOG_DATA) public data: ServiceDetailData
  ) {}

  onClose(): void {
    this.dialogRef.close();
  }

  formatPrice(price: number): string {
    return new Intl.NumberFormat('es-CU', {
      style: 'currency',
      currency: 'CUP',
      minimumFractionDigits: 2
    }).format(price);
  }
}
