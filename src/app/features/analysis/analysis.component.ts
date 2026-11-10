import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { EmotionalAnalysis } from '../../core/models/analysis.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { CategoryPipe, EsDatePipe, PAGE_SIZE, RiskPipe } from '../../shared/format';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-analysis',
  imports: [RouterLink, EmptyStateComponent, CategoryPipe, EsDatePipe, RiskPipe, PageHeaderComponent, PaginationComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header eyebrow="Reflexiones" title="Lecturas de tus entradas"
        lead="Cada lectura describe lo que aparece en un texto concreto. No mide avances ni establece diagnósticos." />

      @if (loading() && !items().length) {
        <app-loading [rows]="3" label="Cargando lecturas" />
      } @else if (error()) {
        <app-error [message]="error()" (retry)="load()" />
      } @else if (!items().length) {
        <app-empty-state title="Todavía no hay lecturas" text="Desde cualquier entrada del diario puedes pedir una lectura reflexiva cuando lo sientas oportuno.">
          <a routerLink="/journal" class="btn btn-secondary">Ir al diario</a>
        </app-empty-state>
      } @else {
        <ul class="grid-auto list" [attr.aria-busy]="loading()">
          @for (a of items(); track a.id) {
            <li>
              <a class="card card-link item" [routerLink]="['/analysis', a.id]">
                <div class="row-between">
                  <span class="faint">{{ a.created_at | esDate: 'time' }}</span>
                  <span class="chip" [class.chip-risk]="a.result.risk_level !== 'none' && a.result.risk_level !== 'low'">{{ a.result.risk_level | risk }}</span>
                </div>
                <p class="clamp-3 sum">{{ a.result.summary }}</p>
                <div class="row">
                  @for (c of a.result.categories.slice(0, 2); track c.category) { <span class="chip chip-heather">{{ c.category | category }}</span> }
                </div>
              </a>
            </li>
          }
        </ul>
      }
      <app-pagination [page]="page()" [hasNext]="hasNext()" [disabled]="loading()" (pageChange)="go($event)" />
    </div>
  `,
  styles: [`
    .list { list-style: none; padding: 0; margin: 0; }
    .item { display: flex; flex-direction: column; gap: 12px; height: 100%; }
    .sum { font-family: var(--font-display); font-size: 1.05rem; }
  `],
})
export class AnalysisComponent {
  private service = inject(AnalysisService);
  protected readonly items = signal<EmotionalAnalysis[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly page = signal(0);
  protected readonly hasNext = signal(false);

  constructor() {
    this.load();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  protected go(p: number) { this.page.set(p); this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.service.list(this.page() * PAGE_SIZE, PAGE_SIZE).subscribe({
      next: list => { this.items.set(list); this.hasNext.set(list.length === PAGE_SIZE); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }
}
