import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, of, ReplaySubject, throwError } from 'rxjs';
import { map, switchMap, take, tap, catchError } from 'rxjs/operators';

// Types
import { Message } from './messages.types';
import { IResponse, TablePagination } from '../../core/models/shared.types';

// Variables
import { environment } from '../../../../environments/environment';

// Mock Data & Services
import { MOCK_MESSAGES } from '../../mocks/data/messages.mock';
import { MockService } from '../../core/services/mock.service';
import { applyMockPagination } from '../../mocks/mock-helpers';

// API URL
const API_URL_GATEWAY = environment.API_URL_GATEWAY;

/**
 * Messages Service
 * Servicio para gestión de mensajes
 */
@Injectable({
  providedIn: 'root'
})
export class MessagesService {
  // Public properties
  public selectedMessageChanged: BehaviorSubject<Message | null> = new BehaviorSubject<Message | null>(null);

  // Private properties
  private _message: ReplaySubject<Message | null> = new ReplaySubject<Message | null>(1);
  private _messages: ReplaySubject<Message[]> = new ReplaySubject<Message[]>(1);
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
   * Getter for message
   */
  get message$(): Observable<Message | null> {
    return this._message.asObservable();
  }

  /**
   * Getter for messages
   */
  get messages$(): Observable<Message[]> {
    return this._messages.asObservable();
  }

  /**
   * Getter for pagination
   */
  get pagination$(): Observable<TablePagination | null> {
    return this._pagination.asObservable();
  }

  // -----------------------------------------------------------------------------------------------------
  // @ Public methods
  // -----------------------------------------------------------------------------------------------------

  /**
   * Get all messages with pagination and filters
   */
  public getAllMessages(
    pageIndex: number = 0,
    pageSize: number = 10,
    sortBy: string = 'createdAt',
    sortOrder: 'asc' | 'desc' = 'desc',
    filter: string = 'all',
    search: string = ''
  ): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      let messages = [...MOCK_MESSAGES];
      
      // Apply filter
      if (filter !== 'all') {
        switch (filter) {
          case 'unread':
            messages = messages.filter(m => !m.read);
            break;
          case 'read':
            messages = messages.filter(m => m.read);
            break;
          case 'sent':
            messages = messages.filter(m => m.sent);
            break;
          case 'starred':
            messages = messages.filter(m => m.starred);
            break;
          case 'important':
            messages = messages.filter(m => m.important);
            break;
        }
      }
      
      // Apply search
      if (search) {
        const searchLower = search.toLowerCase();
        messages = messages.filter(m => 
          m.name?.toLowerCase().includes(searchLower) ||
          m.subject?.toLowerCase().includes(searchLower) ||
          m.content?.toLowerCase().includes(searchLower)
        );
      }
      
      // Apply pagination
      const paginatedResult = applyMockPagination(messages, pageIndex, pageSize, sortBy, sortOrder);
      const paginatedMessages = paginatedResult.data;
      const pagination = paginatedResult.pagination;
      
      this._messages.next(paginatedMessages);
      this._pagination.next(pagination);

      return this._mockService.simulateDelay({
        ok: true,
        contactMessages: paginatedMessages,
        pagination: pagination
      });
    }

    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/notify/messages/`, {
      params: {
        page: pageIndex.toString(),
        size: pageSize.toString(),
        sortBy: sortBy,
        sortOrder: sortOrder,
        filter: filter,
        search: search
      }
    }).pipe(
      tap((response: IResponse) => {
        if (response.contactMessages) {
          this._messages.next(response.contactMessages);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      }),
      catchError((error) => {
        console.error('Error getting all messages:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get messages by vendor
   */
  public getMessagesByVendor(vendorId: string): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const messages = MOCK_MESSAGES.filter(m => m.vendorId === vendorId);
      this._messages.next(messages);
      this._pagination.next({
        length: messages.length,
        size: 10,
        page: 0,
        lastPage: 0,
        startIndex: 0,
        endIndex: messages.length - 1
      });

      return this._mockService.simulateDelay({
        ok: true,
        contactMessages: messages,
        pagination: this._pagination.value
      });
    }

    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/notify/messages/by-vendor/${vendorId}`).pipe(
      tap((response) => {
        if (response.contactMessages) {
          this._messages.next(response.contactMessages);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      }),
      catchError((error) => {
        console.error('Error getting messages by vendor:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get messages by user
   */
  public getMessagesByUser(userId: number): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const messages = MOCK_MESSAGES.filter(m => m.userId === userId);
      this._messages.next(messages);
      this._pagination.next({
        length: messages.length,
        size: 10,
        page: 0,
        lastPage: 0,
        startIndex: 0,
        endIndex: messages.length - 1
      });

      return this._mockService.simulateDelay({
        ok: true,
        contactMessages: messages,
        pagination: this._pagination.value
      });
    }

    // Real API call
    return this._httpClient.get<IResponse>(`${API_URL_GATEWAY}/notify/messages/by-user/${userId}`).pipe(
      tap((response) => {
        if (response.contactMessages) {
          this._messages.next(response.contactMessages);
        }
        if (response.pagination) {
          this._pagination.next(response.pagination);
        }
      }),
      catchError((error) => {
        console.error('Error getting messages by user:', error);
        return throwError(() => error);
      })
    );
  }

  /**
   * Get message by id
   */
  public getMessageById(id: string): Observable<Message> {
    return this.messages$.pipe(
      take(1),
      map((messages) => {
        const message = messages.find(item => item.id === id) || null;

        if (message) {
          this._message.next(message);
        }

        return message;
      }),
      switchMap((message) => {
        if (!message) {
          return throwError(() => new Error(`No existe un mensaje con ese id: ${id}`));
        }
        return of(message);
      })
    );
  }

  /**
   * Create a message
   */
  public create(message: Message): Observable<IResponse> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const newMessage: Message = {
        ...message,
        id: `msg-${Date.now()}`,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString()
      };
      MOCK_MESSAGES.unshift(newMessage);

      return this.messages$.pipe(
        take(1),
        switchMap(messages => {
          if (!messages) {
            messages = [];
          }
          return this._mockService.simulateDelay({
            ok: true,
            message: 'Mensaje creado exitosamente',
            contactMessage: newMessage
          }).pipe(
            tap(() => {
              this._messages.next([newMessage, ...messages]);
            })
          );
        })
      );
    }

    // Real API call
    return this.messages$.pipe(
      take(1),
      switchMap(messages => this._httpClient.post<IResponse>(`${API_URL_GATEWAY}/notify/messages/`, message).pipe(
        map((response) => {
          if (response.contactMessage) {
            this._messages.next([...messages, response.contactMessage]);
          }
          return response;
        }),
        catchError((error) => {
          console.error('Error creating message:', error);
          return throwError(() => error);
        })
      ))
    );
  }

  /**
   * Update the message
   */
  public update(id: string, message: Message): Observable<Message> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_MESSAGES.findIndex(m => m.id === id);
      if (index === -1) {
        return throwError(() => new Error('Message not found'));
      }

      const updatedMessage = {
        ...MOCK_MESSAGES[index],
        ...message,
        updatedAt: new Date().toISOString()
      };
      MOCK_MESSAGES[index] = updatedMessage;

      return this.messages$.pipe(
        take(1),
        switchMap(messages => {
          const msgIndex = messages.findIndex(item => item.id === id);
          if (msgIndex !== -1) {
            messages[msgIndex] = updatedMessage;
            this._messages.next(messages);
          }
          this._message.next(updatedMessage);
          return this._mockService.simulateDelay(updatedMessage);
        })
      );
    }

    // Real API call
    return this.messages$.pipe(
      take(1),
      switchMap(messages => this._httpClient.put<IResponse>(`${API_URL_GATEWAY}/notify/messages/${id}`, message).pipe(
        map((response) => {
          if (response.contactUpdatedMessage) {
            const index = messages.findIndex(item => item.id === id);
            if (index !== -1) {
              messages[index] = response.contactUpdatedMessage;
              this._messages.next(messages);
            }
            this._message.next(response.contactUpdatedMessage);
            return response.contactUpdatedMessage;
          }
          throw new Error('Update failed');
        }),
        catchError((error) => {
          console.error('Error updating message:', error);
          return throwError(() => error);
        })
      ))
    );
  }

  /**
   * Update message (simplified)
   */
  public updateMessage(id: string, message: Message): Observable<IResponse> {
    return this.update(id, message).pipe(
      map((updatedMessage) => ({
        ok: true,
        message: 'Mensaje actualizado exitosamente',
        contactUpdatedMessage: updatedMessage
      }))
    );
  }

  /**
   * Delete the message
   */
  public delete(id: string): Observable<boolean> {
    // Mock mode
    if (this._mockService.isMockMode) {
      const index = MOCK_MESSAGES.findIndex(m => m.id === id);
      if (index === -1) {
        return throwError(() => new Error('Message not found'));
      }

      MOCK_MESSAGES.splice(index, 1);

      return this.messages$.pipe(
        take(1),
        switchMap(messages => {
          const msgIndex = messages.findIndex(item => item.id === id);
          if (msgIndex !== -1) {
            messages.splice(msgIndex, 1);
            this._messages.next(messages);
          }
          return this._mockService.simulateDelay(true);
        })
      );
    }

    // Real API call
    return this.messages$.pipe(
      take(1),
      switchMap(messages => this._httpClient.delete<IResponse>(`${API_URL_GATEWAY}/notify/messages/${id}`).pipe(
        map(() => {
          const index = messages.findIndex(item => item.id === id);
          if (index !== -1) {
            messages.splice(index, 1);
            this._messages.next(messages);
          }
          return true;
        }),
        catchError((error) => {
          console.error('Error deleting message:', error);
          return throwError(() => error);
        })
      ))
    );
  }

  /**
   * Mark all messages as read
   */
  public markAllAsRead(): Observable<boolean> {
    // Mock mode
    if (this._mockService.isMockMode) {
      MOCK_MESSAGES.forEach(message => {
        message.read = true;
      });

      return this.messages$.pipe(
        take(1),
        switchMap(messages => {
          messages.forEach(message => {
            message.read = true;
          });
          this._messages.next(messages);
          return this._mockService.simulateDelay(true);
        })
      );
    }

    // Real API call
    return this.messages$.pipe(
      take(1),
      switchMap(messages => this._httpClient.get<boolean>(`${API_URL_GATEWAY}/notify/messages/mark-all-as-read`).pipe(
        map((isUpdated: boolean) => {
          messages.forEach(message => {
            message.read = true;
          });
          this._messages.next(messages);
          return isUpdated;
        }),
        catchError((error) => {
          console.error('Error marking all as read:', error);
          return throwError(() => error);
        })
      ))
    );
  }
}

