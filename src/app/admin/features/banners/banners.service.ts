import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, throwError } from 'rxjs';
import { catchError, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Banner } from './banners.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_BANNERS } from '../../mocks/data/banners.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Banners Service
 * Servicio para gestión de banners
 */
@Injectable({
  providedIn: 'root'
})
export class BannersService {

  // Private properties
  private _banner: BehaviorSubject<Banner | null> = new BehaviorSubject<Banner | null>(null);
  private _banners: BehaviorSubject<Banner[] | null> = new BehaviorSubject<Banner[] | null>(null);
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
   * Getter for banner
   */
  get banner$(): Observable<Banner> {
    return this._banner.asObservable();
  }

  /**
   * Getter for banners
   */
  get banners$(): Observable<Banner[]> {
    return this._banners.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get banners
   *
   * @param page - Página actual
   * @param size - Tamaño de página
   * @param sort - Campo de ordenamiento
   * @param order - Orden (asc/desc)
   * @param search - Término de búsqueda
   */
  public getBanners(
    page: number = 0,
    size: number = 10,
    sort: string = 'createdAt',
    order: 'asc' | 'desc' | '' = 'desc',
    search: string = ''
  ): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const result = applyMockPagination(
        MOCK_BANNERS,
        page,
        size,
        sort || 'createdAt',
        order,
        search,
        ['title', 'subtitle', 'category'] as (keyof Banner)[]
      );

      return this._mockService.simulateDelay({
        ok: true,
        banners: result.data,
        pagination: result.pagination
      } as IResponse).pipe(
        tap((response: IResponse) => {
          if (response.banners) {
            this._banners.next(response.banners as Banner[]);
          }
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
        })
      );
    }

    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/banners`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        search
      }
    }).pipe(
      tap((response: IResponse) => {
        if (response.banners) {
          this._banners.next(response.banners as Banner[]);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Get banner by id
   *
   * @param bannerId - ID del banner
   */
  public getBannerById(bannerId: string): Observable<Banner> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const banner = MOCK_BANNERS.find(b => b.id === bannerId);
      if (!banner) {
        return this._mockService.simulateError('Banner no encontrado', 404);
      }
      return this._mockService.simulateDelay(banner).pipe(
        tap((banner) => {
          this._banner.next(banner);
        })
      );
    }

    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/banners/${bannerId}`).pipe(
      map((response: IResponse) => {
        if (!response.banner) {
          throw new Error('Banner not found');
        }
        this._banner.next(response.banner as Banner);
        return response.banner as Banner;
      }),
      catchError((error) => {
        return throwError(() => error);
      })
    );
  }

  /**
   * Create banner
   *
   * @param banner - Datos del banner a crear
   */
  public createBanner(banner: Banner): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const newBanner: Banner = {
        ...banner,
        id: `banner-${Date.now()}`,
        createdAt: new Date(),
        updatedAt: new Date()
      };
      MOCK_BANNERS.unshift(newBanner);

      return this.banners$.pipe(
        take(1),
        switchMap(banners => {
          if (!banners) {
            banners = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Banner creado exitosamente',
            banner: newBanner
          }).pipe(
            tap(() => {
              this._banners.next([newBanner, ...banners]);
            })
          );
        })
      );
    }

    // Real API call
    return this.banners$.pipe(
      take(1),
      switchMap(banners => {
        if (!banners) {
          banners = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/banners`, banner).pipe(
          map((response: IResponse) => {
            if (response.banner) {
              this._banners.next([response.banner as Banner, ...banners]);
            }
            return response;
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Update banner
   *
   * @param banner - Datos del banner a actualizar
   */
  public updateBanner(banner: Banner): Observable<IResponse> {
    if (!banner.id) {
      return throwError(() => new Error('Banner ID is required'));
    }

    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_BANNERS.findIndex(b => b.id === banner.id);
      if (index === -1) {
        return this._mockService.simulateError('Banner no encontrado', 404);
      }

      const updatedBanner = { ...MOCK_BANNERS[index], ...banner, updatedAt: new Date() };
      MOCK_BANNERS[index] = updatedBanner;

      return this.banners$.pipe(
        take(1),
        switchMap(banners => {
          if (!banners) {
            return throwError(() => new Error('No banners available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Banner actualizado exitosamente',
            banner: updatedBanner
          }).pipe(
            tap(() => {
              const bannerIndex = banners.findIndex(item => item.id === banner.id);
              if (bannerIndex !== -1) {
                banners[bannerIndex] = updatedBanner;
                this._banners.next(banners);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.banners$.pipe(
      take(1),
      switchMap(banners => {
        if (!banners) {
          return throwError(() => new Error('No banners available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/banners/${banner.id}`, banner).pipe(
          map((response: IResponse) => {
            if (!response.banner) {
              throw new Error('Update failed');
            }

            const index = banners.findIndex(item => item.id === banner.id);
            if (index !== -1) {
              banners[index] = response.banner as Banner;
              this._banners.next(banners);
            }

            return response;
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Delete banner
   *
   * @param id - ID del banner a eliminar
   */
  public deleteBanner(id: string): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_BANNERS.findIndex(b => b.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Banner no encontrado', 404);
      }

      MOCK_BANNERS.splice(index, 1);

      return this.banners$.pipe(
        take(1),
        switchMap(banners => {
          if (!banners) {
            return throwError(() => new Error('No banners available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Banner eliminado exitosamente'
          }).pipe(
            tap(() => {
              const bannerIndex = banners.findIndex(item => item.id === id);
              if (bannerIndex !== -1) {
                banners.splice(bannerIndex, 1);
                this._banners.next(banners);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.banners$.pipe(
      take(1),
      switchMap(banners => {
        if (!banners) {
          return throwError(() => new Error('No banners available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/banners/${id}`).pipe(
          map((response: IResponse) => {
            const index = banners.findIndex(item => item.id === id);
            if (index !== -1) {
              banners.splice(index, 1);
              this._banners.next(banners);
            }
            return response;
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        );
      })
    );
  }

  /**
   * Toggle banner active status
   *
   * @param id - ID del banner
   * @param isActive - Nuevo estado activo
   */
  public toggleBannerActive(id: string, isActive: boolean): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_BANNERS.findIndex(b => b.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Banner no encontrado', 404);
      }

      MOCK_BANNERS[index].isActive = isActive;
      MOCK_BANNERS[index].updatedAt = new Date();
      const updatedBanner = MOCK_BANNERS[index];

      return this.banners$.pipe(
        take(1),
        switchMap(banners => {
          if (!banners) {
            return throwError(() => new Error('No banners available'));
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: `Banner ${isActive ? 'activado' : 'desactivado'} exitosamente`,
            banner: updatedBanner
          }).pipe(
            tap(() => {
              const bannerIndex = banners.findIndex(item => item.id === id);
              if (bannerIndex !== -1) {
                banners[bannerIndex].isActive = isActive;
                banners[bannerIndex].updatedAt = new Date();
                this._banners.next(banners);
              }
            })
          );
        })
      );
    }

    // Real API call
    return this.banners$.pipe(
      take(1),
      switchMap(banners => {
        if (!banners) {
          return throwError(() => new Error('No banners available'));
        }
        return this._httpClient.patch<IResponse>(`${API_URL_GATEWAY}/banners/${id}/toggle-active`, { isActive }).pipe(
          map((response: IResponse) => {
            if (!response.banner) {
              throw new Error('Update failed');
            }

            const index = banners.findIndex(item => item.id === id);
            if (index !== -1) {
              banners[index] = response.banner as Banner;
              this._banners.next(banners);
            }

            return response;
          }),
          catchError((error) => {
            return throwError(() => error);
          })
        );
      })
    );
  }
}

