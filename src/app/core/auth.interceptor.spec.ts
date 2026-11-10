import { TestBed } from '@angular/core/testing';
import { HttpClient, provideHttpClient, withInterceptors } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { Router } from '@angular/router';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { API_CONFIG } from './config';
import { authInterceptor } from './auth.interceptor';
import { TokenStore } from './token-store.service';

describe('Interceptor de autenticación', () => {
  let http: HttpClient;
  let requests: HttpTestingController;
  const token = { token: vi.fn(() => 'private-test-token'), clear: vi.fn() };
  const router = { navigate: vi.fn() };
  beforeEach(() => {
    token.token.mockReturnValue('private-test-token');
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(withInterceptors([authInterceptor])), provideHttpClientTesting(),
      { provide: API_CONFIG, useValue: { baseUrl: 'https://server.test/api' } },
      { provide: TokenStore, useValue: token }, { provide: Router, useValue: router },
    ] });
    http = TestBed.inject(HttpClient);
    requests = TestBed.inject(HttpTestingController);
  });
  it('añade Bearer únicamente a solicitudes dirigidas a la API configurada', () => {
    http.get('https://server.test/api/journal').subscribe();
    const request = requests.expectOne('https://server.test/api/journal');
    expect(request.request.headers.get('Authorization')).toBe('Bearer private-test-token');
    request.flush([]);
    requests.verify();
  });
  it.each(['https://external.test/resource', 'https://server.test/api-evil/journal'])('no filtra el token a %s', url => {
    http.get(url).subscribe();
    const request = requests.expectOne(url);
    expect(request.request.headers.has('Authorization')).toBe(false);
    request.flush({});
  });
  it('cierra una sesión rechazada por el servidor y conserva el error', () => {
    let status = 0;
    http.get('https://server.test/api/journal').subscribe({ error: error => status = error.status });
    requests.expectOne('https://server.test/api/journal').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(status).toBe(401);
    expect(token.clear).toHaveBeenCalled();
    expect(router.navigate).toHaveBeenCalledWith(['/login'], { queryParams: { expired: '1' } });
  });
  it('una respuesta tardía de otra sesión no borra el token nuevo', () => {
    token.clear.mockClear();
    http.get('https://server.test/api/journal').subscribe({ error: () => {} });
    token.token.mockReturnValue('new-session-token');
    requests.expectOne('https://server.test/api/journal').flush({}, { status: 401, statusText: 'Unauthorized' });
    expect(token.clear).not.toHaveBeenCalled();
  });
});
