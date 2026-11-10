import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client.service';
import type { JournalEntry, JournalInput, JournalMutation } from './models/journal.models';

@Injectable({ providedIn: 'root' })
export class JournalService {
  private api = inject(ApiClient);
  list(offset = 0, limit = 20) { return this.api.get<JournalEntry[]>('/journal', { offset, limit }); }
  get(id: string) { return this.api.get<JournalEntry>(`/journal/${encodeURIComponent(id)}`); }
  create(data: JournalInput) { return this.api.post<JournalMutation>('/journal', data); }
  update(id: string, data: Partial<JournalInput>) { return this.api.patch<JournalMutation>(`/journal/${encodeURIComponent(id)}`, data); }
  delete(id: string) { return this.api.delete(`/journal/${encodeURIComponent(id)}`); }
}
