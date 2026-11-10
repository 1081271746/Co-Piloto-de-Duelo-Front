import { TestBed } from '@angular/core/testing';
import { provideHttpClient } from '@angular/common/http';
import { HttpTestingController, provideHttpClientTesting } from '@angular/common/http/testing';
import { beforeEach, describe, expect, it } from 'vitest';
import { API_CONFIG } from './config';
import { JournalService } from './journal.service';
import { AnalysisService } from './analysis.service';
import { LibraryService } from './library.service';
import { TrackingService } from './tracking.service';
import { SafetyService } from './safety.service';

describe('Servicios de dominio y formatos de FastAPI', () => {
  let requests: HttpTestingController;
  beforeEach(() => {
    TestBed.configureTestingModule({ providers: [
      provideHttpClient(), provideHttpClientTesting(), { provide: API_CONFIG, useValue: { baseUrl: '/api' } },
    ] });
    requests = TestBed.inject(HttpTestingController);
  });
  it('crea diario sin enviar identificadores ni campos inventados', () => {
    const data = { content: 'Recuerdo ficticio', emotional_state: 'tristeza' };
    const result = { entry: { id: 'fictional-entry', ...data }, safety_alert: null, realtime_delivered: true };
    TestBed.inject(JournalService).create(data).subscribe(value => expect(value).toEqual(result));
    const request = requests.expectOne('/api/journal');
    expect(request.request.method).toBe('POST');
    expect(request.request.body).toEqual(data);
    expect(request.request.body.recorded_at).toBeUndefined();
    request.flush(result);
  });
  it('pagina el diario y mantiene la respuesta como lista directa', () => {
    TestBed.inject(JournalService).list(20).subscribe(value => expect(value).toEqual([]));
    const request = requests.expectOne(req => req.url === '/api/journal' && req.params.get('offset') === '20');
    expect(request.request.params.get('limit')).toBe('20');
    request.flush([]);
  });
  it('edita y borra usando el identificador codificado', () => {
    const service = TestBed.inject(JournalService);
    service.update('id/with/slash', { emotional_state: 'calma' }).subscribe();
    const request = requests.expectOne('/api/journal/id%2Fwith%2Fslash');
    expect(request.request.method).toBe('PATCH');
    request.flush({ entry: {}, safety_alert: null, realtime_delivered: true });
    service.delete('entry').subscribe(value => expect(value).toBeNull());
    requests.expectOne('/api/journal/entry').flush(null, { status: 204, statusText: 'No Content' });
  });
  it('solicita análisis mediante el endpoint de la entrada', () => {
    TestBed.inject(AnalysisService).analyze('entry').subscribe();
    const request = requests.expectOne('/api/journal/entry/analyze');
    expect(request.request.method).toBe('POST');
    request.flush({ analysis: {}, recommendations: [], safety_alert: null, realtime_delivered: true });
  });
  it('filtra categorías y no transmite filtros vacíos', () => {
    TestBed.inject(LibraryService).exercises('acceptance').subscribe();
    const request = requests.expectOne(req => req.url === '/api/exercises');
    expect(request.request.params.get('category')).toBe('acceptance');
    request.flush([]);
    TestBed.inject(LibraryService).resources('').subscribe();
    const resource = requests.expectOne(req => req.url === '/api/resources');
    expect(resource.request.params.has('category')).toBe(false);
    resource.flush([]);
  });
  it('registra actividad solo a través del endpoint respaldado', () => {
    TestBed.inject(LibraryService).complete('exercise', { notes: 'Nota ficticia', analysis_id: null }).subscribe();
    const request = requests.expectOne('/api/exercises/exercise/complete');
    expect(request.request.body).toEqual({ notes: 'Nota ficticia', analysis_id: null });
    request.flush({ id: 'completion' });
  });
  it('conserva los nombres y parámetros de seguimiento', () => {
    TestBed.inject(TrackingService).trends(90).subscribe();
    const request = requests.expectOne(req => req.url === '/api/tracking/trends');
    expect(request.request.params.get('days')).toBe('90');
    request.flush({ daily_states: [], emotions: {}, categories: {} });
  });
  it('marca alertas como leídas sin afirmar que resuelve el riesgo', () => {
    TestBed.inject(SafetyService).acknowledge('alert').subscribe();
    const request = requests.expectOne('/api/alerts/alert/acknowledge');
    expect(request.request.method).toBe('POST');
    request.flush({ id: 'alert', risk_level: 'high', acknowledged_at: '2026-01-01T00:00:00Z' });
  });
});
