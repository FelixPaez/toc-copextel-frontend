import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, filter, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { User } from './users.types';

// Variables
import { environment } from '../../../../environments/environment';

// API Url
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Users Service
 * Servicio para gestión de usuarios administradores
 */
@Injectable({
  providedIn: 'root'
})
export class UsersService {

  // Private
  private _pagination: BehaviorSubject<TablePagination | null> = new BehaviorSubject<TablePagination | null>(null);
  private _titles: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);
  private _user: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private _users: BehaviorSubject<User[] | null> = new BehaviorSubject<User[] | null>(null);
  private _selectedUser: BehaviorSubject<User | null> = new BehaviorSubject<User | null>(null);
  private _uos: BehaviorSubject<string[] | null> = new BehaviorSubject<string[] | null>(null);

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
   * Getter for user
   */
  get user$(): Observable<User> {
    return this._user.asObservable();
  }

  /**
   * Getter for users
   */
  get users$(): Observable<User[]> {
    return this._users.asObservable();
  }

  /**
   * Getter for selected User
   */
  get selectedUser$(): Observable<User> {
    return this._selectedUser.asObservable();
  }

  /**
   * Getter for uo
   */
  get uos$(): Observable<string[]> {
    return this._uos.asObservable();
  }

  /**
   * Getter for title
   */
  get titles$(): Observable<string[]> {
    return this._titles.asObservable();
  }

  /**
   * Setter & getter for user
   *
   * @param value
   */
  set user(value: User) {
    // Store the value
    this._user.next(value);
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get users
   *
   * @param [page=0]
   * @param [size=10]
   * @param [sort='orderNo']
   * @param [order='asc']
   * @param [search='']
   */
  public getUsers(
    page: number = 0,
    size: number = 10,
    sort: string = 'orderNo',
    order: 'asc' | 'desc' | '' = 'asc',
    search: string = ''
  ): Observable<IResponse> {
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/auth/admin/users`, {
      params: {
        page: '' + page,
        size: '' + size,
        sort,
        order,
        // search - descomentar si el backend lo soporta
      }
    })
      .pipe(
        tap((response) => {
          // Set pagination
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }

          if (response.users) {
            this._users.next(response.users);
          }
        })
      );
  }

  /**
   * Get user by id
   *
   * @param id - ID del usuario
   */
  public getUserById(id: number): Observable<User> {
    return this._httpClient.get<User>(`${API_URL_GATEWAY}/auth/admin/users/${id}`).pipe(
      map((user) => {
        this._selectedUser.next(user);
        return user;
      }),
      catchError((error) => {
        console.error('Error getting user by id:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Create user
   *
   * @param user - Datos del usuario a crear
   */
  public createUser(user: User): Observable<User> {
    return this.users$.pipe(
      take(1),
      switchMap(users => {
        if (!users) {
          users = [];
        }
        return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/users`, user).pipe(
          map((response: IResponse) => {
            // Update the users with the new user
            if (response.user) {
              this._users.next([response.user, ...users]);
              // Return the new user
              return response.user;
            }
            throw new Error('No user returned from server');
          })
        );
      })
    );
  }

  /**
   * Update user
   *
   * @param user - Datos del usuario a actualizar
   */
  public updateUser(user: User): Observable<User> {
    return this.users$.pipe(
      take(1),
      switchMap(users => {
        if (!users) {
          return throwError(() => new Error('No users available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/auth/admin/users/${user.id}`, user)
          .pipe(
            map((response) => {
              // Find the index of the updated user
              const index = users.findIndex(item => item.id === user.id);

              if (index === -1 || !response.updatedUser) {
                throw new Error('User not found or update failed');
              }

              // Update the user
              users[index] = response.updatedUser;

              // Update the users
              this._users.next(users);

              // Return the updated user
              return response.updatedUser;
            }),
            switchMap(updatedUser => this.user$.pipe(
              take(1),
              filter(item => item && item.id === user.id),
              tap(() => {
                // Update the user if it's selected
                this._user.next(updatedUser);
              }),
              map(() => updatedUser)
            ))
          );
      })
    );
  }

  /**
   * Update user profile
   *
   * @param user - Datos del perfil del usuario a actualizar
   */
  public updateUserProfile(user: User): Observable<User> {
    return this.users$.pipe(
      take(1),
      switchMap(users => {
        if (!users) {
          return throwError(() => new Error('No users available'));
        }
        return this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/auth/admin/users/${user.id}`, user)
          .pipe(
            map((response: IResponse) => {
              if (!response.updatedUser) {
                throw new Error('Update failed');
              }
              // Return the updated user
              return response.updatedUser;
            }),
            switchMap(updatedUser => this.user$.pipe(
              take(1),
              filter(item => item && item.id === user.id),
              tap(() => {
                // Update the user if it's selected
                this._user.next(updatedUser);
              }),
              map(() => updatedUser)
            ))
          );
      })
    );
  }

  /**
   * Delete the user
   *
   * @param id - ID del usuario a eliminar
   */
  public deleteUser(id: number): Observable<boolean> {
    return this.users$.pipe(
      take(1),
      switchMap(users => {
        if (!users) {
          return throwError(() => new Error('No users available'));
        }
        return this._httpClient.delete<boolean>(`${API_URL_GATEWAY}/auth/admin/users/${id}`).pipe(
          map((isDeleted: boolean) => {
            if (isDeleted) {
              // Find the index of the deleted user
              const index = users.findIndex(item => item.id === id);

              if (index !== -1) {
                // Delete the user
                users.splice(index, 1);

                // Update the users
                this._users.next(users);
              }
            }

            // Return the deleted status
            return isDeleted;
          })
        );
      })
    );
  }

  /**
   * Get UOs (Unidades Organizativas)
   *
   */
  public getUos(): Observable<string[]> {
    return this._httpClient.get<string[]>('assets/data/uo.json')
      .pipe(
        map(uos =>
          uos.sort((a: string, b: string) => {
            if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            } else if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            }
            return 0;
          })
        ),
        tap((uos) => {
          this._uos.next(uos);
        })
      );
  }

  /**
   * Get titles
   *
   */
  public getTitles(): Observable<string[]> {
    return this._httpClient.get<string[]>('assets/data/titles.json')
      .pipe(
        map(titles =>
          titles.sort((a: string, b: string) => {
            if (a.toLowerCase() < b.toLowerCase()) {
              return -1;
            } else if (a.toLowerCase() > b.toLowerCase()) {
              return 1;
            }
            return 0;
          })
        ),
        tap((titles) => {
          this._titles.next(titles);
        })
      );
  }

  /**
   * Reset password
   *
   * @param passwords - Contraseñas (antigua y nueva)
   */
  public resetPassword(passwords: { oldPassword: string; newPassword: string }): Observable<IResponse> {
    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/reset-password`, passwords);
  }

  /**
   * Update user password
   *
   * @param data - Datos para actualizar contraseña del usuario
   */
  public updateUserPassword(data: { userId: number; password: string }): Observable<IResponse> {
    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/users/reset-password`, data);
  }
}

