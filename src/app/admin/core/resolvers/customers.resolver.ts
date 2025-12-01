import { Injectable } from '@angular/core';
import { Resolve, ActivatedRouteSnapshot, RouterStateSnapshot } from '@angular/router';
import { Observable, of, forkJoin } from 'rxjs';
import { catchError, map } from 'rxjs/operators';
import { CustomersService } from '../../features/customers/customers.service';
import { NaturalCustomer, LegalCustomer } from '../../features/customers/customers.types';
import { IResponse } from '../models/shared.types';

export interface CustomersResolverData {
  naturalCustomers: NaturalCustomer[];
  legalCustomers: LegalCustomer[];
  pagination: any;
}

/**
 * Customers Resolver
 * Precarga clientes naturales y legales antes de navegar a la ruta
 */
@Injectable({ providedIn: 'root' })
export class CustomersResolver implements Resolve<CustomersResolverData> {
  constructor(private customersService: CustomersService) {}

  resolve(route: ActivatedRouteSnapshot, state: RouterStateSnapshot): Observable<CustomersResolverData> {
    // Cargar clientes naturales y legales en paralelo
    const naturals$ = this.customersService.getNaturalCustomers(0, 10, 'createdAt', 'desc', '').pipe(
      catchError(() => of({ ok: true, clients: [], pagination: null } as IResponse))
    );

    const legals$ = this.customersService.getLegalCustomers().pipe(
      catchError(() => of([] as LegalCustomer[]))
    );

    return forkJoin({
      naturals: naturals$,
      legals: legals$
    }).pipe(
      map(({ naturals, legals }) => {
        const naturalsResponse = naturals as IResponse;
        return {
          naturalCustomers: (naturalsResponse?.clients as NaturalCustomer[]) || [],
          legalCustomers: (legals as LegalCustomer[]) || [],
          pagination: naturalsResponse?.pagination || null
        };
      })
    );
  }
}

