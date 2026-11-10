import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { TrackingService } from '../../core/tracking.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { TimelineEvent, TrackingSummary, TrackingTrends } from '../../core/models/tracking.models';
import { BarListComponent } from '../../shared/bar-list.component';
import { DailyChartComponent } from '../../shared/daily-chart.component';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { categoryLabel, EsDatePipe, PAGE_SIZE } from '../../shared/format';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

const EVENT_LABELS: Record<TimelineEvent['type'], string> = {
  journal: 'Entrada del diario',
  analysis: 'Lectura reflexiva',
  exercise: 'Ejercicio realizado',
  alert: 'Aviso de seguridad',
};

@Component({
  selector: 'app-tracking',
  imports: [RouterLink, BarListComponent, DailyChartComponent, EmptyStateComponent, EsDatePipe, PageHeaderComponent, PaginationComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './tracking.component.html',
  styleUrl: './tracking.component.css',
})
export class TrackingComponent {
  private tracking = inject(TrackingService);
  protected readonly periods = [7, 30, 90];
  protected readonly days = signal(30);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly summary = signal<TrackingSummary | null>(null);
  protected readonly trends = signal<TrackingTrends | null>(null);
  protected readonly events = signal<TimelineEvent[]>([]);
  protected readonly eventsLoading = signal(true);
  protected readonly eventsError = signal('');
  protected readonly page = signal(0);
  protected readonly hasNext = signal(false);
  protected readonly eventLabels = EVENT_LABELS;

  protected readonly states = computed(() => (this.summary()?.emotional_states ?? []).map(s => ({ label: s.state, count: s.count })));
  protected readonly emotions = computed(() => Object.entries(this.trends()?.emotions ?? {}).map(([label, count]) => ({ label, count })).sort((a, b) => b.count - a.count));
  protected readonly categories = computed(() => Object.entries(this.trends()?.categories ?? {}).map(([k, count]) => ({ label: categoryLabel(k), count })).sort((a, b) => b.count - a.count));
  protected readonly isEmpty = computed(() => {
    const c = this.summary()?.counts;
    return !!c && c.entries + c.analyses + c.completed_exercises + c.alerts === 0;
  });

  constructor() {
    this.load();
    this.loadEvents();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => { this.load(); this.loadEvents(); });
  }

  protected setDays(d: number) { this.days.set(d); this.load(); }
  protected go(p: number) { this.page.set(p); this.loadEvents(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    forkJoin([this.tracking.summary(this.days()), this.tracking.trends(this.days())]).subscribe({
      next: ([s, t]) => { this.summary.set(s); this.trends.set(t); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  loadEvents() {
    this.eventsLoading.set(true);
    this.eventsError.set('');
    this.tracking.timeline(this.page() * PAGE_SIZE, PAGE_SIZE).subscribe({
      next: l => { this.events.set(l); this.hasNext.set(l.length === PAGE_SIZE); this.eventsLoading.set(false); },
      error: err => { this.eventsError.set(errorMessage(err)); this.eventsLoading.set(false); },
    });
  }

  protected link(e: TimelineEvent): string[] | null {
    if (e.type === 'journal') return ['/journal', e.id];
    if (e.type === 'analysis') return ['/analysis', e.id];
    if (e.type === 'exercise') return ['/library/history'];
    return ['/support'];
  }
}
