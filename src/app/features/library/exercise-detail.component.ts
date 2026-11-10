import { ChangeDetectionStrategy, Component, computed, inject, signal } from '@angular/core';
import { HttpErrorResponse } from '@angular/common/http';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { AnalysisService } from '../../core/analysis.service';
import { LibraryService } from '../../core/library.service';
import { errorMessage } from '../../core/error-messages';
import type { Exercise } from '../../core/models/library.models';
import type { SafetyGuidance } from '../../core/models/safety.models';
import { CategoryPipe } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { SafetyGuidanceComponent } from '../../shared/safety-guidance.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

@Component({
  selector: 'app-exercise-detail',
  imports: [ReactiveFormsModule, RouterLink, CategoryPipe, IconComponent, SafetyGuidanceComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './exercise-detail.component.html',
  styleUrl: './exercise-detail.component.css',
})
export class ExerciseDetailComponent {
  private library = inject(LibraryService);
  private analysis = inject(AnalysisService);
  private route = inject(ActivatedRoute);
  private id = this.route.snapshot.paramMap.get('id') ?? '';
  private analysisId = this.route.snapshot.queryParamMap.get('analysis');

  protected readonly exercise = signal<Exercise | null>(null);
  protected readonly loading = signal(true);
  protected readonly error = signal('');
  protected readonly guidance = signal<SafetyGuidance | null>(null);
  protected readonly safetyChecked = signal(false);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly saved = signal(false);
  protected readonly blocked = computed(() => !!this.guidance() || !this.safetyChecked());

  protected readonly form = inject(FormBuilder).nonNullable.group({ notes: ['', [Validators.maxLength(2000)]] });

  constructor() {
    this.load();
  }

  load() {
    this.loading.set(true);
    this.error.set('');
    this.library.exercise(this.id).subscribe({
      next: e => { this.exercise.set(e); this.loading.set(false); },
      error: err => { this.error.set(errorMessage(err)); this.loading.set(false); },
    });
    this.analysis.recommendations().subscribe({
      next: r => { this.guidance.set(r.safety_guidance); this.safetyChecked.set(true); },
      error: () => {
        this.safetyChecked.set(false);
        this.saveError.set('No pudimos comprobar las recomendaciones actuales. Vuelve a cargar antes de registrar este ejercicio.');
      },
    });
  }

  protected complete() {
    if (this.blocked() || this.saving()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const notes = this.form.getRawValue().notes.trim();
    this.saving.set(true);
    this.saveError.set('');
    this.library.complete(this.id, { notes: notes || null, analysis_id: this.analysisId || null }).subscribe({
      next: () => { this.saving.set(false); this.saved.set(true); this.form.reset(); },
      error: err => {
        this.saving.set(false);
        const guidance = err instanceof HttpErrorResponse && err.status === 409 ? err.error?.detail?.guidance as SafetyGuidance | undefined : undefined;
        if (guidance) this.guidance.set(guidance);
        this.saveError.set(errorMessage(err));
      },
    });
  }
}
