import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { AuthService } from '../services/auth.service';

// PUBLIC_INTERFACE
/**
 * Guard that checks if the user is authenticated; otherwise redirects to /login.
 */
export const AuthGuard: CanActivateFn = () => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (auth.getCurrentUser()) return true;
  router.navigate(['/login']);
  return false;
};
