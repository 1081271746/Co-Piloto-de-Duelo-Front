import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { RouterLink } from '@angular/router';
import { JournalService } from '../../core/journal.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { JournalEntry } from '../../core/models/journal.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { EsDatePipe, PAGE_SIZE } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-journal',
  imports: [RouterLink, EmptyStateComponent, EsDatePipe, IconComponent, PageHeaderComponent, PaginationComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="page">
      <app-page-header eyebrow="Diario" title="Lo que has escrito" lead="Cada entrada queda tal como la dejaste. Puedes volver a ella cuando quieras.">
        <a routerLink="/journal/new" class="btn btn-primary"><app-icon name="plus" [size]="17" /> Nueva entrada</a>
      </app-page-header>

      @if (loading() && !entries().length) {
        <app-loading [rows]="4" label="Cargando entradas" />
      } @else if (error()) {
        <app-error [message]="error()" (retry)="load()" />
      } @else if (!entries().length) {
        <app-empty-state title="Tu diario está en blanco" [text]="page() > 0 ? 'No hay más entradas en esta página.' : 'No hace falta escribir mucho. Una frase sobre cómo llegas hoy es suficiente.'">
          @if (page() > 0) { <button type="button" class="btn btn-secondary" (click)="go(0)">Volver al inicio</button> }
          @else { <a routerLink="/journal/new" class="btn btn-primary">Escribir la primera entrada</a> }
        </app-empty-state>
      } @else {
        <ol class="list" [attr.aria-busy]="loading()">
          @for (entry of entries(); track entry.id) {
            <li>
              <a class="card card-link entry" [routerLink]="['/journal', entry.id]">
                <div class="date">
                  <span class="day">{{ entry.recorded_at | esDate: 'weekday' }}</span>
                  <span class="faint">{{ entry.recorded_at | esDate: 'long' }}</span>
                </div>
                <div class="body">
                  <span class="chip chip-heather">{{ entry.emotional_state }}</span>
                  <p class="clamp-3 excerpt">{{ entry.content }}</p>
                </div>
              </a>
            </li>
          }
        </ol>
      }
      <app-pagination [page]="page()" [hasNext]="hasNext()" [disabled]="loading()" (pageChange)="go($event)" />
    </div>
  `,
  styles: [`
    .list { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 14px; }
    .entry { display: grid; grid-template-columns: 180px 1fr; gap: 20px; }
    .date { display: flex; flex-direction: column; gap: 2px; }
    .day { font-family: var(--font-display); font-size: 1.1rem; text-transform: capitalize; }
    .body { display: flex; flex-direction: column; gap: 10px; align-items: flex-start; min-width: 0; }
    .excerpt { font-family: var(--font-display); color: var(--ink-soft); font-size: 1.02rem; }
    @media (max-width: 640px) { .entry { grid-template-columns: 1fr; gap: 10px; } }
  `],
})
export class JournalComponent {
  private journal = inject(JournalService);
  protected readonly entries = signal<JournalEntry[]>([]);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly page = signal(0);
  protected readonly hasNext = signal(false);

  constructor() {
    this.load();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => this.load());
  }

  protected go(page: number) { this.page.set(page); this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.journal.list(this.page() * PAGE_SIZE, PAGE_SIZE).subscribe({
      next: items => { this.entries.set(items); this.hasNext.set(items.length === PAGE_SIZE); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
  }
}
