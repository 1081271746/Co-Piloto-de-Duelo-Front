import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-page-header',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <header class="head">
      <div class="text">
        @if (eyebrow()) { <p class="eyebrow">{{ eyebrow() }}</p> }
        <h1>{{ title() }}</h1>
        @if (lead()) { <p class="lead">{{ lead() }}</p> }
      </div>
      <div class="actions"><ng-content /></div>
    </header>
  `,
  styles: [`
    .head { display: flex; justify-content: space-between; align-items: flex-end; gap: 20px; flex-wrap: wrap; margin-bottom: 28px; padding-bottom: 22px; border-bottom: 1px solid var(--line); }
    .text { display: flex; flex-direction: column; gap: 6px; max-width: 620px; }
    .lead { color: var(--ink-soft); font-size: 1.02rem; }
    .actions { display: flex; gap: 10px; flex-wrap: wrap; }
    .actions:empty { display: none; }
  `],
})
export class PageHeaderComponent {
  readonly title = input.required<string>();
  readonly eyebrow = input('');
  readonly lead = input('');
}
