import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { CopextelService } from './services.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_SERVICES } from '../../mocks/data/services.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Copextel Services Service
 * Servicio para gestión de servicios de Copextel
 */
@Injectable({
  providedIn: 'root'
})
export class CopextelServicesService {

  // Private
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);
  private _service: BehaviorSubject<CopextelService | null> = new BehaviorSubject<CopextelService | null>(null);
  private _services: BehaviorSubject<CopextelService[] | null> = new BehaviorSubject<CopextelService[] | null>(null);
  private _servicesArr: BehaviorSubject<CopextelService[] | null> = new BehaviorSubject<CopextelService[] | null>(null);

  /**
   * Constructor
   */
  constructor(
    private _httpClient: HttpClient,
    private _mockService: MockService
  ) {
  }

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
   * Getter for service
   */
  get service$(): Observable<CopextelService> {
    return this._service.asObservable();
  }

  /**
   * Getter for services
   */
  get services$(): Observable<CopextelService[]> {
    return this._services.asObservable();
  }

  /**
   * Getter for servicesArr
   */
  get servicesArr$(): Observable<CopextelService[]> {
    return this._servicesArr.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create service
   *
   * @param service - Datos del servicio a crear
   */
  public createService(service: CopextelService): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const newService: CopextelService = {
        ...service,
        id: Math.max(...MOCK_SERVICES.map(s => s.id), 0) + 1,
        createdAt: new Date()
      };
      MOCK_SERVICES.unshift(newService);
      
      return this.services$.pipe(
        take(1),
        switchMap(services => {
          if (!services) {
            services = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Servicio creado exitosamente',
            service: newService
          }).pipe(
            tap(() => {
              this._services.next([newService, ...services]);
            })
          );
        })
      );
    }
    
    // Real API call
    return this.services$.pipe(
      take(1),
      switchMap(services => {
        if (!services) {
          services = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/product/services/`, service).pipe(
          map((response) => {
            // Update the services with the new service
            if (response.service) {
              this._services.next([response.service, ...services]);
            }
            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error creating service:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Get services
   *
   * @param page - Página
   * @param size - Tamaño
   * @param sort - Campo de ordenamiento
   * @param order - Orden
   * @param search - Búsqueda
   */
  public getServices(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_SERVICES,
        page,
        size,
        sort || 'id',
        order,
        search,
        ['name', 'code', 'description'] as (keyof CopextelService)[]
      );
      
      return this._mockService.simulateDelay({
        ok: true,
        services: result.data,
        pagination: result.pagination
      }).pipe(
        tap((response) => {
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
          if (response.services) {
            this._services.next(response.services);
            this._servicesArr.next(response.services);
          }
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/product/services/`, {
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

        if (response.services) {
          this._services.next(response.services);
          this._servicesArr.next(response.services);
        }
      }),
      catchError((error) => {
        console.error('Error getting services:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get service by id
   *
   * @param id - ID del servicio
   */
  public getServiceById(id: number): Observable<CopextelService> {
    return this.services$.pipe(
      take(1),
      map((services) => {
        if (!services) {
          throw new Error('No services available');
        }

        // Find the service
        const service = services.find(item => item.id === id) || null;

        if (!service) {
          throw new Error(`No existe servicio para este id: ${id}`);
        }

        // Update the service
        this._service.next(service);

        // Return the service
        return service;
      })
    );
  }

  /**
   * Update service
   *
   * @param service - Datos del servicio a actualizar
   */
  public updateService(service: CopextelService): Observable<IResponse> {
    if (!service.id) {
      return throwError(() => new Error('Service ID is required'));
    }

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_SERVICES.findIndex(s => s.id === service.id);
      if (index === -1) {
        return this._mockService.simulateError('Servicio no encontrado', 404);
      }
      
      const updatedService = { ...MOCK_SERVICES[index], ...service };
      MOCK_SERVICES[index] = updatedService;
      
      return this.services$.pipe(
        take(1),
        switchMap(services => {
          if (!services) {
            return throwError(() => new Error('No services available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Servicio actualizado exitosamente',
            service: updatedService
          }).pipe(
            tap(() => {
              const serviceIndex = services.findIndex(item => item.id === service.id);
              if (serviceIndex !== -1) {
                services[serviceIndex] = updatedService;
                this._services.next(services);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.services$.pipe(
      take(1),
      switchMap(services => {
        if (!services) {
          return throwError(() => new Error('No services available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/product/services/${service.id}`, service).pipe(
          map((response) => {
            if (!response.service) {
              throw new Error('Update failed');
            }

            // Find the index of the updated service
            const index = services.findIndex(item => item.id === service.id);

            if (index !== -1) {
              // Update the service
              services[index] = response.service;

              // Update the services
              this._services.next(services);
            }

            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error updating service:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Delete the service
   *
   * @param id - ID del servicio a eliminar
   */
  public deleteService(id: number): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_SERVICES.findIndex(s => s.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Servicio no encontrado', 404);
      }
      
      MOCK_SERVICES.splice(index, 1);
      
      return this.services$.pipe(
        take(1),
        switchMap(services => {
          if (!services) {
            return throwError(() => new Error('No services available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Servicio eliminado exitosamente'
          }).pipe(
            tap(() => {
              const serviceIndex = services.findIndex(item => item.id === id);
              if (serviceIndex !== -1) {
                services.splice(serviceIndex, 1);
                this._services.next(services);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.services$.pipe(
      take(1),
      switchMap(services => {
        if (!services) {
          return throwError(() => new Error('No services available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/product/services/${id}`).pipe(
          map((response: IResponse) => {
            // Find the index of the deleted service
            const index = services.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the service
              services.splice(index, 1);

              // Update the services
              this._services.next(services);
            }

            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error deleting service:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}

