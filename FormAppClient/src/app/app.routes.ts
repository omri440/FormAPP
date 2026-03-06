import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth-guard';
import { roleGuard } from './core/guards/role-guard';

export const routes: Routes = [
  { path: '', redirectTo: '/auth/login', pathMatch: 'full' },

  {
    path: 'auth',
    loadChildren: () =>
      import('./features/auth/auth.routes').then(m => m.AUTH_ROUTES)
  },

  // Admin area (admin role required)
  {
    path: 'admin',
    canActivate: [authGuard, roleGuard],
    data: { role: 'admin' },
    loadChildren: () =>
      import('./features/admin/admin.routes').then(m => m.ADMIN_ROUTES)
  },

  // User area — dashboard + my-submissions wrapped in UserLayout navbar
  {
    path: 'dashboard',
    canActivate: [authGuard],
    loadComponent: () =>
      import('./features/user/layout/user-layout').then(m => m.UserLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./features/dashboard/dashboard').then(m => m.Dashboard),
        pathMatch: 'full'
      },
      {
        path: 'my-submissions',
        loadComponent: () =>
          import('./features/user/my-submissions/my-submissions').then(m => m.MySubmissions)
      }
    ]
  },

  // Form submission page (also under user navbar)
  {
    path: 'user',
    canActivate: [authGuard],
    loadChildren: () =>
      import('./features/user/user.routes').then(m => m.USER_ROUTES)
  },

  {
    path: 'unauthorized',
    loadComponent: () =>
      import('./features/unauthorized/unauthorized').then(m => m.Unauthorized)
  },

  { path: '**', redirectTo: '/auth/login' }
];
