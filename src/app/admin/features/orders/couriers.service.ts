import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Courier } from './couriers.types';

// Variables
import { environment } from '../../../../environments/environment';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Couriers Service
 * Servicio para gestión de transportistas
 */
@Injectable({
  providedIn: 'root'
})
export class CouriersService {

  // Private properties
  private _courier: BehaviorSubject<Courier | null> = new BehaviorSubject<Courier | null>(null);
  private _couriers: BehaviorSubject<Courier[] | null> = new BehaviorSubject<Courier[] | null>(null);
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) { }

  // -----------------------------------------------------------------------------------------------------
  // @ Accessors
  // -----------------------------------------------------------------------------------------------------

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<TablePagination> {
    return this._pagination.asObservable();
  }

  /**
   * Getter for courier
   */
  get courier$(): Observable<Courier> {
    return this._courier.asObservable();
  }

  /**
   * Getter for couriers
   */
  get couriers$(): Observable<Courier[]> {
    return this._couriers.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create courier
   *
   * @param courier - Datos del transportista a crear
   */
  public createCourier(courier: Courier): Observable<IResponse> {
    return this.couriers$.pipe(
      take(1),
      switchMap(couriers => {
        if (!couriers) {
          couriers = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/helper/couriers/`, courier).pipe(
          map((response) => {
            // Update the couriers with the new courier
            if (response.courier) {
              this._couriers.next([response.courier, ...couriers]);
            }
            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Get couriers
   *
   * @param page - Página
   * @param size - Tamaño
   * @param sort - Campo de ordenamiento
   * @param order - Orden
   * @param search - Búsqueda
   */
  public getCouriers(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/couriers/`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response) => {
        if (response.couriers) {
          this._couriers.next(response.couriers);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      })
    );
  }

  /**
   * Get couriers by vendor
   *
   * @param page - Página
   * @param size - Tamaño
   * @param sort - Campo de ordenamiento
   * @param order - Orden
   * @param search - Búsqueda
   * @param vendorId - ID del vendedor
   */
  public getCouriersByVendor(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = '',
    vendorId: string = ''
  ): Observable<IResponse> {
    if (!vendorId) {
      return throwError(() => new Error('vendorId is required'));
    }

    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/couriers/by-vendor-id/${vendorId}`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response) => {
        if (response.couriers) {
          this._couriers.next(response.couriers);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      })
    );
  }

  /**
   * Get courier by id
   *
   * @param courierId - ID del transportista
   */
  public getCourierById(courierId: string): Observable<Courier> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/couriers/${courierId}`).pipe(
      map((response) => {
        if (!response.courier) {
          throw new Error('Courier not found');
        }
        this._courier.next(response.courier);
        return response.courier;
      })
    );
  }

  /**
   * Update courier
   *
   * @param courier - Datos del transportista a actualizar
   */
  public updateCourier(courier: Courier): Observable<IResponse> {
    if (!courier.id) {
      return throwError(() => new Error('Courier ID is required'));
    }

    return this.couriers$.pipe(
      take(1),
      switchMap(couriers => {
        if (!couriers) {
          return throwError(() => new Error('No couriers available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/helper/couriers/${courier.id}`, courier).pipe(
          map((response) => {
            if (!response.updatedCourier) {
              throw new Error('Update failed');
            }

            // Find the index of the updated courier
            const index = couriers.findIndex(item => item.id === courier.id);

            if (index !== -1) {
              // Update the courier
              couriers[index] = response.updatedCourier;

              // Update the couriers
              this._couriers.next(couriers);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Delete the courier
   *
   * @param id - ID del transportista a eliminar
   */
  public deleteCourier(id: string): Observable<IResponse> {
    return this.couriers$.pipe(
      take(1),
      switchMap(couriers => {
        if (!couriers) {
          return throwError(() => new Error('No couriers available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/helper/couriers/${id}`).pipe(
          map((response: IResponse) => {
            // Find the index of the deleted courier
            const index = couriers.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the courier
              couriers.splice(index, 1);

              // Update the couriers
              this._couriers.next(couriers);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }
}

