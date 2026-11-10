import { ChangeDetectionStrategy, Component, input } from '@angular/core';

@Component({
  selector: 'app-empty-state',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <section class="empty card card-quiet">
      <svg width="120" height="72" viewBox="0 0 120 72" aria-hidden="true">
        <circle cx="86" cy="26" r="13" fill="var(--ember-wash)" stroke="var(--ember)" stroke-width="1.2" />
        <path d="M8 52 C 30 44, 48 58, 70 50 S 104 44, 112 50" fill="none" stroke="var(--dusk)" stroke-width="1.3" opacity=".55" />
        <path d="M16 62 C 36 56, 56 66, 78 60 S 100 56, 106 60" fill="none" stroke="var(--heather)" stroke-width="1.3" opacity=".5" />
      </svg>
      <h2>{{ title() }}</h2>
      @if (text()) { <p class="muted">{{ text() }}</p> }
      <div class="row center"><ng-content /></div>
    </section>
  `,
  styles: [`
    .empty { display: flex; flex-direction: column; align-items: center; text-align: center; gap: 10px; padding: 40px 24px; }
    .empty p { max-width: 440px; }
    .center { justify-content: center; margin-top: 6px; }
  `],
})
export class EmptyStateComponent {
  readonly title = input.required<string>();
  readonly text = input('');
}
