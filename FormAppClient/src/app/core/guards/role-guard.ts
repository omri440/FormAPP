import { inject } from '@angular/core';
import { ActivatedRouteSnapshot, CanActivateFn, Router } from '@angular/router';
import { Auth } from '../services/auth';

export const roleGuard: CanActivateFn = (route: ActivatedRouteSnapshot) => {
  const auth = inject(Auth);
  const router = inject(Router);

  const requiredRole = route.data['role'] as 'admin' | 'user';

  if (auth.currentUser()?.role === requiredRole) {
    return true;
  }

  return router.createUrlTree(['/unauthorized']);
};
