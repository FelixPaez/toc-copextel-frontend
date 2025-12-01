import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap, catchError } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Vendor } from './vendors.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_VENDORS } from '../../mocks/data/vendors.mock';
import { MockService } from '../../core/services/mock.service';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Vendors Service
 * Servicio para gestión de vendedores
 */
@Injectable({
  providedIn: 'root'
})
export class VendorsService {

  // Private properties
  private _vendor: BehaviorSubject<Vendor | null> = new BehaviorSubject<Vendor | null>(null);
  private _vendors: BehaviorSubject<Vendor[] | null> = new BehaviorSubject<Vendor[] | null>(null);
  private _vendorsArr: BehaviorSubject<Vendor[] | null> = new BehaviorSubject<Vendor[] | null>(null);
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);

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
   * Getter for vendor
   */
  get vendor$(): Observable<Vendor> {
    return this._vendor.asObservable();
  }

  /**
   * Getter for vendors
   */
  get vendors$(): Observable<Vendor[]> {
    return this._vendors.asObservable();
  }

  /**
   * Getter for vendorsArr
   */
  get vendorsArr$(): Observable<Vendor[]> {
    return this._vendorsArr.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create vendor
   *
   * @param vendor - Datos del vendedor a crear
   */
  public createVendor(vendor: Vendor): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const newVendor: Vendor = {
        ...vendor,
        id: `vendor-${Date.now()}`,
        createAt: new Date()
      };
      MOCK_VENDORS.unshift(newVendor);
      
      return this.vendors$.pipe(
        take(1),
        switchMap(vendors => {
          if (!vendors) {
            vendors = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Vendedor creado exitosamente',
            vendor: newVendor
          }).pipe(
            tap(() => {
              this._vendors.next([newVendor, ...vendors]);
            })
          );
        })
      );
    }
    
    // Real API call
    return this.vendors$.pipe(
      take(1),
      switchMap(vendors => {
        if (!vendors) {
          vendors = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/helper/vendors/`, vendor).pipe(
          map((response: IResponse) => {
            // Update the vendors with the new vendor
            if (response.vendor) {
              this._vendors.next([response.vendor, ...vendors]);
            }
            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error creating vendor:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Get vendors
   */
  public getVendors(): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      return this._mockService.simulateDelay({
        ok: true,
        vendors: MOCK_VENDORS
      }).pipe(
        tap((response) => {
          if (response.vendors) {
            // Paginate - Start
            const vendorsLength = response.vendors.length;

            // Get available queries
            const page = 0;
            const size = 10;

            // Calculate pagination details
            const begin = page * size;
            const end = Math.min((size * (page + 1)), vendorsLength);
            const lastPage = Math.max(Math.ceil(vendorsLength / size), 1);

            // Prepare the pagination object
            let pagination: TablePagination;

            if (page >= lastPage) {
              pagination = {
                lastPage
              };
            } else {
              // Prepare the pagination
              pagination = {
                length: vendorsLength,
                size: size,
                page: page,
                lastPage: lastPage,
                startIndex: begin,
                endIndex: end - 1
              };
            }

            // Set pagination
            this._pagination.next(pagination);
            this._vendors.next(response.vendors);
            this._vendorsArr.next(response.vendors);
          }
        })
      );
    }
    
    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/vendors/`).pipe(
      tap((response) => {
        if (response.vendors) {
          // Paginate - Start
          const vendorsLength = response.vendors.length;

          // Get available queries
          const page = 0;
          const size = 10;

          // Calculate pagination details
          const begin = page * size;
          const end = Math.min((size * (page + 1)), vendorsLength);
          const lastPage = Math.max(Math.ceil(vendorsLength / size), 1);

          // Prepare the pagination object
          let pagination: TablePagination;

          if (page >= lastPage) {
            pagination = {
              lastPage
            };
          } else {
            // Prepare the pagination
            pagination = {
              length: vendorsLength,
              size: size,
              page: page,
              lastPage: lastPage,
              startIndex: begin,
              endIndex: end - 1
            };
          }

          // Set pagination
          this._pagination.next(pagination);
          this._vendors.next(response.vendors);
          this._vendorsArr.next(response.vendors);
        }
      }),
      catchError((error) => {
        console.error('Error getting vendors:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get sorted vendors (paginación local)
   *
   * @param pageParam - Página
   * @param sizeParam - Tamaño
   * @param sortParam - Campo de ordenamiento
   * @param orderParam - Orden
   * @param searchParam - Búsqueda
   */
  public getSortsVendors(
    pageParam: number = 0,
    sizeParam: number = 10,
    sortParam: string = 'name',
    orderParam: 'asc' | 'desc' | '' = 'asc',
    searchParam: string = ''
  ): Observable<{ vendors: Vendor[]; pagination: TablePagination }> {
    return this.vendorsArr$.pipe(
      take(1),
      map((vendorsArr) => {
        if (!vendorsArr) {
          return { vendors: [], pagination: { length: 0, size: sizeParam, page: pageParam, lastPage: 0 } };
        }

        // Get available queries
        const search = searchParam;
        const sort = sortParam || 'name';
        const order = orderParam || 'asc';
        const page = pageParam;
        const size = sizeParam;

        // Clone the vendors (shallow copy)
        let vendors: Vendor[] = [...vendorsArr];

        // Sort the vendors
        if (sort === 'name' || sort === 'active') {
          vendors.sort((a, b) => {
            const fieldA = (a[sort] as any)?.toString().toUpperCase() || '';
            const fieldB = (b[sort] as any)?.toString().toUpperCase() || '';
            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
          });
        } else {
          vendors.sort((a, b) => {
            const aVal = (a as any)[sort] || 0;
            const bVal = (b as any)[sort] || 0;
            return order === 'asc' ? aVal - bVal : bVal - aVal;
          });
        }

        // If search exists...
        if (search) {
          // Filter the vendors
          vendors = vendors.filter(vendor => vendor.name && vendor.name.toLowerCase().includes(search.toLowerCase()));
        }

        // Paginate - Start
        const vendorsLength = vendors.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), vendorsLength);
        const lastPage = Math.max(Math.ceil(vendorsLength / size), 1);

        // Prepare the pagination object
        let pagination: TablePagination;
        let paginatedVendors: Vendor[];

        // If the requested page number is bigger than the last possible page number
        if (page >= lastPage) {
          paginatedVendors = [];
          pagination = {
            lastPage
          };
        } else {
          // Paginate the results by size
          paginatedVendors = vendors.slice(begin, end);

          // Prepare the pagination
          pagination = {
            length: vendorsLength,
            size: size,
            page: page,
            lastPage: lastPage,
            startIndex: begin,
            endIndex: end - 1
          };
        }

        // Update the service
        this._vendors.next(paginatedVendors);

        // Update the pagination
        this._pagination.next(pagination);

        return { vendors: paginatedVendors, pagination };
      })
    );
  }

  /**
   * Get vendor by id
   *
   * @param id - ID del vendedor
   */
  public getVendorById(id: string): Observable<Vendor> {
    return this.vendors$.pipe(
      take(1),
      map((vendors) => {
        if (!vendors) {
          throw new Error('No vendors available');
        }

        // Find the vendor
        const vendor = vendors.find(item => item.id === id) || null;

        if (!vendor) {
          throw new Error(`No existe vendedor para este id: ${id}`);
        }

        // Update the vendor
        this._vendor.next(vendor);

        // Return the vendor
        return vendor;
      })
    );
  }

  /**
   * Update vendor
   *
   * @param vendor - Datos del vendedor a actualizar
   */
  public updateVendor(vendor: Vendor): Observable<IResponse> {
    if (!vendor.id) {
      return throwError(() => new Error('Vendor ID is required'));
    }

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_VENDORS.findIndex(v => v.id === vendor.id);
      if (index === -1) {
        return this._mockService.simulateError('Vendedor no encontrado', 404);
      }
      
      const updatedVendor = { ...MOCK_VENDORS[index], ...vendor };
      MOCK_VENDORS[index] = updatedVendor;
      
      return this.vendors$.pipe(
        take(1),
        switchMap(vendors => {
          if (!vendors) {
            return throwError(() => new Error('No vendors available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Vendedor actualizado exitosamente',
            updatedVendor: updatedVendor
          }).pipe(
            tap(() => {
              const vendorIndex = vendors.findIndex(item => item.id === vendor.id);
              if (vendorIndex !== -1) {
                vendors[vendorIndex] = updatedVendor;
                this._vendors.next(vendors);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.vendors$.pipe(
      take(1),
      switchMap(vendors => {
        if (!vendors) {
          return throwError(() => new Error('No vendors available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/helper/vendors/${vendor.id}`, vendor).pipe(
          map((response: IResponse) => {
            if (!response.updatedVendor) {
              throw new Error('Update failed');
            }

            // Find the index of the updated vendor
            const index = vendors.findIndex(item => item.id === vendor.id);

            if (index !== -1) {
              // Update the vendor
              vendors[index] = response.updatedVendor;

              // Update the vendors
              this._vendors.next(vendors);
            }

            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error updating vendor:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Delete the vendor
   *
   * @param id - ID del vendedor a eliminar
   */
  public deleteVendor(id: string): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_VENDORS.findIndex(v => v.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Vendedor no encontrado', 404);
      }
      
      MOCK_VENDORS.splice(index, 1);
      
      return this.vendors$.pipe(
        take(1),
        switchMap(vendors => {
          if (!vendors) {
            return throwError(() => new Error('No vendors available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Vendedor eliminado exitosamente'
          }).pipe(
            tap(() => {
              const vendorIndex = vendors.findIndex(item => item.id === id);
              if (vendorIndex !== -1) {
                vendors.splice(vendorIndex, 1);
                this._vendors.next(vendors);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.vendors$.pipe(
      take(1),
      switchMap(vendors => {
        if (!vendors) {
          return throwError(() => new Error('No vendors available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/helper/vendors/${id}`).pipe(
          map((response: IResponse) => {
            // Find the index of the deleted vendor
            const index = vendors.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the vendor
              vendors.splice(index, 1);

              // Update the vendors
              this._vendors.next(vendors);
            }

            // Return the response
            return response;
          }),
          catchError((error) => {
            console.error('Error deleting vendor:', error);
            return throwError(() => error);
          })
        );
      })
    );
  }
}

