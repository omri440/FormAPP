import { Routes } from '@angular/router';

export const ADMIN_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/admin-layout').then(m => m.AdminLayout),
    children: [
      {
        path: '',
        loadComponent: () =>
          import('./home/admin-home').then(m => m.AdminHome),
        pathMatch: 'full'
      },
      {
        path: 'forms',
        loadComponent: () =>
          import('./forms-list/forms-list').then(m => m.FormsList)
      },
      {
        path: 'form-builder',
        loadComponent: () =>
          import('./form-builder/form-builder').then(m => m.FormBuilderComponent)
      },
      {
        path: 'submissions',
        loadComponent: () =>
          import('./submissions/submissions').then(m => m.Submissions)
      },
      {
        path: 'analytics',
        loadComponent: () =>
          import('./analytics/analytics').then(m => m.Analytics)
      }
    ]
  }
];
