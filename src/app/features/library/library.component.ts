import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { FormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { LibraryService } from '../../core/library.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import type { SafetyGuidance } from '../../core/models/safety.models';
import type { Exercise, Resource } from '../../core/models/library.models';
import { EmptyStateComponent } from '../../shared/empty-state.component';
import { CategoryPipe, GRIEF_CATEGORIES, isSafeUrl, PAGE_SIZE } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { PaginationComponent } from '../../shared/pagination.component';
import { SafetyGuidanceComponent } from '../../shared/safety-guidance.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

type Tab = 'exercises' | 'resources';

@Component({
  selector: 'app-library',
  imports: [FormsModule, RouterLink, EmptyStateComponent, CategoryPipe, IconComponent, PageHeaderComponent, PaginationComponent, SafetyGuidanceComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './library.component.html',
  styleUrl: './library.component.css',
})
export class LibraryComponent {
  private library = inject(LibraryService);
  private analysis = inject(AnalysisService);
  protected readonly categories = GRIEF_CATEGORIES;
  protected readonly tab = signal<Tab>('exercises');
  protected readonly category = signal('');
  protected readonly page = signal(0);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly exercises = signal<Exercise[]>([]);
  protected readonly resources = signal<Resource[]>([]);
  protected readonly hasNext = signal(false);
  protected readonly guidance = signal<SafetyGuidance | null>(null);
  protected readonly safeUrl = isSafeUrl;

  constructor() {
    this.load();
    this.checkSafety();
    inject(RealtimeService).refresh$.pipe(takeUntilDestroyed()).subscribe(() => { this.checkSafety(); this.load(); });
  }

  private checkSafety() {
    this.analysis.recommendations().subscribe({ next: r => this.guidance.set(r.safety_guidance), error: () => undefined });
  }

  protected setTab(t: Tab) { this.tab.set(t); this.page.set(0); this.load(); }
  protected setCategory(c: string) { this.category.set(c); this.page.set(0); this.load(); }
  protected go(p: number) { this.page.set(p); this.load(); }

  load() {
    this.loading.set(true);
    this.error.set('');
    const cat = this.category() || undefined;
    const offset = this.page() * PAGE_SIZE;
    const done = (n: number) => { this.hasNext.set(n === PAGE_SIZE); this.loading.set(false); };
    const fail = (err: unknown) => { this.error.set(errorMessage(err)); this.loading.set(false); };
    if (this.tab() === 'exercises') {
      this.library.exercises(cat, offset).subscribe({ next: l => { this.exercises.set(l); done(l.length); }, error: fail });
    } else {
      this.library.resources(cat, offset).subscribe({ next: l => { this.resources.set(l); done(l.length); }, error: fail });
    }
  }
}
