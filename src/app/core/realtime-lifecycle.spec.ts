import { TestBed } from '@angular/core/testing';
import { signal } from '@angular/core';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { of } from 'rxjs';
import { AuthService } from './auth.service';
import { API_CONFIG } from './config';
import { RealtimeService } from './realtime.service';

class FakeSocket {
  static OPEN = 1;
  static CLOSED = 3;
  static all: FakeSocket[] = [];
  readyState = 1;
  onopen?: () => void;
  onmessage?: (event: { data: string }) => void;
  onclose?: (event: { code: number }) => void;
  onerror?: () => void;
  sent: string[] = [];
  constructor(readonly url: string) { FakeSocket.all.push(this); }
  send(value: string) { this.sent.push(value); }
  close(code = 1000) { this.readyState = 3; this.onclose?.({ code }); }
  message(value: unknown) { this.onmessage?.({ data: JSON.stringify(value) }); }
}

describe('Ciclo de vida del WebSocket real con transporte simulado', () => {
  let service: RealtimeService;
  let socket: FakeSocket;
  let token: ReturnType<typeof signal<string | null>>;
  beforeEach(() => {
    vi.useFakeTimers();
    FakeSocket.all = [];
    vi.stubGlobal('WebSocket', FakeSocket);
    token = signal<string | null>('fictional-test-token');
    TestBed.configureTestingModule({ providers: [
      { provide: API_CONFIG, useValue: { baseUrl: '/api', websocketUrl: 'wss://example.com/api/ws' } },
      { provide: AuthService, useValue: {
        tokens: { token }, user: signal({ id: 'user-a' }), authenticated: () => !!token(),
        profile: () => of({ id: 'user-a' }),
      } },
    ] });
    service = TestBed.inject(RealtimeService);
    TestBed.tick();
    socket = FakeSocket.all[0];
  });
  afterEach(() => { service.disconnect(); vi.useRealTimers(); vi.unstubAllGlobals(); });
  it('envía el JWT solo en el mensaje inicial, no en la URL', () => {
    socket.onopen?.();
    expect(socket.url).toBe('wss://example.com/api/ws');
    expect(socket.sent).toEqual([JSON.stringify({ type: 'authenticate', access_token: 'fictional-test-token' })]);
    expect(service.state()).toBe('connecting');
  });
  it('no muestra conectado hasta recibir ready y envía solo ping como mantenimiento', () => {
    socket.message({ type: 'ready', user_id: 'user-a', delivery: 'at_most_once' });
    expect(service.state()).toBe('connected');
    vi.advanceTimersByTime(20_001);
    expect(socket.sent).toEqual([JSON.stringify({ type: 'ping' })]);
  });
  it('deduplica eventos del usuario y solicita refresco', () => {
    let events = 0;
    service.events$.subscribe(() => events++);
    socket.message({ type: 'ready', user_id: 'user-a', delivery: 'at_most_once' });
    const event = { id: 'event-a', user_id: 'user-a', type: 'journal.created', occurred_at: '2026-01-01T00:00:00Z', data: { entry_id: 'entry-a' } };
    socket.message(event);
    socket.message(event);
    socket.message({ ...event, id: 'event-b', user_id: 'user-b' });
    expect(events).toBe(1);
  });
  it('reconecta después de un corte y libera el transporte al cerrar sesión', () => {
    socket.close(1012);
    expect(service.state()).toBe('reconnecting');
    vi.advanceTimersByTime(1000);
    expect(FakeSocket.all.length).toBe(2);
    token.set(null);
    TestBed.tick();
    expect(service.state()).toBe('disconnected');
    expect(FakeSocket.all[1].readyState).toBe(3);
  });
  it('no reintenta indefinidamente un rechazo de origen o autenticación', () => {
    socket.close(1008);
    vi.advanceTimersByTime(60_000);
    expect(service.state()).toBe('unavailable');
    expect(FakeSocket.all.length).toBe(1);
    expect(token()).toBe('fictional-test-token');
  });
});
