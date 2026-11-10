import { ChangeDetectionStrategy, Component, input } from '@angular/core';
import type { EmotionalAnalysis } from '../core/models/analysis.models';
import { CategoryPipe, EsDatePipe, RiskPipe } from './format';

@Component({
  selector: 'app-analysis-result',
  imports: [CategoryPipe, EsDatePipe, RiskPipe],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let r = analysis().result;
    <article class="stack-lg">
      <section class="card summary">
        <div class="row-between">
          <p class="eyebrow">Lectura del {{ analysis().created_at | esDate: 'time' }}</p>
          <span class="chip" [class.chip-risk]="r.risk_level !== 'none' && r.risk_level !== 'low'" [class.chip-sage]="r.risk_level === 'none'">{{ r.risk_level | risk }}</span>
        </div>
        <p class="summary-text">{{ r.summary }}</p>
        <p class="faint">Versión {{ analysis().entry_version }} de la entrada · modelo {{ analysis().model }}</p>
      </section>

      <div class="grid-2">
        <section class="card">
          <h2 class="h">Emociones nombradas</h2>
          @if (r.emotions.length) {
            <div class="row">@for (e of r.emotions; track $index) { <span class="chip chip-heather">{{ e }}</span> }</div>
          } @else { <p class="muted">No se identificaron emociones concretas.</p> }
          @if (r.patterns.length) {
            <h2 class="h" style="margin-top: 22px">Patrones observados</h2>
            <ul class="patterns">@for (p of r.patterns; track $index) { <li>{{ p }}</li> }</ul>
          }
        </section>

        <section class="card">
          <h2 class="h">Referencias de duelo</h2>
          <p class="faint">Son categorías orientativas, no un diagnóstico ni etapas que deban seguirse en orden.</p>
          @if (r.categories.length) {
            <ul class="cats">
              @for (c of r.categories; track c.category) {
                <li>
                  <div class="row-between"><strong>{{ c.category | category }}</strong><span class="mono">{{ pct(c.confidence) }}%</span></div>
                  <div class="bar" role="img" [attr.aria-label]="'Confianza ' + pct(c.confidence) + ' por ciento'"><span [style.width.%]="pct(c.confidence)"></span></div>
                  <p class="muted small">{{ c.rationale }}</p>
                </li>
              }
            </ul>
          } @else { <p class="muted">El análisis no asoció categorías a esta entrada.</p> }
          @if (r.recommended_categories.length) {
            <p class="label" style="margin-top: 16px">Áreas sugeridas para ejercicios</p>
            <div class="row" style="margin-top: 6px">@for (c of r.recommended_categories; track c) { <span class="chip chip-sage">{{ c | category }}</span> }</div>
          }
        </section>
      </div>
    </article>
  `,
  styles: [`
    .summary { display: flex; flex-direction: column; gap: 12px; }
    .summary-text { font-family: var(--font-display); font-size: 1.2rem; line-height: 1.7; white-space: pre-wrap; }
    .h { font-size: 1.05rem; margin-bottom: 12px; }
    .patterns { margin: 0; padding-left: 20px; display: flex; flex-direction: column; gap: 6px; }
    .cats { list-style: none; padding: 0; margin: 14px 0 0; display: flex; flex-direction: column; gap: 16px; }
    .bar { height: 6px; background: var(--paper-deep); border-radius: 999px; overflow: hidden; margin: 6px 0; }
    .bar span { display: block; height: 100%; background: var(--heather); border-radius: 999px; }
    .small { font-size: .9rem; }
  `],
})
export class AnalysisResultComponent {
  readonly analysis = input.required<EmotionalAnalysis>();
  protected pct(value: number): number {
    const v = value <= 1 ? value * 100 : value;
    return Math.max(0, Math.min(100, Math.round(v)));
  }
}
