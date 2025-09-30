import { Injectable } from '@angular/core';
import { MatSnackBar, MatSnackBarConfig } from '@angular/material/snack-bar';

export interface NotificationConfig {
  duration?: number;
  horizontalPosition?: 'start' | 'center' | 'end' | 'left' | 'right';
  verticalPosition?: 'top' | 'bottom';
  panelClass?: string | string[];
}

@Injectable({
  providedIn: 'root'
})
export class NotificationService {
  private defaultConfig: MatSnackBarConfig = {
    duration: 5000,
    horizontalPosition: 'end',
    verticalPosition: 'top',
    panelClass: []
  };

  constructor(private snackBar: MatSnackBar) {}

  /**
   * Show success notification
   */
  success(message: string, title?: string, config?: NotificationConfig): void {
    const finalConfig = this.getConfig(config, 'success-notification');
    const displayMessage = title ? `${title}: ${message}` : message;
    
    this.snackBar.open(displayMessage, 'Close', finalConfig);
  }

  /**
   * Show error notification
   */
  error(message: string, title?: string, config?: NotificationConfig): void {
    const finalConfig = this.getConfig(config, 'error-notification');
    const displayMessage = title ? `${title}: ${message}` : message;
    
    this.snackBar.open(displayMessage, 'Close', finalConfig);
  }

  /**
   * Show warning notification
   */
  warning(message: string, title?: string, config?: NotificationConfig): void {
    const finalConfig = this.getConfig(config, 'warning-notification');
    const displayMessage = title ? `${title}: ${message}` : message;
    
    this.snackBar.open(displayMessage, 'Close', finalConfig);
  }

  /**
   * Show info notification
   */
  info(message: string, title?: string, config?: NotificationConfig): void {
    const finalConfig = this.getConfig(config, 'info-notification');
    const displayMessage = title ? `${title}: ${message}` : message;
    
    this.snackBar.open(displayMessage, 'Close', finalConfig);
  }

  /**
   * Show custom notification
   */
  custom(message: string, action?: string, config?: NotificationConfig): void {
    const finalConfig = this.getConfig(config);
    
    this.snackBar.open(message, action || 'Close', finalConfig);
  }

  /**
   * Dismiss all notifications
   */
  dismiss(): void {
    this.snackBar.dismiss();
  }

  /**
   * Get final configuration
   */
  private getConfig(config?: NotificationConfig, panelClass?: string): MatSnackBarConfig {
    const finalConfig: MatSnackBarConfig = {
      ...this.defaultConfig,
      ...config
    };

    if (panelClass) {
      finalConfig.panelClass = Array.isArray(finalConfig.panelClass) 
        ? [...finalConfig.panelClass!, panelClass]
        : [finalConfig.panelClass!, panelClass];
    }

    return finalConfig;
  }
}
