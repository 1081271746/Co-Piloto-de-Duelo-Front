import { HttpErrorResponse } from '@angular/common/http';
import { describe, expect, it } from 'vitest';
import { errorMessage } from './error-messages';

describe('Errores informativos sin datos sensibles', () => {
  it('explica la ausencia de Groq sin bloquear el diario', () => {
    const message = errorMessage(new HttpErrorResponse({ status: 503, error: { detail: 'gemini_not_configured' } }));
    expect(message).toContain('Groq');
    expect(message).toContain('guardada');
  });
  it('no expone un diagnóstico arbitrario devuelto por el proveedor', () => {
    const message = errorMessage(new HttpErrorResponse({ status: 500, error: { detail: 'private-provider-key' } }));
    expect(message).not.toContain('private-provider-key');
  });
  it('interpreta el error estructurado de prioridad de seguridad', () => {
    expect(errorMessage(new HttpErrorResponse({ status: 409, error: { detail: { code: 'safety_priority' } } })))
      .toContain('seguridad');
  });
  it.each([0, 401, 404, 409, 422, 429, 502])('presenta un error legible para %s', status => {
    expect(errorMessage(new HttpErrorResponse({ status } )).length).toBeGreaterThan(20);
  });
});
