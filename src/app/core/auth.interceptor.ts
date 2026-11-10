import { inject } from '@angular/core';
import { HttpInterceptorFn } from '@angular/common/http';
import { Router } from '@angular/router';
import { catchError, throwError } from 'rxjs';
import { API_CONFIG } from './config';
import { TokenStore } from './token-store.service';

export const authInterceptor: HttpInterceptorFn = (request, next) => {
  const store = inject(TokenStore);
  const router = inject(Router);
  const config = inject(API_CONFIG);
  const trusted = request.url === config.baseUrl || request.url.startsWith(config.baseUrl + '/');
  const token = store.token();
  const sent = trusted && token ? request.clone({ setHeaders: { Authorization: `Bearer ${token}` } }) : request;
  return next(sent).pipe(catchError(error => {
    if (trusted && token && error.status === 401 && store.token() === token) {
      store.clear();
      void router.navigate(['/login'], { queryParams: { expired: '1' } });
    }
    return throwError(() => error);
  }));
};
