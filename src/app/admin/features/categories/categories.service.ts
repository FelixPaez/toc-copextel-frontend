import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { Category } from './categories.types';

// Variables
import { environment } from '../../../../environments/environment';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Categories Service
 * Servicio para gestión de categorías de productos
 */
@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  // Private properties
  private _category: BehaviorSubject<Category | null> = new BehaviorSubject<Category | null>(null);
  private _categories: BehaviorSubject<Category[] | null> = new BehaviorSubject<Category[] | null>(null);
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
   * Getter for category
   */
  get category$(): Observable<Category> {
    return this._category.asObservable();
  }

  /**
   * Getter for categories
   */
  get categories$(): Observable<Category[]> {
    return this._categories.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Create category
   *
   * @param category - Datos de la categoría a crear
   */
  public createCategory(category: Category): Observable<IResponse> {
    return this.categories$.pipe(
      take(1),
      switchMap(categories => {
        if (!categories) {
          categories = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/product/categories/`, category).pipe(
          map((response) => {
            // Update the categories with the new category
            if (response.category) {
              this._categories.next([response.category, ...categories]);
            }
            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Get categories
   */
  public getCategories(): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/product/categories/`).pipe(
      tap((response) => {
        if (response.categories) {
          this._categories.next(response.categories);
        }
      })
    );
  }

  /**
   * Get sorted categories (paginación local)
   *
   * @param pageParam - Página
   * @param sizeParam - Tamaño
   * @param sortParam - Campo de ordenamiento
   * @param orderParam - Orden
   * @param searchParam - Búsqueda
   */
  public getSortsCategories(
    pageParam: number = 0,
    sizeParam: number = 10,
    sortParam: string = 'name',
    orderParam: 'asc' | 'desc' | '' = 'asc',
    searchParam: string = ''
  ): Observable<{ categories: Category[]; pagination: TablePagination }> {
    return this.categories$.pipe(
      take(1),
      map((categoriesArr) => {
        if (!categoriesArr) {
          return { categories: [], pagination: { length: 0, size: sizeParam, page: pageParam, lastPage: 0 } };
        }

        // Get available queries
        const search = searchParam;
        const sort = sortParam || 'name';
        const order = orderParam || 'asc';
        const page = pageParam;
        const size = sizeParam;

        // Clone the categories (shallow copy) - Mejor práctica: usar spread operator en lugar de lodash
        let categories: Category[] = [...categoriesArr];

        // Sort the categories
        if (sort === 'name' || sort === 'active') {
          categories.sort((a, b) => {
            const fieldA = (a[sort] as any)?.toString().toUpperCase() || '';
            const fieldB = (b[sort] as any)?.toString().toUpperCase() || '';
            return order === 'asc' ? fieldA.localeCompare(fieldB) : fieldB.localeCompare(fieldA);
          });
        } else {
          categories.sort((a, b) => {
            const aVal = (a as any)[sort] || 0;
            const bVal = (b as any)[sort] || 0;
            return order === 'asc' ? aVal - bVal : bVal - aVal;
          });
        }

        // If search exists...
        if (search) {
          // Filter the categories
          categories = categories.filter(cat => cat.name && cat.name.toLowerCase().includes(search.toLowerCase()));
        }

        // Paginate - Start
        const categoriesLength = categories.length;

        // Calculate pagination details
        const begin = page * size;
        const end = Math.min((size * (page + 1)), categoriesLength);
        const lastPage = Math.max(Math.ceil(categoriesLength / size), 1);

        // Prepare the pagination object
        let pagination: TablePagination;
        let paginatedCategories: Category[];

        // If the requested page number is bigger than the last possible page number
        if (page >= lastPage) {
          paginatedCategories = [];
          pagination = {
            lastPage
          };
        } else {
          // Paginate the results by size
          paginatedCategories = categories.slice(begin, end);

          // Prepare the pagination
          pagination = {
            length: categoriesLength,
            size: size,
            page: page,
            lastPage: lastPage,
            startIndex: begin,
            endIndex: end - 1
          };
        }

        // Update the service
        this._categories.next(paginatedCategories);

        // Update the pagination
        this._pagination.next(pagination);

        return { categories: paginatedCategories, pagination };
      })
    );
  }

  /**
   * Get category by id
   *
   * @param id - ID de la categoría
   */
  public getCategoryById(id: number): Observable<Category> {
    return this.categories$.pipe(
      take(1),
      map((categories) => {
        if (!categories) {
          throw new Error('No categories available');
        }

        // Find the category
        const category = categories.find(item => item.id === id) || null;

        if (!category) {
          throw new Error(`No existe categoría para este id: ${id}`);
        }

        // Update the category
        this._category.next(category);

        // Return the category
        return category;
      })
    );
  }

  /**
   * Update category
   *
   * @param category - Datos de la categoría a actualizar
   */
  public updateCategory(category: Category): Observable<IResponse> {
    if (!category.id) {
      return throwError(() => new Error('Category ID is required'));
    }

    return this.categories$.pipe(
      take(1),
      switchMap(categories => {
        if (!categories) {
          return throwError(() => new Error('No categories available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/product/categories/${category.id}`, category).pipe(
          map((response) => {
            if (!response.updatedCategory) {
              throw new Error('Update failed');
            }

            // Find the index of the updated category
            const index = categories.findIndex(item => item.id === category.id);

            if (index !== -1) {
              // Update the category
              categories[index] = response.updatedCategory;

              // Update the categories
              this._categories.next(categories);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }

  /**
   * Delete the category
   *
   * @param id - ID de la categoría a eliminar
   */
  public deleteCategory(id: number): Observable<IResponse> {
    return this.categories$.pipe(
      take(1),
      switchMap(categories => {
        if (!categories) {
          return throwError(() => new Error('No categories available'));
        }
        return this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/product/categories/${id}`).pipe(
          map((response: IResponse) => {
            // Find the index of the deleted category
            const index = categories.findIndex(item => item.id === id);

            if (index !== -1) {
              // Delete the category
              categories.splice(index, 1);

              // Update the categories
              this._categories.next(categories);
            }

            // Return the response
            return response;
          })
        );
      })
    );
  }
}

