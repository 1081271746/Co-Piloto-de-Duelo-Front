import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG } from './config';
import { AuthService } from './auth.service';
import { TokenStore } from './token-store.service';

const USER = { id: 'fictional-user', email: 'fictional@example.com', name: 'Fictional', country: 'CO', created_at: '2026-01-01T00:00:00Z' };

describe('Servicio de autenticación contra el contrato real', () => {
  let service: AuthService;
  let requests: HttpTestingController;
  beforeEach(() => {
    sessionStorage.clear();
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: '/api' } },
    ] });
    service = TestBed.inject(AuthService);
    requests = TestBed.inject(HttpTestingController);
  });
  it('registra sin inventar una sesión ni guardar la contraseña', () => {
    const payload = { email: USER.email, name: USER.name, country: 'CO', password: 'FictionalPassword123' };
    service.register(payload).subscribe(value => expect(value).toEqual(USER));
    const request = requests.expectOne('/api/auth/register');
    expect(request.request.body).toEqual(payload);
    request.flush(USER);
    expect(service.authenticated()).toBe(false);
    expect(sessionStorage.length).toBe(0);
  });
  it('guarda token y consulta el perfil real después de iniciar sesión', () => {
    const value = `a.${btoa(JSON.stringify({ exp: Math.floor(Date.now() / 1000) + 60 }))}.b`;
    service.login({ email: USER.email, password: 'fictional' }).subscribe(user => expect(user).toEqual(USER));
    requests.expectOne('/api/auth/login').flush({ access_token: value, token_type: 'bearer', expires_in: 60 });
    requests.expectOne('/api/users/me').flush(USER);
    expect(service.user()).toEqual(USER);
    expect(service.authenticated()).toBe(true);
    service.clear();
  });
  it('limpia el estado local aunque falle la revocación remota', () => {
    service.user.set(USER);
    service.logout().subscribe({ error: () => {} });
    requests.expectOne('/api/auth/logout').flush({}, { status: 503, statusText: 'Unavailable' });
    expect(service.user()).toBeNull();
    expect(TestBed.inject(TokenStore).token()).toBeNull();
  });
  it('el cambio de contraseña invalida la sesión al tener éxito', () => {
    service.user.set(USER);
    service.changePassword({ current_password: 'fictional-old', new_password: 'fictional-new-long' }).subscribe();
    const request = requests.expectOne('/api/users/me/password');
    expect(request.request.method).toBe('POST');
    request.flush(null, { status: 204, statusText: 'No Content' });
    expect(service.user()).toBeNull();
  });
});
