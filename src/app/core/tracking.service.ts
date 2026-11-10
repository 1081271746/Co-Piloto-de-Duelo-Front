import { inject, Injectable } from '@angular/core';
import { ApiClient } from './api-client.service';
import type { TimelineEvent, TrackingSummary, TrackingTrends } from './models/tracking.models';

@Injectable({ providedIn: 'root' })
export class TrackingService {
  private api = inject(ApiClient);
  summary(days = 30) { return this.api.get<TrackingSummary>('/tracking/summary', { days }); }
  trends(days = 30) { return this.api.get<TrackingTrends>('/tracking/trends', { days }); }
  timeline(offset = 0, limit = 20) { return this.api.get<TimelineEvent[]>('/tracking/timeline', { offset, limit }); }
}
