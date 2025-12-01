import { Component, OnDestroy, OnInit, ViewChild, ViewEncapsulation } from '@angular/core';
import { MatDrawer, MatSidenavModule } from '@angular/material/sidenav';
import { CommonModule } from '@angular/common';
import { RouterModule, RouterOutlet } from '@angular/router';
import { Subject } from 'rxjs';
import { takeUntil } from 'rxjs/operators';
import { BreakpointObserver, Breakpoints } from '@angular/cdk/layout';
import { MessagesSidebarComponent } from './messages-sidebar/messages-sidebar.component';

@Component({
  selector: 'app-messages',
  standalone: true,
  imports: [
    CommonModule,
    RouterModule,
    RouterOutlet,
    MatSidenavModule,
    MessagesSidebarComponent
  ],
  templateUrl: './messages.component.html',
  styleUrls: ['./messages.component.scss'],
  encapsulation: ViewEncapsulation.None
})
export class MessagesComponent implements OnInit, OnDestroy {
  @ViewChild('drawer') public drawer!: MatDrawer;

  public drawerMode: 'over' | 'side' = 'side';
  public drawerOpened: boolean = true;

  private _unsubscribeAll: Subject<any> = new Subject<any>();

  constructor(
    private _breakpointObserver: BreakpointObserver
  ) { }

  ngOnInit(): void {
    // Subscribe to media changes
    this._breakpointObserver.observe([Breakpoints.Medium, Breakpoints.Large, Breakpoints.XLarge])
      .pipe(takeUntil(this._unsubscribeAll))
      .subscribe(result => {
        if (result.matches) {
          this.drawerMode = 'side';
          this.drawerOpened = true;
        } else {
          this.drawerMode = 'over';
          this.drawerOpened = false;
        }
      });
  }

  ngOnDestroy(): void {
    this._unsubscribeAll.next(null);
    this._unsubscribeAll.complete();
  }
}

