import { Routes } from '@angular/router';
import { AdminComponent } from './admin.component';
import { AuthGuard } from './core/guards/auth.guard';
import { RoleGuard } from './core/guards/role.guard';

export const ADMIN_ROUTES: Routes = [
  // Auth routes (outside of admin layout)
  {
    path: 'auth',
    loadChildren: () => import('./features/auth/auth.module').then(m => m.AuthModule)
  },
  
  // Admin layout routes (protected)
  {
    path: '',
    component: AdminComponent,
    canActivate: [AuthGuard],
    children: [
      // Dashboard
      {
        path: 'dashboard',
        loadChildren: () => import('./features/dashboard/dashboard.module').then(m => m.DashboardModule)
      },

      // Products Management
      {
        path: 'products',
        loadChildren: () => import('./features/products/products.module').then(m => m.ProductsModule)
      },

      // Orders Management
      {
        path: 'orders',
        loadChildren: () => import('./features/orders/orders.module').then(m => m.OrdersModule)
      },

      // Customers Management
      {
        path: 'customers',
        loadChildren: () => import('./features/customers/customers.module').then(m => m.CustomersModule)
      },

          // Banners Management
          {
            path: 'banners',
            loadChildren: () => import('./features/banners/banners.module').then(m => m.BannersModule)
          },

          // Categories Management
          {
            path: 'categories',
            loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule)
          },

          // Slides Management
          {
            path: 'slides',
            loadChildren: () => import('./features/slides/slides.module').then(m => m.SlidesModule)
          },

          // Information Management
          {
            path: 'info',
            loadChildren: () => import('./features/info/info.module').then(m => m.InfoModule)
          },

          // Services Management
          {
            path: 'services',
            loadChildren: () => import('./features/services/services.module').then(m => m.ServicesModule)
          },

          // Users Management
          {
            path: 'users',
            loadChildren: () => import('./features/users/users.module').then(m => m.UsersModule)
          },

          // Vendors Management
          {
            path: 'vendors',
            loadChildren: () => import('./features/vendors/vendors.module').then(m => m.VendorsModule)
          },

      // Reports & Analytics
      {
        path: 'reports',
        canActivate: [RoleGuard],
        data: { roleGuard: { permissions: ['reports:read'], redirectTo: 'dashboard' } },
        loadChildren: () => import('./features/reports/reports.module').then(m => m.ReportsModule)
      },

      // Settings
      {
        path: 'settings',
        canActivate: [RoleGuard],
        data: { roleGuard: { permissions: ['settings:read'], redirectTo: 'dashboard' } },
        loadChildren: () => import('./features/settings/settings.module').then(m => m.SettingsModule)
      },

      // Default redirect to dashboard
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full'
      }
    ]
  },

  // Catch all route - redirect to auth login
  {
    path: '**',
    redirectTo: 'auth/login'
  }
];
