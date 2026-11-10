import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { IconComponent } from './icon.component';

@Component({
  selector: 'app-loading',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="stack" role="status" aria-live="polite">
      <span class="sr-only">{{ label() }}</span>
      @for (row of rowList(); track $index) {
        <div class="card sk" aria-hidden="true">
          <div class="skeleton" style="height: 12px; width: 28%"></div>
          <div class="skeleton" style="height: 16px; width: 82%"></div>
          <div class="skeleton" style="height: 16px; width: 64%"></div>
        </div>
      }
    </div>
  `,
  styles: ['.sk { display: flex; flex-direction: column; gap: 12px; }'],
})
export class LoadingComponent {
  readonly rows = input(3);
  readonly label = input('Cargando');
  protected rowList() { return Array.from({ length: this.rows() }); }
}

@Component({
  selector: 'app-error',
  imports: [IconComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="alert alert-error" role="alert">
      <app-icon name="alert" />
      <div class="stack" style="gap: 10px">
        <p>{{ message() }}</p>
        @if (retryable()) {
          <div><button type="button" class="btn btn-secondary btn-sm" (click)="retry.emit()"><app-icon name="refresh" [size]="16" /> Reintentar</button></div>
        }
      </div>
    </div>
  `,
})
export class ErrorStateComponent {
  readonly message = input.required<string>();
  readonly retryable = input(true);
  readonly retry = output<void>();
}
