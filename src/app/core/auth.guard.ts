import { inject } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { catchError, map, of } from 'rxjs';
import { AuthService } from './auth.service';

export const authGuard: CanActivateFn = (_, state) => {
  const auth = inject(AuthService);
  const router = inject(Router);
  if (!auth.authenticated()) return router.createUrlTree(['/login'], { queryParams: { returnUrl: state.url } });
  return auth.profile().pipe(map(() => true), catchError(error => {
    if (error.status === 401) {
      auth.clear();
      return of(router.createUrlTree(['/login']));
    }
    return of(true);
  }));
};

export function safeReturnUrl(value: string | null): string {
  return value && /^\/(dashboard|journal|analysis|library|tracking|support|settings)(\/|$|\?)/.test(value)
    && !value.includes('\\') ? value : '/dashboard';
}
