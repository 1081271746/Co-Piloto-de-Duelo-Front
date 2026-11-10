import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';

export interface BarItem { label: string; count: number }

@Component({
  selector: 'app-bar-list',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <ul class="bars" [attr.aria-label]="caption()">
      @for (item of rows(); track item.label) {
        <li>
          <span class="lbl">{{ item.label }}</span>
          <span class="track" aria-hidden="true"><span class="fill" [style.width.%]="item.pct" [style.background]="color()"></span></span>
          <span class="num mono">{{ item.count }}</span>
        </li>
      }
    </ul>
  `,
  styles: [`
    .bars { list-style: none; margin: 0; padding: 0; display: flex; flex-direction: column; gap: 10px; }
    li { display: grid; grid-template-columns: minmax(90px, 160px) 1fr 40px; align-items: center; gap: 12px; font-size: .92rem; }
    .lbl { overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .track { height: 10px; background: var(--paper-deep); border-radius: 999px; overflow: hidden; }
    .fill { display: block; height: 100%; border-radius: 999px; min-width: 2px; }
  `],
})
export class BarListComponent {
  readonly items = input.required<BarItem[]>();
  readonly caption = input('');
  readonly color = input('var(--heather)');
  protected readonly rows = computed(() => {
    const max = Math.max(0, ...this.items().map(i => i.count));
    return this.items().map(i => ({ ...i, pct: max > 0 ? (i.count / max) * 100 : 0 }));
  });
}
