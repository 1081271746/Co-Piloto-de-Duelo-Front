import { TestBed } from '@angular/core/testing';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { TokenStore, tokenExpiration } from './token-store.service';

function token(exp: number) { return `header.${btoa(JSON.stringify({ exp }))}.signature`; }

describe('Persistencia limitada de la sesión', () => {
  beforeEach(() => { sessionStorage.clear(); vi.useFakeTimers(); });
  afterEach(() => { vi.useRealTimers(); sessionStorage.clear(); });
  it.each(['', 'invalid', 'a.e30.c', `a.${btoa('{"exp":"123"}')}.c`])('rechaza expiración inválida %s', value => {
    expect(tokenExpiration(value)).toBe(0);
  });
  it('persiste únicamente el token en sessionStorage y lo restaura', () => {
    const value = token(Math.floor(Date.now() / 1000) + 60);
    const store = TestBed.inject(TokenStore);
    store.set(value);
    expect(store.token()).toBe(value);
    expect(sessionStorage.getItem('copilot.session')).toBe(value);
    expect(new TokenStore().token()).toBe(value);
  });
  it('borra token y almacenamiento al expirar', () => {
    const store = TestBed.inject(TokenStore);
    store.set(token(Math.floor(Date.now() / 1000) + 2));
    vi.advanceTimersByTime(2100);
    expect(store.token()).toBeNull();
    expect(sessionStorage.getItem('copilot.session')).toBeNull();
  });
  it('nunca restaura tokens expirados', () => {
    sessionStorage.setItem('copilot.session', token(1));
    expect(TestBed.inject(TokenStore).token()).toBeNull();
    expect(sessionStorage.length).toBe(0);
  });
  it('informa la falta de almacenamiento y conserva una sesión en memoria', () => {
    vi.spyOn(Storage.prototype, 'setItem').mockImplementation(() => { throw new Error('Blocked'); });
    const store = TestBed.inject(TokenStore);
    store.set(token(Math.floor(Date.now() / 1000) + 60));
    expect(store.storageAvailable()).toBe(false);
    expect(store.token()).not.toBeNull();
    store.clear();
    expect(store.token()).toBeNull();
  });
});
