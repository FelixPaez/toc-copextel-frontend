import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable } from 'rxjs';
import { tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { LegalCustomer, NaturalCustomer } from './customers.types';

// Variables
import { environment } from '../../../../environments/environment';

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
    private _httpClient: HttpClient
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
      })
    );
  }

  /**
   * Get legal customers
   * Nota: Actualmente retorna el observable, puede necesitar implementación de API
   */
  getLegalCustomers(): Observable<LegalCustomer[]> {
    // TODO: Implementar endpoint cuando esté disponible
    // return this._httpClient.get<LegalCustomer[]>(`${API_URL_GATEWAY}/auth/client/legals`).pipe(
    //     tap((legals) => {
    //         this._legals.next(legals);
    //     })
    // );
    return this._legals.asObservable();
  }
}

