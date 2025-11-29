import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Slide } from './slides.types';

// Variables
import { environment } from '../../../../environments/environment';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Slides Service
 * Servicio para gestión de slides/banners
 */
@Injectable({
  providedIn: 'root'
})
export class SlidesService {

  // Private properties
  private _slide: BehaviorSubject<Slide | null> = new BehaviorSubject<Slide | null>(null);
  private _slides: BehaviorSubject<Slide[] | null> = new BehaviorSubject<Slide[] | null>(null);
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);

  /**
   * Constructor
   */
  constructor(private _httpClient: HttpClient) {
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
   * Getter for slide
   */
  get slide$(): Observable<Slide> {
    return this._slide.asObservable();
  }

  /**
   * Getter for slides
   */
  get slides$(): Observable<Slide[]> {
    return this._slides.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create slide
   *
   * @param slide - Datos del slide a crear
   */
  public createSlide(slide: Slide): Observable<IResponse> {
    return this.slides$.pipe(
      take(1),
      switchMap(slides => {
        if (!slides) {
          slides = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/helper/slides/`, slide).pipe(
          map((response) => {
            // Update the slides with the new slide
            if (response.slide) {
              this._slides.next([response.slide, ...slides]);
            }
            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Get slides
   */
  public getSlides(): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/helper/slides/`).pipe(
      tap((response) => {
        if (response.slides) {
          this._slides.next(response.slides);
        }
      })
    );
  }

  /**
   * Get sorted slides (paginación local)
   *
   * @param pageParam - Página
   * @param sizeParam - Tamaño
   * @param sortParam - Campo de ordenamiento
   * @param orderParam - Orden
   * @param searchParam - Búsqueda
   */
  public getSortsSlides(
    pageParam: number = 0,
    sizeParam: number = 10,
    sortParam: string = 'title',
    orderParam: 'asc' | 'desc' | '' = 'asc',
    searchParam: string = ''
  ): Observable<{ slides: Slide[]; pagination: TablePagination }> {
    return this.slides$.pipe(
      take(1),
      map((slidesArr) => {
        if (!slidesArr) {
          return { slides: [], pagination: { length: 0, size: sizeParam, page: pageParam, lastPage: 0 } };
        }

        // Get available queries
        const search = searchParam;
        const sort = sortParam || 'title';
        const order = orderParam || 'asc';
        const page = pageParam;
        const size = sizeParam;

        // Clone the slides (shallow copy)
        let slides: Slide[] = [...slidesArr];

        // Sort the slides
        if (sort === 'title' || sort === 'active') {
          slides.sort((a, b) => {
            const fieldA = (a[sort] as any)?.toString().toUpperCase() || '';
            const fieldB = (b[sort] as any)?.toString().toUpperCase() || '';
            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
          });
        } else {
          slides.sort((a, b) => {
            const aVal = (a as any)[sort] || 0;
            const bVal = (b as any)[sort] || 0;
            return order === 'asc' ? aVal - bVal : bVal - aVal;
          });
        }

        // If search exists...
        if (search) {
          // Filter the slides
          slides = slides.filter(slide => slide.title && slide.title.toLowerCase().includes(search.toLowerCase()));
        }

        // Paginate - Start
        const slidesLength = slides.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), slidesLength);
        const lastPage = Math.max(Math.ceil(slidesLength / size), 1);

        // Prepare the pagination object
        let pagination: TablePagination;
        let paginatedSlides: Slide[];

        // If the requested page number is bigger than the last possible page number
        if (page >= lastPage) {
          paginatedSlides = [];
          pagination = {
            lastPage
          };
        } else {
          // Paginate the results by size
          paginatedSlides = slides.slice(begin, end);

          // Prepare the pagination
          pagination = {
            length: slidesLength,
            size: size,
            page: page,
            lastPage: lastPage,
            startIndex: begin,
            endIndex: end - 1
          };
        }

        // Update the service
        this._slides.next(paginatedSlides);

        // Update the pagination
        this._pagination.next(pagination);

        return { slides: paginatedSlides, pagination };
      })
    );
  }

  /**
   * Get slide by id
   *
   * @param id - ID del slide
   */
  public getSlideById(id: string): Observable<Slide> {
    return this.slides$.pipe(
      take(1),
      map((slides) => {
        if (!slides) {
          throw new Error('No slides available');
        }

        // Find the slide
        const slide = slides.find(item => item.id === id) || null;

        if (!slide) {
          throw new Error(`No existe diapositiva para este id: ${id}`);
        }

        // Update the slide
        this._slide.next(slide);

        // Return the slide
        return slide;
      })
    );
  }

  /**
   * Update slide
   *
   * @param slide - Datos del slide a actualizar
   */
  public updateSlide(slide: Slide): Observable<IResponse> {
    if (!slide.id) {
      return throwError(() => new Error('Slide ID is required'));
    }

    return this.slides$.pipe(
      take(1),
      switchMap(slides => {
        if (!slides) {
          return throwError(() => new Error('No slides available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/helper/slides/${slide.id}`, slide).pipe(
          map((response) => {
            if (!response.updatedSlide) {
              throw new Error('Update failed');
            }

            // Find the index of the updated slide
            const index = slides.findIndex(item => item.id === slide.id);

            if (index !== -1) {
              // Update the slide
              slides[index] = response.updatedSlide;

              // Update the slides
              this._slides.next(slides);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Delete the slide
   *
   * @param id - ID del slide a eliminar
   */
  public deleteSlide(id: string): Observable<IResponse> {
    return this.slides$.pipe(
      take(1),
      switchMap(slides => {
        if (!slides) {
          return throwError(() => new Error('No slides available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/helper/slides/${id}`).pipe(
          map((response: IResponse) => {
            // Find the index of the deleted slide
            const index = slides.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the slide
              slides.splice(index, 1);

              // Update the slides
              this._slides.next(slides);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }
}

