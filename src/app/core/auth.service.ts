import { computed, effect, inject, Injectable, signal } from '@angular/core';
import { catchError, finalize, switchMap, tap, throwError } from 'rxjs';
import { ApiClient } from './api-client.service';
import { TokenStore } from './token-store.service';
import type { Credentials, Registration, TokenResponse, User } from './models/auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private api = inject(ApiClient);
  readonly tokens = inject(TokenStore);
  readonly user = signal<User | null>(null);
  readonly authenticated = computed(() => !!this.tokens.token());

  constructor() {
    effect(() => { if (!this.tokens.token()) this.user.set(null); });
  }
  login(credentials: Credentials) {
    return this.api.post<TokenResponse>('/auth/login', credentials).pipe(
      tap(result => this.tokens.set(result.access_token)),
      switchMap(() => this.profile()),
      catchError(error => { this.clear(); return throwError(() => error); }),
    );
  }
  register(data: Registration) { return this.api.post<User>('/auth/register', data); }
  profile() { return this.api.get<User>('/users/me').pipe(tap(user => this.user.set(user))); }
  updateProfile(data: { name: string; country: string }) {
    return this.api.patch<User>('/users/me', data).pipe(tap(user => this.user.set(user)));
  }
  changePassword(data: { current_password: string; new_password: string }) {
    return this.api.post<void>('/users/me/password', data).pipe(tap(() => this.clear()));
  }
  logout() {
    return this.api.post<void>('/auth/logout').pipe(finalize(() => this.clear()));
  }
  clear() { this.tokens.clear(); this.user.set(null); }
}
