import { describe, expect, it } from 'vitest';
import { resolveApiConfig } from './config';

describe('Configuración pública de API', () => {
  it('deriva REST y WSS del mismo origen sin credenciales', () => {
    expect(resolveApiConfig(undefined, 'https://example.com')).toEqual({
      baseUrl: 'https://example.com/api', websocketUrl: 'wss://example.com/api/ws',
    });
  });
  it('admite la API local documentada y elimina barras sobrantes', () => {
    expect(resolveApiConfig({ apiBaseUrl: 'http://127.0.0.1:8000/api/' }, 'http://localhost:4200')).toEqual({
      baseUrl: 'http://127.0.0.1:8000/api', websocketUrl: 'ws://127.0.0.1:8000/api/ws',
    });
  });
  it.each(['javascript:alert(1)', 'https://user:password@example.com/api', '/api?token=abc', '/api#private'])(
    'rechaza direcciones REST inseguras %s', value => {
      expect(() => resolveApiConfig({ apiBaseUrl: value }, 'https://example.com')).toThrow();
    },
  );
  it.each(['https://example.com/ws', 'wss://example.com/ws?token=secret', 'ws://user:pass@example.com/ws'])(
    'rechaza direcciones de socket inseguras %s', value => {
      expect(() => resolveApiConfig({ websocketUrl: value }, 'https://example.com')).toThrow();
    },
  );
});
