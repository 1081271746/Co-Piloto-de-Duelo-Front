import { Injectable, signal } from '@angular/core';

const STORAGE_KEY = 'copilot.session';

export function tokenExpiration(token: string): number {
  try {
    const raw = token.split('.')[1].replace(/-/g, '+').replace(/_/g, '/');
    const payload = JSON.parse(atob(raw));
    return typeof payload.exp === 'number' && Number.isFinite(payload.exp) ? payload.exp * 1000 : 0;
  } catch { return 0; }
}

@Injectable({ providedIn: 'root' })
export class TokenStore {
  readonly token = signal<string | null>(null);
  private timer?: ReturnType<typeof setTimeout>;
  readonly storageAvailable = signal(true);

  constructor() {
    try {
      const saved = sessionStorage.getItem(STORAGE_KEY);
      if (saved) this.set(saved);
    } catch { this.storageAvailable.set(false); }
  }
  set(token: string) {
    clearTimeout(this.timer);
    const remaining = tokenExpiration(token) - Date.now();
    if (remaining <= 0) { this.clear(); return; }
    this.token.set(token);
    try { sessionStorage.setItem(STORAGE_KEY, token); } catch { this.storageAvailable.set(false); }
    this.timer = setTimeout(() => this.clear(), Math.min(remaining, 2_147_483_647));
  }
  clear() {
    clearTimeout(this.timer);
    this.token.set(null);
    try { sessionStorage.removeItem(STORAGE_KEY); } catch { this.storageAvailable.set(false); }
  }
}
