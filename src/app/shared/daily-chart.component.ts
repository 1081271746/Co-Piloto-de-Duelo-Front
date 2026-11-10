import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { formatDate } from './format';

export interface DailyRow { date: string; state: string; count: number }

@Component({
  selector: 'app-daily-chart',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @let d = days();
    <figure class="fig">
      <svg [attr.viewBox]="'0 0 ' + width() + ' 150'" preserveAspectRatio="none" class="svg" role="img" [attr.aria-label]="summary()">
        <line x1="0" y1="130" [attr.x2]="width()" y2="130" stroke="var(--line)" stroke-width="1" />
        @for (day of d; track day.date; let i = $index) {
          <rect [attr.x]="i * 24 + 5" [attr.y]="130 - day.h" width="14" [attr.height]="day.h" rx="3" fill="var(--dusk)" opacity=".75">
            <title>{{ day.label }}: {{ day.total }}</title>
          </rect>
        }
      </svg>
      <figcaption class="row-between faint">
        <span>{{ d[0]?.label }}</span><span>Máximo diario: {{ max() }} {{ max() === 1 ? 'entrada' : 'entradas' }} · base cero</span><span>{{ d[d.length - 1]?.label }}</span>
      </figcaption>
    </figure>
    <details class="alt">
      <summary class="label">Ver los datos como tabla</summary>
      <div class="table-wrap" style="margin-top: 10px">
        <table class="table">
          <caption class="sr-only">Estados registrados por día</caption>
          <thead><tr><th scope="col">Fecha</th><th scope="col">Estado</th><th scope="col" class="num">Entradas</th></tr></thead>
          <tbody>
            @for (r of rows(); track $index) {
              <tr><td>{{ fmt(r.date) }}</td><td>{{ r.state }}</td><td class="num">{{ r.count }}</td></tr>
            }
          </tbody>
        </table>
      </div>
    </details>
  `,
  styles: [`
    .fig { margin: 0; }
    .svg { width: 100%; height: 150px; display: block; }
    figcaption { font-size: .8rem; margin-top: 6px; }
    .alt { margin-top: 14px; }
  `],
})
export class DailyChartComponent {
  readonly rows = input.required<DailyRow[]>();
  protected fmt = (v: string) => formatDate(v, 'long');
  private totals = computed(() => {
    const map = new Map<string, number>();
    for (const r of this.rows()) map.set(r.date, (map.get(r.date) ?? 0) + r.count);
    return [...map.entries()].sort(([a], [b]) => a.localeCompare(b));
  });
  protected readonly max = computed(() => Math.max(0, ...this.totals().map(([, n]) => n)));
  protected readonly width = computed(() => Math.max(1, this.totals().length) * 24);
  protected readonly days = computed(() => {
    const max = this.max();
    return this.totals().map(([date, total]) => ({ date, total, label: formatDate(date, 'short'), h: max ? (total / max) * 120 : 0 }));
  });
  protected readonly summary = computed(() =>
    `Entradas por día en ${this.days().length} días con registros. Máximo ${this.max()} en un día.`);
}
