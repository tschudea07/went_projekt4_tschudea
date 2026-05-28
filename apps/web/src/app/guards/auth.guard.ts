import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthSessionService } from '../services/auth-session.service';

export const authGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const isAuthenticated = authSession.isAuthenticated() || (await authSession.refresh());

  if (isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/login']);
};

export const guestGuard: CanActivateFn = async () => {
  const authSession = inject(AuthSessionService);
  const router = inject(Router);
  const isAuthenticated = authSession.isAuthenticated() || (await authSession.refresh());

  if (!isAuthenticated) {
    return true;
  }

  return router.createUrlTree(['/projects']);
};
