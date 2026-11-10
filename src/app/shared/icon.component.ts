import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

const PATHS: Record<string, string[]> = {
  home: ['M4 11.5 12 5l8 6.5', 'M6.5 10v9h11v-9'],
  book: ['M5 5.5c2.5-1 5-1 7 .5v13c-2-1.5-4.5-1.5-7-.5z', 'M19 5.5c-2.5-1-5-1-7 .5v13c2-1.5 4.5-1.5 7-.5z'],
  pen: ['M14.5 5.5 18.5 9.5', 'M5 19l1-4 10-10 3 3-10 10z'],
  lens: ['M10.5 4.5a6 6 0 1 0 0 12 6 6 0 0 0 0-12z', 'M15 15l4.5 4.5'],
  leaf: ['M5 19c0-8 5-13 14-14-1 9-6 14-14 14z', 'M5 19l7-7'],
  chart: ['M5 19V5', 'M5 19h14', 'M9 16v-5', 'M13 16V8', 'M17 16v-3'],
  shield: ['M12 4l7 3v5c0 4-3 7-7 8-4-1-7-4-7-8V7z'],
  gear: ['M12 9a3 3 0 1 0 0 6 3 3 0 0 0 0-6z', 'M12 3v3M12 18v3M3 12h3M18 12h3M5.6 5.6l2.1 2.1M16.3 16.3l2.1 2.1M5.6 18.4l2.1-2.1M16.3 7.7l2.1-2.1'],
  logout: ['M14 5H6v14h8', 'M10 12h10', 'M17 9l3 3-3 3'],
  menu: ['M4 7h16', 'M4 12h16', 'M4 17h16'],
  close: ['M6 6l12 12', 'M18 6 6 18'],
  left: ['M15 5l-7 7 7 7'],
  right: ['M9 5l7 7-7 7'],
  check: ['M5 12.5l4.5 4.5L19 7'],
  alert: ['M12 4 3 19.5h18z', 'M12 10v4.5', 'M12 17v.5'],
  info: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z', 'M12 11v5', 'M12 8v.5'],
  refresh: ['M19 12a7 7 0 1 1-2-5', 'M19 4v4h-4'],
  trash: ['M5 7h14', 'M9 7V4.5h6V7', 'M7 7l1 12.5h8L17 7'],
  clock: ['M12 3.5a8.5 8.5 0 1 0 0 17 8.5 8.5 0 0 0 0-17z', 'M12 7.5V12l3 2'],
  external: ['M14 4h6v6', 'M20 4l-9 9', 'M18 14v5H5V6h5'],
  plus: ['M12 5v14', 'M5 12h14'],
  history: ['M4 12a8 8 0 1 0 2.5-5.8', 'M4 4v4h4', 'M12 8v4l3 2'],
  signal: ['M5 18a10 10 0 0 1 14 0', 'M8 15a6 6 0 0 1 8 0', 'M12 12.5v.5'],
  heart: ['M12 19s-7-4.4-7-9.5A3.8 3.8 0 0 1 12 7a3.8 3.8 0 0 1 7 2.5C19 14.6 12 19 12 19z'],
};

@Component({
  selector: 'app-icon',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <svg [attr.width]="size()" [attr.height]="size()" viewBox="0 0 24 24" fill="none" stroke="currentColor"
      stroke-width="1.6" stroke-linecap="round" stroke-linejoin="round" aria-hidden="true" focusable="false">
      @for (d of paths(); track $index) { <path [attr.d]="d" /> }
    </svg>
  `,
  styles: [':host { display: inline-flex; line-height: 0; }'],
})
export class IconComponent {
  readonly name = input.required<string>();
  readonly size = input(18);
  protected readonly paths = computed(() => PATHS[this.name()] ?? []);
}
