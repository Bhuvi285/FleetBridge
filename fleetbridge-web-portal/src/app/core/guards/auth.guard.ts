import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

export const authGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initialAuthResolver;

  if (authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/auth/login']);
  return false;
};

export const guestGuard: CanActivateFn = async () => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initialAuthResolver;

  if (!authService.isAuthenticated()) {
    return true;
  }

  router.navigate(['/dashboard']);
  return false;
};

export const roleGuard: CanActivateFn = async (route) => {
  const authService = inject(AuthService);
  const router = inject(Router);

  await authService.initialAuthResolver;

  if (!authService.isAuthenticated()) {
    router.navigate(['/auth/login']);
    return false;
  }

  const requiredRoles = route.data?.['roles'] as string[];
  if (!requiredRoles || requiredRoles.length === 0) {
    return true; // No specific roles required
  }

  const userRoles = authService.userRoles();
  const hasRole = requiredRoles.some(role => userRoles.includes(role));

  if (!hasRole) {
    router.navigate(['/dashboard']); // or an unauthorized page
    return false;
  }

  return true;
};
