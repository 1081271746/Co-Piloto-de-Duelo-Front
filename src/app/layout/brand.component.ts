import { ChangeDetectionStrategy, Component } from '@angular/core';

@Component({
  selector: 'app-brand',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <span class="brand">
      <svg width="34" height="34" viewBox="0 0 34 34" aria-hidden="true">
        <circle cx="17" cy="17" r="16" fill="var(--dusk)" />
        <circle cx="21.5" cy="13" r="5" fill="var(--ember-wash)" />
        <path d="M6 22c4-2 7 1 11-1s7-2 11 0" fill="none" stroke="#f4efe6" stroke-width="1.4" stroke-linecap="round" opacity=".85" />
        <path d="M8 26c3-1.5 6 .6 9-.6s6-1.4 9 0" fill="none" stroke="#f4efe6" stroke-width="1.2" stroke-linecap="round" opacity=".5" />
      </svg>
      <span class="txt"><strong>Co-Piloto</strong><span>de Duelo</span></span>
    </span>
  `,
  styles: [`
    .brand { display: inline-flex; align-items: center; gap: 10px; }
    .txt { display: flex; flex-direction: column; line-height: 1.05; font-family: var(--font-display); }
    .txt strong { font-weight: 600; font-size: 1.1rem; color: var(--ink); }
    .txt span { font-size: .9rem; color: var(--ink-soft); font-style: italic; }
  `],
})
export class BrandComponent {}
