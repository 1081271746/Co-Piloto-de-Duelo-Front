import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { AuthService } from '../../core/auth.service';
import { JournalService } from '../../core/journal.service';
import { TrackingService } from '../../core/tracking.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { Recommendations } from '../../core/models/analysis.models';
import type { JournalEntry } from '../../core/models/journal.models';
import type { TrackingSummary } from '../../core/models/tracking.models';
import { EsDatePipe, formatDate } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { RecommendationsComponent } from '../../shared/recommendations.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink, EsDatePipe, IconComponent, RecommendationsComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.css',
})
export class DashboardComponent {
  protected readonly auth = inject(AuthService);
  private journal = inject(JournalService);
  private tracking = inject(TrackingService);
  private analysis = inject(AnalysisService);

  protected readonly today = formatDate(new Date().toISOString(), 'weekday');
  protected readonly greeting = (() => {
    const h = new Date().getHours();
    return h < 6 ? 'Buenas noches' : h < 13 ? 'Buenos días' : h < 20 ? 'Buenas tardes' : 'Buenas noches';
  })();
  protected readonly firstName = computed(() => this.auth.user()?.name?.trim().split(/\s+/)[0] ?? '');

  protected readonly entries = signal<JournalEntry[] | null>(null);
  protected readonly entriesError = signal('');
  protected readonly summary = signal<TrackingSummary | null>(null);
  protected readonly summaryError = signal('');
  protected readonly recs = signal<Recommendations | null>(null);
  protected readonly recsError = signal('');

  constructor() {
    this.load();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  load() {
    this.loadEntries();
    this.loadSummary();
    this.loadRecs();
  }

  loadEntries() {
    this.entriesError.set('');
    this.journal.list(0, 3).subscribe({ next: l => this.entries.set(l), error: e => this.entriesError.set(errorMessage(e)) });
  }
  loadSummary() {
    this.summaryError.set('');
    this.tracking.summary(30).subscribe({ next: s => this.summary.set(s), error: e => this.summaryError.set(errorMessage(e)) });
  }
  loadRecs() {
    this.recsError.set('');
    this.analysis.recommendations().subscribe({ next: r => this.recs.set(r), error: e => this.recsError.set(errorMessage(e)) });
  }
}
