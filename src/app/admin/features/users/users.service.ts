import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, throwError } from 'rxjs';
import { catchError, delay, filter, map, switchMap, take, tap } from 'rxjs/operators';

// Types
import { IResponse, TablePagination } from '../../core/models/shared.types';
import { User } from './users.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data
import { MOCK_USERS } from '../../mocks/data/users.mock';
import { MockService } from '../../core/services/mock.service';

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
    // Mock mode
    if (this._mockService.isMockMode) {
      let filteredUsers = [...MOCK_USERS];
      
      // Apply search filter
      if (search) {
        const searchLower = search.toLowerCase();
        filteredUsers = filteredUsers.filter(u => 
          u.name.toLowerCase().includes(searchLower) ||
          u.lastname1.toLowerCase().includes(searchLower) ||
          u.email.toLowerCase().includes(searchLower) ||
          u.username.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply sorting
      filteredUsers.sort((a, b) => {
        let aVal: any = a[sort as keyof User] || '';
        let bVal: any = b[sort as keyof User] || '';
        
        if (typeof aVal === 'string') {
          aVal = aVal.toLowerCase();
          bVal = bVal.toLowerCase();
        }
        
        if (order === 'desc') {
          return aVal > bVal ? -1 : aVal < bVal ? 1 : 0;
        }
        return aVal < bVal ? -1 : aVal > bVal ? 1 : 0;
      });
      
      // Apply pagination
      const startIndex = page * size;
      const endIndex = startIndex + size;
      const paginatedUsers = filteredUsers.slice(startIndex, endIndex);
      
      const pagination: TablePagination = {
        length: filteredUsers.length,
        size,
        page,
        lastPage: Math.ceil(filteredUsers.length / size) - 1,
        startIndex,
        endIndex: Math.min(endIndex, filteredUsers.length)
      };
      
      return this._mockService.simulateDelay({
        ok: true,
        users: paginatedUsers,
        pagination
      }).pipe(
        tap((response) => {
          if (response.pagination) {
            this._pagination.next(response.pagination);
          }
          if (response.users) {
            this._users.next(response.users);
          }
        })
      );
    }
    
    // Real API call
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
        }),
        catchError((error) => {
          console.error('Error getting users:', error);
          return throwError(() => error);
        })
      );
  }

  /**
   * Get user by id
   *
   * @param id - ID del usuario
   */
  public getUserById(id: number): Observable<User> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const user = MOCK_USERS.find(u => u.id === id);
      if (!user) {
        return this._mockService.simulateError('Usuario no encontrado', 404);
      }
      return this._mockService.simulateDelay(user).pipe(
        tap((user) => {
          this._selectedUser.next(user);
        })
      );
    }
    
    // Real API call
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const newUser: User = {
        ...user,
        id: Math.max(...MOCK_USERS.map(u => u.id || 0)) + 1,
        createdAt: new Date().toISOString()
      };
      MOCK_USERS.unshift(newUser);
      
      return this.users$.pipe(
        take(1),
        switchMap(users => {
          if (!users) {
            users = [];
          }
          return this._mockService.simulateDelay(newUser).pipe(
            tap(() => {
              this._users.next([newUser, ...users]);
            })
          );
        })
      );
    }
    
    // Real API call
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
          }),
          catchError((error) => {
            console.error('Error creating user:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_USERS.findIndex(u => u.id === user.id);
      if (index === -1) {
        return this._mockService.simulateError('Usuario no encontrado', 404);
      }
      
      const updatedUser = { ...MOCK_USERS[index], ...user };
      MOCK_USERS[index] = updatedUser;
      
      return this.users$.pipe(
        take(1),
        switchMap(users => {
          if (!users) {
            return throwError(() => new Error('No users available'));
          }
          return this._mockService.simulateDelay(updatedUser).pipe(
            tap(() => {
              const userIndex = users.findIndex(item => item.id === user.id);
              if (userIndex !== -1) {
                users[userIndex] = updatedUser;
                this._users.next(users);
              }
              this._user.next(updatedUser);
            })
          );
        })
      );
    }
    
    // Real API call
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
            )),
            catchError((error) => {
              console.error('Error updating user:', error);
              return throwError(() => error);
            })
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_USERS.findIndex(u => u.id === user.id);
      if (index === -1) {
        return this._mockService.simulateError('Usuario no encontrado', 404);
      }
      
      const updatedUser = { ...MOCK_USERS[index], ...user };
      MOCK_USERS[index] = updatedUser;
      
      return this.users$.pipe(
        take(1),
        switchMap(users => {
          if (!users) {
            return throwError(() => new Error('No users available'));
          }
          return this._mockService.simulateDelay(updatedUser).pipe(
            tap(() => {
              this._user.next(updatedUser);
            })
          );
        })
      );
    }
    
    // Real API call
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
            )),
            catchError((error) => {
              console.error('Error updating user profile:', error);
              return throwError(() => error);
            })
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
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_USERS.findIndex(u => u.id === id);
      if (index === -1) {
        return this._mockService.simulateError('Usuario no encontrado', 404);
      }
      
      MOCK_USERS.splice(index, 1);
      
      return this.users$.pipe(
        take(1),
        switchMap(users => {
          if (!users) {
            return throwError(() => new Error('No users available'));
          }
          return this._mockService.simulateDelay(true).pipe(
            tap(() => {
              const userIndex = users.findIndex(item => item.id === id);
              if (userIndex !== -1) {
                users.splice(userIndex, 1);
                this._users.next(users);
              }
            })
          );
        })
      );
    }
    
    // Real API call
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
            return isDeleted;
          }),
          catchError((error) => {
            console.error('Error deleting user:', error);
            return throwError(() => error);
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
    // Mock mode
    if (this._mockService.isMockMode) {
      return this._mockService.simulateDelay({
        ok: true,
        message: 'Contraseña actualizada exitosamente'
      });
    }
    
    // Real API call
    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/reset-password`, passwords);
  }

  /**
   * Update user password
   *
   * @param data - Datos para actualizar contraseña del usuario
   */
  public updateUserPassword(data: { userId: number; password: string }): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const user = MOCK_USERS.find(u => u.id === data.userId);
      if (!user) {
        return this._mockService.simulateError('Usuario no encontrado', 404);
      }
      
      return this._mockService.simulateDelay({
        ok: true,
        message: 'Contraseña del usuario actualizada exitosamente'
      });
    }
    
    // Real API call
    return this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/auth/admin/users/reset-password`, data);
  }
}

