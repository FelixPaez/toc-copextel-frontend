import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { LegalCustomer, NaturalCustomer } from './customers.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_NATURAL_CUSTOMERS, MOCK_LEGAL_CUSTOMERS } from '../../mocks/data/customers.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

// API Url
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Customers Service
 * Servicio para gestión de clientes (naturales y legales)
 */
@Injectable({
  providedIn: 'root'
})
export class CustomersService {

  // Private
  private _naturals: BehaviorSubject<NaturalCustomer[] | null> = new BehaviorSubject<NaturalCustomer[] | null>(null);
  private _naturalsArr: BehaviorSubject<NaturalCustomer[] | null> = new BehaviorSubject<NaturalCustomer[] | null>(null);
  private _legals: BehaviorSubject<LegalCustomer[] | null> = new BehaviorSubject<LegalCustomer[] | null>(null);
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for natural customers
   */
  get naturals$(): Observable<NaturalCustomer[]> {
    return this._naturals.asObservable();
  }

  /**
   * Getter for naturalArr customers
   */
  get naturalsArr$(): Observable<NaturalCustomer[]> {
    return this._naturalsArr.asObservable();
  }

  /**
   * Getter for legal customers
   */
  get legals$(): Observable<LegalCustomer[]> {
    return this._legals.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<TablePagination> {
    return this._pagination.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get natural customers
   *
   * @param [page=0]
   * @param [size=10]
   * @param [sort='orderNo']
   * @param [order='asc']
   * @param [search='']
   */
  public getNaturalCustomers(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_NATURAL_CUSTOMERS,
        page,
        size,
        sort || 'id',
        order,
        search,
        ['name', 'lastname1', 'email', 'phone', 'idNumber'] as (keyof NaturalCustomer)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        clients: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
          if (response.clients) {
            this._naturals.next(response.clients);
            this._naturalsArr.next(response.clients);
          }
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/auth/client/users`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response) => {
        // Set pagination
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }

        // Store customers lists
        if (response.clients) {
          this._naturals.next(response.clients);
          this._naturalsArr.next(response.clients);
        }
      }),
      catchError((error) => {
        console.error('Error getting natural customers:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get legal customers
   * Nota: Actualmente retorna el observable, puede necesitar implementación de API
   */
  getLegalCustomers(): Observable<LegalCustomer[]> {
    // Mock mode
    if (this._mockService.isMockMode) {
      return this._mockService.simulateDelay(MOCK_LEGAL_CUSTOMERS).pipe(
        tap((legals) => {
          this._legals.next(legals);
        })
      );
    }
    
    // TODO: Implementar endpoint cuando esté disponible
    // return this._httpClient.get<LegalCustomer[]>(`${API_URL_GATEWAY}/auth/client/legals`).pipe(
    //     tap((legals) => {
    //         this._legals.next(legals);
    //     })
    // );
    return this._legals.asObservable();
  }
}

