import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../auth/auth.service';
import { Role } from '../auth/auth.models';

export const roleGuard: CanActivateFn = (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  const requiredRoles = (route.data?.['roles'] ?? []) as Role[];
  const user = authService.getCurrentUser();

  if (!user || requiredRoles.length === 0 || requiredRoles.includes(user.role)) {
    return true;
  }

  return router.createUrlTree(['/login']);
};
