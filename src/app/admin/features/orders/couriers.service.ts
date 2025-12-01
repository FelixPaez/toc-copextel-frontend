import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Courier } from './couriers.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_COURIERS } from '../../mocks/data/couriers.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

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
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) { }

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
    // Mock mode
    if (this._mockService.isMockMode) {
      const newCourier: Courier = {
        ...courier,
        id: `courier-${Date.now()}`,
        createdAt: new Date().toISOString()
      };
      MOCK_COURIERS.unshift(newCourier);
      
      return this.couriers$.pipe(
        take(1),
        switchMap(couriers => {
          if (!couriers) {
            couriers = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Transportista creado exitosamente',
            courier: newCourier
          }).pipe(
            tap(() => {
              this._couriers.next([newCourier, ...couriers]);
            })
          );
        })
      );
    }
    
    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error creating courier:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_COURIERS,
        page,
        size,
        sort || 'name',
        order,
        search,
        ['name', 'contact', 'email', 'phone', 'city', 'state'] as (keyof Courier)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        couriers: result.data,
        pagination: result.pagination
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
    
    // Real API call
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
      }),
      catchError((error) => {
        console.error('Error getting couriers:', error);
        return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      // Filter couriers by vendorId
      let filteredCouriers = MOCK_COURIERS.filter(c => c.vendorId === vendorId);
      
      const result = applyMockPagination(
        filteredCouriers,
        page,
        size,
        sort || 'name',
        order,
        search,
        ['name', 'contact', 'email', 'phone', 'city', 'state'] as (keyof Courier)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        couriers: result.data,
        pagination: result.pagination
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

    // Real API call
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
      }),
      catchError((error) => {
        console.error('Error getting couriers by vendor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get courier by id
   *
   * @param courierId - ID del transportista
   */
  public getCourierById(courierId: string): Observable<Courier> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const courier = MOCK_COURIERS.find(c => c.id === courierId);
      if (!courier) {
        return this._mockService.simulateError('Transportista no encontrado', 404);
      }
      return this._mockService.simulateDelay(courier).pipe(
        tap((courier) => {
          this._courier.next(courier);
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/couriers/${courierId}`).pipe(
      map((response) => {
        if (!response.courier) {
          throw new Error('Courier not found');
        }
        this._courier.next(response.courier);
        return response.courier;
      }),
      catchError((error) => {
        console.error('Error getting courier by id:', error);
        return throwError(() => error);
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

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_COURIERS.findIndex(c => c.id === courier.id);
      if (index === -1) {
        return this._mockService.simulateError('Transportista no encontrado', 404);
      }
      
      const updatedCourier = { ...MOCK_COURIERS[index], ...courier };
      MOCK_COURIERS[index] = updatedCourier;
      
      return this.couriers$.pipe(
        take(1),
        switchMap(couriers => {
          if (!couriers) {
            return throwError(() => new Error('No couriers available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Transportista actualizado exitosamente',
            updatedCourier: updatedCourier
          }).pipe(
            tap(() => {
              const courierIndex = couriers.findIndex(item => item.id === courier.id);
              if (courierIndex !== -1) {
                couriers[courierIndex] = updatedCourier;
                this._couriers.next(couriers);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error updating courier:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Toggle courier active status
   *
   * @param id - ID del transportista
   * @param active - Nuevo estado activo
   */
  public toggleCourierActive(id: string, active: boolean): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_COURIERS.findIndex(c => c.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Transportista no encontrado', 404);
      }
      
      MOCK_COURIERS[index].active = active;
      const updatedCourier = MOCK_COURIERS[index];
      
      return this.couriers$.pipe(
        take(1),
        switchMap(couriers => {
          if (!couriers) {
            return throwError(() => new Error('No couriers available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: `Transportista ${active ? 'activado' : 'desactivado'} exitosamente`,
            courier: updatedCourier
          }).pipe(
            tap(() => {
              const courierIndex = couriers.findIndex(item => item.id === id);
              if (courierIndex !== -1) {
                couriers[courierIndex].active = active;
                this._couriers.next(couriers);
              }
            })
          );
        })
      );
    }
    
    // Real API call
    return this.couriers$.pipe(
      take(1),
      switchMap(couriers => {
        if (!couriers) {
          return throwError(() => new Error('No couriers available'));
        }
        return this._httpClient.patch<IResponse>(`${API_URL_GATEWAY}/helper/couriers/${id}/toggle-active`, { active }).pipe(
          map((response) => {
            if (!response.courier) {
              throw new Error('Update failed');
            }
            
            const index = couriers.findIndex(item => item.id === id);
            if (index !== -1) {
              couriers[index] = response.courier;
              this._couriers.next(couriers);
            }
            
            return response;
          }),
          catchError((error) => {
            console.error('Error toggling courier active status:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_COURIERS.findIndex(c => c.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Transportista no encontrado', 404);
      }
      
      MOCK_COURIERS.splice(index, 1);
      
      return this.couriers$.pipe(
        take(1),
        switchMap(couriers => {
          if (!couriers) {
            return throwError(() => new Error('No couriers available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Transportista eliminado exitosamente'
          }).pipe(
            tap(() => {
              const courierIndex = couriers.findIndex(item => item.id === id);
              if (courierIndex !== -1) {
                couriers.splice(courierIndex, 1);
                this._couriers.next(couriers);
              }
            })
          );
        })
      );
    }

    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error deleting courier:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}

