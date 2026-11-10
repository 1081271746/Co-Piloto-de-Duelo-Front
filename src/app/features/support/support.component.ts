import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { SafetyService } from '../../core/safety.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { SafetyAlert, SafetyGuidance } from '../../core/models/safety.models';
import { EsDatePipe, PAGE_SIZE, RiskPipe } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { RealtimeStatusComponent } from '../../shared/realtime-status.component';
import { SafetyGuidanceComponent } from '../../shared/safety-guidance.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

const SOURCES: Record<string, string> = { journal: 'Al guardar una entrada', analysis: 'En una lectura reflexiva' };

@Component({
  selector: 'app-support',
  imports: [RouterLink, EsDatePipe, RiskPipe, IconComponent, PageHeaderComponent, PaginationComponent, RealtimeStatusComponent, SafetyGuidanceComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './support.component.html',
  styleUrl: './support.component.css',
})
export class SupportComponent {
  private safety = inject(SafetyService);
  protected readonly realtime = inject(RealtimeService);
  protected readonly guidance = signal<SafetyGuidance | null>(null);
  protected readonly guidanceError = signal('');
  protected readonly alerts = signal<SafetyAlert[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly page = signal(0);
  protected readonly hasNext = signal(false);
  protected readonly ackBusy = signal<string | null>(null);
  protected readonly ackError = signal('');

  constructor() {
    this.loadGuidance();
    this.load();
    this.realtime.refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  protected source(s: string) { return SOURCES[s] ?? s; }
  protected go(p: number) { this.page.set(p); this.load(); }

  loadGuidance() {
    this.guidanceError.set('');
    this.safety.resources().subscribe({ next: g => this.guidance.set(g), error: err => this.guidanceError.set(errorMessage(err)) });
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.safety.alerts(this.page() * PAGE_SIZE).subscribe({
      next: l => { this.alerts.set(l); this.hasNext.set(l.length === PAGE_SIZE); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  protected acknowledge(alert: SafetyAlert) {
    if (this.ackBusy()) return;
    this.ackBusy.set(alert.id);
    this.ackError.set('');
    this.safety.acknowledge(alert.id).subscribe({
      next: updated => { this.alerts.update(list => list.map(a => (a.id === updated.id ? updated : a))); this.ackBusy.set(null); },
      error: err => { this.ackError.set(errorMessage(err)); this.ackBusy.set(null); },
    });
  }
}
