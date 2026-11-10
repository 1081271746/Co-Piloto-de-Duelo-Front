import { effect, inject, Injectable, OnDestroy, signal } from '@angular/core';
import { debounceTime, Subject } from 'rxjs';
import { API_CONFIG } from './config';
import { AuthService } from './auth.service';

export type ConnectionState = 'disconnected' | 'connecting' | 'connected' | 'reconnecting' | 'unavailable';
export interface RealtimeEvent {
  id: string;
  type: string;
  user_id: string;
  occurred_at: string;
  data: Record<string, unknown>;
}
const EVENTS = new Set([
  'journal.created', 'journal.updated', 'journal.deleted', 'analysis.completed',
  'recommendation.created', 'safety.alert', 'tracking.updated',
]);

export function parseRealtimeEvent(raw: unknown, userId: string): RealtimeEvent | null {
  if (!raw || typeof raw !== 'object') return null;
  const event = raw as Partial<RealtimeEvent>;
  return typeof event.id === 'string' && typeof event.type === 'string' && EVENTS.has(event.type)
    && event.user_id === userId && typeof event.occurred_at === 'string'
    && !!event.data && typeof event.data === 'object' && !Array.isArray(event.data)
    ? event as RealtimeEvent : null;
}

@Injectable({ providedIn: 'root' })
export class RealtimeService implements OnDestroy {
  private auth = inject(AuthService);
  private config = inject(API_CONFIG);
  readonly state = signal<ConnectionState>('disconnected');
  private events = new Subject<RealtimeEvent>();
  private refresh = new Subject<void>();
  readonly events$ = this.events.asObservable();
  readonly refresh$ = this.refresh.pipe(debounceTime(350));
  private socket?: WebSocket;
  private token?: string;
  private userId?: string;
  private attempts = 0;
  private retryTimer?: ReturnType<typeof setTimeout>;
  private pingTimer?: ReturnType<typeof setInterval>;
  private readyTimer?: ReturnType<typeof setTimeout>;
  private lastSeen = new Map<string, number>();

  constructor() {
    effect(() => {
      const token = this.auth.tokens.token();
      const userId = this.auth.user()?.id;
      if (!token || !userId) { this.disconnect(); return; }
      if (token === this.token && userId === this.userId) return;
      this.disconnect();
      this.token = token;
      this.userId = userId;
      this.connect();
    });
  }
  private connect() {
    const token = this.token;
    const userId = this.userId;
    if (!token || !userId) return;
    this.state.set(this.attempts ? 'reconnecting' : 'connecting');
    let socket: WebSocket;
    try { socket = new WebSocket(this.config.websocketUrl); }
    catch { this.state.set('unavailable'); return; }
    this.socket = socket;
    this.readyTimer = setTimeout(() => {
      if (this.socket === socket && this.state() !== 'connected') socket.close(1000);
    }, 12_000);
    socket.onopen = () => {
      if (this.socket === socket) socket.send(JSON.stringify({ type: 'authenticate', access_token: token }));
    };
    socket.onmessage = event => {
      if (this.socket !== socket || typeof event.data !== 'string' || event.data.length > 65536) return;
      let payload: unknown;
      try { payload = JSON.parse(event.data); } catch { return; }
      if (!payload || typeof payload !== 'object') return;
      const message = payload as Record<string, unknown>;
      if (message['type'] === 'ready' && message['user_id'] === userId && message['delivery'] === 'at_most_once') {
        clearTimeout(this.readyTimer);
        this.attempts = 0;
        this.state.set('connected');
        this.refresh.next();
        clearInterval(this.pingTimer);
        this.pingTimer = setInterval(() => {
          if (socket.readyState === WebSocket.OPEN) socket.send(JSON.stringify({ type: 'ping' }));
        }, 20_000);
        return;
      }
      if (this.state() !== 'connected') return;
      const parsed = parseRealtimeEvent(payload, userId);
      if (!parsed || this.lastSeen.has(parsed.id)) return;
      this.lastSeen.set(parsed.id, Date.now());
      if (this.lastSeen.size > 200) this.lastSeen.delete(this.lastSeen.keys().next().value!);
      this.events.next(parsed);
      this.refresh.next();
    };
    socket.onerror = () => {
      if (this.socket === socket) this.state.set('unavailable');
    };
    socket.onclose = event => {
      if (this.socket !== socket) return;
      clearTimeout(this.readyTimer);
      clearInterval(this.pingTimer);
      this.socket = undefined;
      if (event.code === 1008) {
        this.state.set('unavailable');
        this.auth.profile().subscribe({ error: () => {} });
        return;
      }
      if (!this.auth.authenticated()) { this.disconnect(); return; }
      this.attempts++;
      if (this.attempts > 6) { this.state.set('unavailable'); return; }
      this.state.set('reconnecting');
      this.retryTimer = setTimeout(() => this.connect(), Math.min(1000 * 2 ** (this.attempts - 1), 30000));
    };
  }
  retry() {
    const token = this.auth.tokens.token();
    const userId = this.auth.user()?.id;
    this.disconnect();
    if (token && userId) { this.token = token; this.userId = userId; this.connect(); }
  }
  disconnect() {
    clearTimeout(this.retryTimer);
    clearTimeout(this.readyTimer);
    clearInterval(this.pingTimer);
    const socket = this.socket;
    this.socket = undefined;
    if (socket && socket.readyState !== WebSocket.CLOSED) socket.close(1000);
    this.token = undefined;
    this.userId = undefined;
    this.attempts = 0;
    this.lastSeen.clear();
    this.state.set('disconnected');
  }
  ngOnDestroy() { this.disconnect(); this.events.complete(); this.refresh.complete(); }
}
