import { Routes } from '@angular/router';

export const USER_ROUTES: Routes = [
  {
    path: '',
    loadComponent: () =>
      import('./layout/user-layout').then(m => m.UserLayout),
    children: [
      {
        path: 'submit/:formId',
        loadComponent: () =>
          import('./form-submission/form-submission').then(m => m.FormSubmission)
      }
    ]
  }
];
