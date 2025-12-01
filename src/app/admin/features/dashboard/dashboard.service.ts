import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Types
import { IResponse } from '../../core/models/shared.types';
import { OrderWeekOrMonthStatistics } from './dashboard.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_DASHBOARD_STATS } from '../../mocks/data/dashboard.mock';
import { MockService } from '../../core/services/mock.service';

// API Url
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Dashboard Service
 * Servicio para obtener datos y estadísticas del dashboard
 */
@Injectable({
  providedIn: 'root'
})
export class DashboardService {
  private _data: BehaviorSubject<any> = new BehaviorSubject<any>(null);
  private _stats: BehaviorSubject<OrderWeekOrMonthStatistics | null> = new BehaviorSubject<OrderWeekOrMonthStatistics | null>(null);

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) {}

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for data
   */
  get data$(): Observable<any> {
    return this._data.asObservable();
  }

  /**
   * Getter for stats
   */
  get stats$(): Observable<OrderWeekOrMonthStatistics> {
    return this._stats.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get dashboard data
   * Nota: Este endpoint puede necesitar ajuste según el backend real
   */
  getData(): Observable<any> {
    return this._httpClient.get(`${API_URL_GATEWAY}/dashboards/project`).pipe(
      tap((response: any) => {
        this._data.next(response);
      }),
      catchError((error) => {
        console.error('Error getting dashboard data:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get Order Week or Month Statistics
   *
   * @param vendorId - ID del vendedor
   * @param isWeek - true para estadísticas semanales, false para mensuales
   */
  getOrderWeekOrMonthStatistics(vendorId: string, isWeek: boolean = true): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      return this._mockService.simulateDelay({
        ok: true,
        data: MOCK_DASHBOARD_STATS
      }).pipe(
        tap((response: IResponse) => {
          if (response.data) {
            this._stats.next(response.data);
          }
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/statistics/stats/${vendorId}/${isWeek}`).pipe(
      tap((response: IResponse) => {
        if (response.data) {
          this._stats.next(response.data);
        }
      }),
      catchError((error) => {
        console.error('Error getting order statistics:', error);
        return throwError(() => error);
      })
    );
  }
}

