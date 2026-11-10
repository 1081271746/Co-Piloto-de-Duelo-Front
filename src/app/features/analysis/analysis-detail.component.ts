import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { EmotionalAnalysis, Recommendations } from '../../core/models/analysis.models';
import type { SafetyAlert } from '../../core/models/safety.models';
import { AnalysisResultComponent } from '../../shared/analysis-result.component';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { RecommendationsComponent } from '../../shared/recommendations.component';
import { SafetyGuidanceComponent } from '../../shared/safety-guidance.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-analysis-detail',
  imports: [RouterLink, AnalysisResultComponent, IconComponent, PageHeaderComponent, RecommendationsComponent, SafetyGuidanceComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header eyebrow="Lectura reflexiva" title="Lo que aparece en tu entrada">
        @if (analysis(); as a) { <a [routerLink]="['/journal', a.entry_id]" class="btn btn-secondary"><app-icon name="book" [size]="16" /> Ver la entrada</a> }
        <a routerLink="/analysis" class="btn btn-ghost"><app-icon name="left" [size]="16" /> Todas</a>
      </app-page-header>

      <div class="stack-lg">
        @if (stateAlert; as alert) {
          <app-safety-guidance [guidance]="alert.guidance" heading="Antes de seguir leyendo, cuidemos lo urgente" />
        }

        @if (loading()) {
          <app-loading [rows]="3" label="Cargando la lectura" />
        } @else if (error()) {
          <app-error [message]="error()" (retry)="load()" />
        } @else if (analysis(); as a) {
          <app-analysis-result [analysis]="a" />
          <p class="disclaimer">{{ disclaimer || 'Esta lectura es generada automáticamente y puede equivocarse. No es una evaluación clínica ni sustituye a un profesional.' }}</p>
        }

        <section class="stack">
          <h2>Sugerencias actuales</h2>
          @if (recError()) {
            <app-error [message]="recError()" (retry)="loadRecommendations()" />
          } @else if (recs(); as r) {
            @if (!stateAlert || !r.safety_guidance) { <app-recommendations [data]="r" /> }
            @else { <p class="muted">Los ejercicios quedan en pausa mientras la prioridad sea tu seguridad.</p> }
          } @else {
            <app-loading [rows]="1" label="Cargando sugerencias" />
          }
        </section>
      </div>
    </div>
  `,
})
export class AnalysisDetailComponent {
  private service = inject(AnalysisService);
  private id = inject(ActivatedRoute).snapshot.paramMap.get('id') ?? '';
  private navState = (typeof history !== 'undefined' ? history.state : null) as { safetyAlert?: SafetyAlert | null; disclaimer?: string } | null;
  protected readonly stateAlert: SafetyAlert | null = this.navState?.safetyAlert ?? null;
  protected readonly disclaimer: string = this.navState?.disclaimer ?? '';

  protected readonly analysis = signal<EmotionalAnalysis | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly recs = signal<Recommendations | null>(null);
  protected readonly recError = signal('');

  constructor() {
    this.load();
    this.loadRecommendations();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.loadRecommendations());
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.service.get(this.id).subscribe({
      next: a => { this.analysis.set(a); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  loadRecommendations() {
    this.recError.set('');
    this.service.recommendations().subscribe({
      next: r => this.recs.set(r),
      error: err => this.recError.set(errorMessage(err)),
    });
  }
}
