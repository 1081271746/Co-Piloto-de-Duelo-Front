import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import { RouterLink } from '@angular/router';
import type { Recommendations } from '../core/models/analysis.models';
import { CategoryPipe } from './format';
import { SafetyGuidanceComponent } from './safety-guidance.component';

const REASONS: Record<Recommendations['reason'], string> = {
  analysis_required: 'Las sugerencias aparecen después de pedir una lectura de alguna entrada.',
  analysis_outdated: 'Tu última lectura corresponde a una versión anterior de la entrada. Pide una nueva lectura para actualizar las sugerencias.',
  safety_priority: 'Por ahora, lo más importante es tu seguridad. Los ejercicios quedan en pausa.',
  analysis_based: 'Basadas en tu lectura más reciente. Son opcionales; ninguna es obligatoria.',
};

@Component({
  selector: 'app-recommendations',
  imports: [RouterLink, CategoryPipe, SafetyGuidanceComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let r = data();
    @if (r.safety_guidance) {
      <app-safety-guidance [guidance]="r.safety_guidance" />
    } @else {
      <section class="stack">
        <p class="muted">{{ reasons[r.reason] }}</p>
        @if (r.items.length) {
          <ul class="grid-auto list">
            @for (ex of r.items; track ex.id) {
              <li>
                <a class="card card-link ex" [routerLink]="['/library/exercises', ex.id]">
                  <span class="chip chip-sage">{{ ex.category | category }}</span>
                  <h3>{{ ex.title }}</h3>
                  <p class="faint">{{ ex.duration_minutes }} min</p>
                </a>
              </li>
            }
          </ul>
        }
      </section>
    }
  `,
  styles: [`
    .list { list-style: none; padding: 0; margin: 0; }
    .ex { display: flex; flex-direction: column; gap: 8px; align-items: flex-start; height: 100%; }
  `],
})
export class RecommendationsComponent {
  readonly data = input.required<Recommendations>();
  protected readonly reasons = REASONS;
}
