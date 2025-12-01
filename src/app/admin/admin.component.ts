import { Component } from '@angular/core';
import { RouterModule } from '@angular/router';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatMenuModule } from '@angular/material/menu';
import { MatDividerModule } from '@angular/material/divider';
import { MatSidenavModule } from '@angular/material/sidenav';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatListModule } from '@angular/material/list';
import { MatExpansionModule } from '@angular/material/expansion';
import { AuthService } from './core/services/auth.service';
import { LoadingService, LoadingState } from './core/services/loading.service';
import { Observable } from 'rxjs';
import { BreakpointObserver } from '@angular/cdk/layout';
import { map, shareReplay } from 'rxjs/operators';

@Component({
  selector: 'app-admin',
  standalone: true,
  imports: [RouterModule, CommonModule, MatButtonModule, MatIconModule, MatMenuModule, MatDividerModule, MatSidenavModule, MatToolbarModule, MatListModule, MatExpansionModule],
  template: `
    <mat-sidenav-container class="admin-shell">
      <mat-sidenav #sidenav
                   [mode]="(isHandset$ | async) ? 'over' : 'side'"
                   class="admin-sidenav"
                   [opened]="(isHandset$ | async) ? false : true"
                   [fixedInViewport]="true">
        <div class="sidenav-header">
          <div class="brand">Panel de Control</div>
          <small class="brand-sub">Un vistazo rápido a los principales indicadores</small>
        </div>
        <nav class="nav-list" role="navigation" aria-label="Navegación principal">
          <mat-nav-list>
            <a mat-list-item routerLink="dashboard" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Ir al Dashboard"><mat-icon matListItemIcon aria-hidden="true">insights</mat-icon><span matListItemTitle>Estadísticas</span></a>
            <a mat-list-item routerLink="messages" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Ver mensajes"><mat-icon matListItemIcon aria-hidden="true">mail</mat-icon><span matListItemTitle>Mensajes</span></a>

            <div class="section-title" role="heading" aria-level="2">Operaciones</div>
            <a mat-list-item routerLink="products" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar productos"><mat-icon matListItemIcon aria-hidden="true">inventory_2</mat-icon><span matListItemTitle>Productos</span></a>
            <a mat-list-item routerLink="orders" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar órdenes"><mat-icon matListItemIcon aria-hidden="true">receipt_long</mat-icon><span matListItemTitle>Órdenes</span></a>

            <div class="section-title" role="heading" aria-level="2">Clientes</div>
            <a mat-list-item routerLink="customers" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar clientes"><mat-icon matListItemIcon aria-hidden="true">people</mat-icon><span matListItemTitle>Clientes</span></a>

            <div class="section-title" role="heading" aria-level="2">Nomencladores</div>
            <a mat-list-item routerLink="categories" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar categorías"><mat-icon matListItemIcon aria-hidden="true">category</mat-icon><span matListItemTitle>Categorías</span></a>
            <a mat-list-item routerLink="slides" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar diapositivas"><mat-icon matListItemIcon aria-hidden="true">slideshow</mat-icon><span matListItemTitle>Diapositivas</span></a>
            <a mat-list-item routerLink="banners" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar banners"><mat-icon matListItemIcon aria-hidden="true">campaign</mat-icon><span matListItemTitle>Banners</span></a>
            <a mat-list-item routerLink="services" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar servicios"><mat-icon matListItemIcon aria-hidden="true">handyman</mat-icon><span matListItemTitle>Servicios</span></a>
            <a mat-list-item routerLink="users" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar usuarios"><mat-icon matListItemIcon aria-hidden="true">person</mat-icon><span matListItemTitle>Usuarios</span></a>
            <a mat-list-item routerLink="vendors" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar vendedores"><mat-icon matListItemIcon aria-hidden="true">business</mat-icon><span matListItemTitle>Vendedores</span></a>
            <a mat-list-item routerLink="info" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar información"><mat-icon matListItemIcon aria-hidden="true">info</mat-icon><span matListItemTitle>Información</span></a>
            <a mat-list-item routerLink="couriers" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Gestionar transportistas"><mat-icon matListItemIcon aria-hidden="true">local_shipping</mat-icon><span matListItemTitle>Transportistas</span></a>

            <div class="section-title" role="heading" aria-level="2">Cuenta</div>
            <a mat-list-item routerLink="profile" routerLinkActive="active" (click)="closeIfHandset(sidenav)" aria-label="Ver mi perfil"><mat-icon matListItemIcon aria-hidden="true">account_circle</mat-icon><span matListItemTitle>Mi Perfil</span></a>
          </mat-nav-list>
        </nav>
      </mat-sidenav>
      <mat-sidenav-content>
        <mat-toolbar class="topbar">
          <button mat-icon-button class="menu-button" aria-label="Alternar menú" (click)="sidenav.toggle()"><mat-icon>menu</mat-icon></button>
          <span class="toolbar-title">Bienvenido, {{ currentUser?.fullName || 'Administrador Sistema' }}</span>
          <span class="spacer"></span>
          <div class="toolbar-icons" role="toolbar" aria-label="Herramientas de la barra superior">
            <button mat-mini-fab color="primary" class="mini-avatar" [matMenuTriggerFor]="userMenu" aria-label="Menú de usuario" type="button" [attr.aria-expanded]="false">{{ (currentUser?.fullName || 'A').charAt(0) }}</button>
          </div>
          <mat-menu #userMenu="matMenu">
            <div class="user-info">
              <div class="user-name">{{ currentUser?.fullName || 'Usuario' }}</div>
              <div class="user-email">{{ currentUser?.email || 'usuario@ejemplo.com' }}</div>
            </div>
            <mat-divider></mat-divider>
            <button mat-menu-item (click)="onLogout()">
              <mat-icon>logout</mat-icon>
              <span>Cerrar Sesión</span>
            </button>
          </mat-menu>
        </mat-toolbar>
        <main class="admin-content">
          @if ((loading$ | async)?.isLoading) {
            <div class="loading-overlay">
              <div class="loading-spinner"></div>
            </div>
          }
          <router-outlet></router-outlet>
        </main>
      </mat-sidenav-content>
    </mat-sidenav-container>
  `,
  styles: [`
    .admin-shell { 
      height: 100vh; 
      display: flex;
      flex-direction: column;
    }
    
    ::ng-deep .mat-sidenav-container {
      height: 100vh;
      overflow: hidden;
    }
    
    ::ng-deep .mat-sidenav-content {
      height: 100vh;
      display: flex;
      flex-direction: column;
      overflow: hidden;
    }
    
    .topbar { 
      position: relative;
      flex-shrink: 0;
      z-index: 10; 
      background: linear-gradient(180deg, var(--admin-topbar-bg-start), var(--admin-topbar-bg-end)); 
      color: var(--admin-gray-900); 
      box-shadow: var(--admin-shadow); 
      border-bottom: 1px solid var(--admin-gray-200); 
      height: var(--admin-topbar-height); 
      min-height: var(--admin-topbar-height); 
    }
    .menu-button { margin-right: 8px; }
    .toolbar-title { font-weight: 600; }
    .spacer { flex: 1; }
    .hide-desktop { display: none; }
    .toolbar-icons { display: flex; align-items: center; gap: 8px; }
    .mini-avatar { width: 32px; height: 32px; font-weight: 700; }

    .admin-sidenav { 
      width: var(--admin-sidenav-width); 
      background: linear-gradient(180deg, var(--admin-sidenav-bg-start), var(--admin-sidenav-bg-end)); 
      border-right: 1px solid var(--admin-gray-200);
      overflow-y: auto;
      overflow-x: hidden;
    }
    .sidenav-header { background: linear-gradient(180deg, #ffffff, #f3f5ff); border-bottom: 1px solid var(--admin-gray-200); border-top: 1px solid rgba(255,255,255,0.6); border-radius: 0; }
    .nav-list a.mat-mdc-list-item { transition: background-color .2s ease, color .2s ease; }
    .nav-list a.mat-mdc-list-item:hover { background: rgba(0,0,0,.04); }
    .sidenav-header { padding: 16px; color: var(--admin-primary); }
    .sidenav-header .brand { font-weight: 800; letter-spacing: .3px; }
    .sidenav-header .brand-sub { color: var(--admin-gray-600); display: block; margin-top: 4px; }
    .nav-list { padding: 0 12px; padding-top: 8px; }
    .nav-list .section-title { padding: 12px 16px 6px 16px; font-size: 11px; text-transform: uppercase; letter-spacing: .6px; color: var(--admin-gray-600); }
    .nav-list a.mat-mdc-list-item { height: 40px; padding: 0 12px; border-radius: 8px; }
    .nav-list a.mat-mdc-list-item .mdc-list-item__content { display: flex; align-items: center; }
    .nav-list a.mat-mdc-list-item .mat-icon { margin-right: 10px; color: var(--admin-gray-700); font-size: 20px; width: 20px; height: 20px; display: inline-flex; align-items: center; justify-content: center; }
    .nav-list a.mat-mdc-list-item span { font-size: 14px; font-weight: 500; color: var(--admin-gray-800); line-height: 1; }
    .nav-list a.active { background: rgba(var(--admin-primary-rgb),0.10); border-left: 3px solid var(--admin-primary); }

    .admin-content { 
      flex: 1;
      overflow-y: auto;
      overflow-x: hidden;
      padding: 8px; 
      background: #f5f5f5;
      box-sizing: border-box;
    }

    .loading-overlay {
      position: fixed;
      inset: 0;
      background: rgba(255,255,255,0.6);
      display: flex;
      align-items: center;
      justify-content: center;
      z-index: 1000;
    }
    .loading-spinner {
      width: 42px;
      height: 42px;
      border-radius: 50%;
      border: 4px solid rgba(var(--admin-primary-rgb), 0.2);
      border-top-color: var(--admin-primary);
      animation: spin 0.9s linear infinite;
    }
    @keyframes spin {
      to { transform: rotate(360deg); }
    }

    @media (max-width: 1024px) {
      .admin-sidenav { width: 220px; }
    }
    @media (max-width: 1024px) {
      .admin-content { padding: 8px; }
    }
  `]
})
export class AdminComponent {
  currentUser: any = null;
  loading$: Observable<LoadingState>;
  isHandset$: Observable<boolean>;

  constructor(
    private authService: AuthService,
    private loadingService: LoadingService,
    private breakpointObserver: BreakpointObserver
  ) {
    this.currentUser = this.authService.getCurrentUser();
    this.loading$ = this.loadingService.loading$;
    this.isHandset$ = this.breakpointObserver
      .observe('(max-width: 1024px)')
      .pipe(map(state => state.matches), shareReplay(1));
  }

  closeIfHandset(sidenav: any): void {
    this.isHandset$.subscribe(isHandset => { if (isHandset) { sidenav.close(); } }).unsubscribe();
  }

  onLogout(): void {
    this.authService.signOut();
  }
}
