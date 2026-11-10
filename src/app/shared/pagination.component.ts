import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-pagination',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    @if (page() > 0 || hasNext()) {
      <nav class="pager" aria-label="Paginación">
        <button type="button" class="btn btn-secondary btn-sm" [disabled]="page() === 0 || disabled()" (click)="pageChange.emit(page() - 1)">
          <app-icon name="left" [size]="16" /> Anterior
        </button>
        <span class="faint">Página {{ page() + 1 }}</span>
        <button type="button" class="btn btn-secondary btn-sm" [disabled]="!hasNext() || disabled()" (click)="pageChange.emit(page() + 1)">
          Siguiente <app-icon name="right" [size]="16" />
        </button>
      </nav>
    }
  `,
  styles: ['.pager { display: flex; align-items: center; justify-content: center; gap: 16px; margin-top: 24px; }'],
})
export class PaginationComponent {
  readonly page = input.required<number>();
  readonly hasNext = input.required<boolean>();
  readonly disabled = input(false);
  readonly pageChange = output<number>();
}
