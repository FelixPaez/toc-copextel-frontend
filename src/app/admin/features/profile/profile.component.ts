import { Component, OnDestroy, OnInit, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MatSidenavModule, MatDrawer } from '@angular/material/sidenav';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatListModule } from '@angular/material/list';
import { BreakpointObserver } from '@angular/cdk/layout';
import { Subject } from 'rxjs';
import { map, shareReplay, takeUntil } from 'rxjs/operators';

import { UsersService } from '../users/users.service';
import { User } from '../users/users.types';
import { ProfileAccountComponent } from './account/account.component';
import { ProfileSecurityComponent } from './security/security.component';
import { ProfileImageComponent } from './image/image.component';

interface ProfilePanel {
  id: string;
  icon: string;
  title: string;
  description: string;
}

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [
    CommonModule,
    MatSidenavModule,
    MatButtonModule,
    MatIconModule,
    MatListModule,
    ProfileAccountComponent,
    ProfileSecurityComponent,
    ProfileImageComponent
  ],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.scss']
})
export class ProfileComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') drawer!: MatDrawer;

  drawerMode: 'over' | 'side' = 'side';
  drawerOpened = true;
  selectedPanel = 'account';
  user: User | null = null;

  panels: ProfilePanel[] = [
    {
      id: 'account',
      icon: 'person',
      title: 'Perfil',
      description: 'Administrar mi información personal'
    },
    {
      id: 'security',
      icon: 'lock',
      title: 'Seguridad',
      description: 'Actualizar contraseña'
    },
    {
      id: 'image',
      icon: 'camera_alt',
      title: 'Imagen',
      description: 'Actualizar mi imagen'
    }
  ];

  isHandset$ = this.breakpointObserver.observe('(max-width: 1024px)').pipe(
    map(result => result.matches),
    shareReplay(1)
  );

  private _unsubscribeAll = new Subject<any>();

  constructor(
    private breakpointObserver: BreakpointObserver,
    private usersService: UsersService
  ) {}

  ngOnInit(): void {
    this.usersService.user$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(user => {
        this.user = user;
      });

    this.isHandset$
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(isHandset => {
        this.drawerMode = isHandset ? 'over' : 'side';
        this.drawerOpened = !isHandset;
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }

  goToPanel(panelId: string): void {
    this.selectedPanel = panelId;
    if (this.drawerMode === 'over') {
      this.drawer.close();
    }
  }

  getPanelInfo(id: string): ProfilePanel | undefined {
    return this.panels.find(panel => panel.id === id);
  }

  closeIfHandset(): void {
    this.isHandset$.subscribe(isHandset => {
      if (isHandset) {
        this.drawer.close();
      }
    }).unsubscribe();
  }
}

