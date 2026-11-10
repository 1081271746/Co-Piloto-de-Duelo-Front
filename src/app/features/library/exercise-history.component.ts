import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { LibraryService } from '../../core/library.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { ExerciseCompletion } from '../../core/models/library.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { EsDatePipe, PAGE_SIZE } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-exercise-history',
  imports: [RouterLink, EmptyStateComponent, EsDatePipe, IconComponent, PageHeaderComponent, PaginationComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page page-narrow">
      <app-page-header eyebrow="Biblioteca" title="Lo que he practicado" lead="Un registro sencillo, sin rachas ni objetivos.">
        <a routerLink="/library" class="btn btn-ghost"><app-icon name="left" [size]="16" /> Biblioteca</a>
      </app-page-header>
      @if (loading() && !items().length) {
        <app-loading [rows]="3" label="Cargando historial" />
      } @else if (error()) {
        <app-error [message]="error()" (retry)="load()" />
      } @else if (!items().length) {
        <app-empty-state title="Aún no hay prácticas registradas" text="Cuando hagas un ejercicio y lo marques, aparecerá aquí.">
          <a routerLink="/library" class="btn btn-secondary">Explorar ejercicios</a>
        </app-empty-state>
      } @else {
        <ol class="tl">
          @for (c of items(); track c.id) {
            <li class="card">
              <div class="row-between">
                <strong>{{ c.completed_at | esDate: 'time' }}</strong>
                <a [routerLink]="['/library/exercises', c.exercise_id]">Ver ejercicio</a>
              </div>
              @if (c.notes) { <p class="note">{{ c.notes }}</p> } @else { <p class="faint">Sin notas.</p> }
              @if (c.analysis_id) { <a class="faint" [routerLink]="['/analysis', c.analysis_id]">Relacionado con una lectura</a> }
            </li>
          }
        </ol>
      }
      <app-pagination [page]="page()" [hasNext]="hasNext()" [disabled]="loading()" (pageChange)="go($event)" />
    </div>
  `,
  styles: [`
    .tl { list-style: none; padding: 0; margin: 0; display: flex; flex-direction: column; gap: 12px; }
    .tl li { display: flex; flex-direction: column; gap: 8px; border-left: 3px solid var(--sage); }
    .note { white-space: pre-wrap; overflow-wrap: anywhere; font-family: var(--font-display); }
  `],
})
export class ExerciseHistoryComponent {
  private library = inject(LibraryService);
  protected readonly items = signal<ExerciseCompletion[]>([]);
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
    this.library.history(this.page() * PAGE_SIZE).subscribe({
      next: l => { this.items.set(l); this.hasNext.set(l.length === PAGE_SIZE); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }
}
