import { describe, expect, it } from 'vitest';
import { safeReturnUrl } from './auth.guard';
import { categoryLabel, safeExternalUrl } from './category-labels';

describe('Navegación y enlaces seguros', () => {
  it.each([null, 'https://malicious.test', '//malicious.test', '/\\malicious.test', '/unknown'])(
    'no admite redirección arbitraria %s', value => expect(safeReturnUrl(value)).toBe('/dashboard'),
  );
  it('permite continuar una ruta privada después de iniciar sesión', () => {
    expect(safeReturnUrl('/journal/fictional-entry')).toBe('/journal/fictional-entry');
  });
  it.each(['javascript:alert(1)', 'data:text/html,test', 'https://user:password@example.com'])(
    'no permite el enlace externo %s', value => expect(safeExternalUrl(value)).toBeNull(),
  );
  it('admite enlaces públicos HTTP/HTTPS', () => {
    expect(safeExternalUrl('https://www.minsalud.gov.co/')).toBe('https://www.minsalud.gov.co/');
  });
  it('traduce categorías solo para presentación sin cambiar sus identificadores', () => {
    expect(categoryLabel('denial')).toBe('Negación');
    expect(categoryLabel('custom-category')).toBe('custom-category');
  });
});
