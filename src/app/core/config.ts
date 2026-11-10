import { InjectionToken } from '@angular/core';

declare global {
  interface Window { __COPILOT_CONFIG__?: { apiBaseUrl?: string; websocketUrl?: string } }
}

export interface ApiConfig { baseUrl: string; websocketUrl: string }

export function resolveApiConfig(config: Window['__COPILOT_CONFIG__'], origin: string): ApiConfig {
  const base = (config?.apiBaseUrl || '/api').replace(/\/+$/, '');
  const parsed = new URL(base, origin);
  if (!['http:', 'https:'].includes(parsed.protocol) || parsed.username || parsed.password || parsed.search || parsed.hash) {
    throw new Error('La URL pública de la API no es válida');
  }
  const socket = new URL(config?.websocketUrl || `${parsed.href}/ws`, origin);
  if (!config?.websocketUrl) socket.protocol = parsed.protocol === 'https:' ? 'wss:' : 'ws:';
  if (!['ws:', 'wss:'].includes(socket.protocol) || socket.username || socket.password || socket.search || socket.hash) {
    throw new Error('La URL pública del WebSocket no es válida');
  }
  return { baseUrl: parsed.href.replace(/\/+$/, ''), websocketUrl: socket.href };
}

export const API_CONFIG = new InjectionToken<ApiConfig>('API_CONFIG', {
  providedIn: 'root',
  factory: () => resolveApiConfig(window.__COPILOT_CONFIG__, window.location.origin),
});
