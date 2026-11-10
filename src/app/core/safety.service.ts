import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client.service';
import type { SafetyAlert, SafetyGuidance } from './models/safety.models';

@Injectable({ providedIn: 'root' })
export class SafetyService {
  private api = inject(ApiClient);
  alerts(offset = 0) { return this.api.get<SafetyAlert[]>('/alerts', { offset, limit: 20 }); }
  get(id: string) { return this.api.get<SafetyAlert>(`/alerts/${encodeURIComponent(id)}`); }
  acknowledge(id: string) { return this.api.post<SafetyAlert>(`/alerts/${encodeURIComponent(id)}/acknowledge`); }
  resources() { return this.api.get<SafetyGuidance>('/safety/resources'); }
}
