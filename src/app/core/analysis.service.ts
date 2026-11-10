import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client.service';
import type { AnalysisResponse, EmotionalAnalysis, Recommendations } from './models/analysis.models';

@Injectable({ providedIn: 'root' })
export class AnalysisService {
  private api = inject(ApiClient);
  analyze(entryId: string) { return this.api.post<AnalysisResponse>(`/journal/${encodeURIComponent(entryId)}/analyze`); }
  list(offset = 0, limit = 20) { return this.api.get<EmotionalAnalysis[]>('/analyses', { offset, limit }); }
  get(id: string) { return this.api.get<EmotionalAnalysis>(`/analyses/${encodeURIComponent(id)}`); }
  forEntry(entryId: string, offset = 0) {
    return this.api.get<EmotionalAnalysis[]>(`/journal/${encodeURIComponent(entryId)}/analyses`, { limit: 20, offset });
  }
  recommendations() { return this.api.get<Recommendations>('/recommendations'); }
}
