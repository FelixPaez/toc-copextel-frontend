import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  progress?: number;
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingSubject = new BehaviorSubject<LoadingState>({
    isLoading: false
  });

  public loading$ = this.loadingSubject.asObservable();

  /**
   * Show loading with optional message
   */
  show(message?: string): void {
    this.loadingSubject.next({
      isLoading: true,
      message
    });
  }

  /**
   * Hide loading
   */
  hide(): void {
    this.loadingSubject.next({
      isLoading: false
    });
  }

  /**
   * Show loading with progress
   */
  showWithProgress(message: string, progress: number): void {
    this.loadingSubject.next({
      isLoading: true,
      message,
      progress
    });
  }

  /**
   * Update progress
   */
  updateProgress(progress: number): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      progress
    });
  }

  /**
   * Update message
   */
  updateMessage(message: string): void {
    const currentState = this.loadingSubject.value;
    this.loadingSubject.next({
      ...currentState,
      message
    });
  }

  /**
   * Get current loading state
   */
  getLoadingState(): LoadingState {
    return this.loadingSubject.value;
  }
}
