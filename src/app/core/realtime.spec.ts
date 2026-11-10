import { describe, expect, it } from 'vitest';
import { parseRealtimeEvent } from './realtime.service';

const event = {
  id: 'fictional-event', type: 'journal.created', user_id: 'user-a',
  occurred_at: '2026-01-01T00:00:00Z', data: { entry_id: 'fictional-entry' },
};

describe('Protocolo de eventos privados de Redis', () => {
  it('acepta únicamente el usuario autenticado', () => {
    expect(parseRealtimeEvent(event, 'user-a')).toEqual(event);
    expect(parseRealtimeEvent(event, 'user-b')).toBeNull();
  });
  it.each([null, 'wrong', {}, { ...event, type: 'invented-chat-message' }, { ...event, data: [] }])(
    'rechaza mensajes ajenos al contrato', value => expect(parseRealtimeEvent(value, 'user-a')).toBeNull(),
  );
  it('no presenta mensajes internos de revocación como eventos públicos', () => {
    expect(parseRealtimeEvent({ ...event, type: 'auth.revoked' }, 'user-a')).toBeNull();
  });
});
