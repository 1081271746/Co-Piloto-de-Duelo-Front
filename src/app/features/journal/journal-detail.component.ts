import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { JournalService } from '../../core/journal.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { EmotionalAnalysis } from '../../core/models/analysis.models';
import type { JournalEntry } from '../../core/models/journal.models';
import { EsDatePipe, RiskPipe } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-journal-detail',
  imports: [RouterLink, EsDatePipe, RiskPipe, IconComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journal-detail.component.html',
  styleUrl: './journal-detail.component.css',
})
export class JournalDetailComponent {
  private journal = inject(JournalService);
  private analysisService = inject(AnalysisService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  protected readonly id = this.route.snapshot.paramMap.get('id') ?? '';
  protected readonly justSaved = !!this.route.snapshot.queryParamMap.get('saved');

  protected readonly entry = signal<JournalEntry | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly analyses = signal<EmotionalAnalysis[]>([]);
  protected readonly analysesError = signal('');
  protected readonly analyzing = signal(false);
  protected readonly analyzeError = signal('');
  protected readonly confirmDelete = signal(false);
  protected readonly deleting = signal(false);
  protected readonly deleteError = signal('');

  constructor() {
    this.load();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => { if (!this.deleting()) this.load(true); });
  }

  load(quiet = false) {
    if (!quiet) { this.loading.set(true); this.error.set(''); }
    this.journal.get(this.id).subscribe({
      next: e => { this.entry.set(e); this.error.set(''); this.loading.set(false); },
      error: err => { if (!quiet || !this.entry()) this.error.set(errorMessage(err)); this.loading.set(false); },
    });
    this.analysisService.forEntry(this.id).subscribe({
      next: list => { this.analyses.set(list); this.analysesError.set(''); },
      error: err => this.analysesError.set(errorMessage(err)),
    });
  }

  protected analyze() {
    if (this.analyzing()) return;
    this.analyzing.set(true);
    this.analyzeError.set('');
    this.analysisService.analyze(this.id).subscribe({
      next: res => {
        this.analyzing.set(false);
        void this.router.navigate(['/analysis', res.analysis.id], {
          state: { safetyAlert: res.safety_alert, disclaimer: res.disclaimer },
        });
      },
      error: err => { this.analyzing.set(false); this.analyzeError.set(errorMessage(err)); },
    });
  }

  protected remove() {
    if (this.deleting()) return;
    this.deleting.set(true);
    this.deleteError.set('');
    this.journal.delete(this.id).subscribe({
      next: () => void this.router.navigate(['/journal']),
      error: err => { this.deleting.set(false); this.deleteError.set(errorMessage(err)); },
    });
  }

  protected isCurrent(a: EmotionalAnalysis): boolean {
    return a.entry_version === this.entry()?.version;
  }
}
