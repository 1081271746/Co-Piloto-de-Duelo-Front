import { ChangeDetectionStrategy, Component, computed, inject, input } from '@angular/core';
import { RealtimeService } from '../core/realtime.service';

const LABELS: Record<string, { label: string; tone: string; detail: string }> = {
  connected: { label: 'Actualización en vivo', tone: 'ok', detail: 'Los cambios de tus otras sesiones aparecen aquí sin recargar.' },
  connecting: { label: 'Conectando', tone: 'wait', detail: 'Estableciendo la conexión de actualizaciones.' },
  reconnecting: { label: 'Reconectando', tone: 'wait', detail: 'Se perdió la conexión de actualizaciones; reintentando.' },
  disconnected: { label: 'Sin actualización en vivo', tone: 'off', detail: 'Los datos se cargan al abrir cada página.' },
  unavailable: { label: 'Actualización en vivo no disponible', tone: 'off', detail: 'El servidor no aceptó la conexión en vivo. Puedes seguir usando el diario; recarga las páginas para ver cambios.' },
};

@Component({
  selector: 'app-realtime-status',
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <div class="rt" role="status" aria-live="polite">
      <span class="dot" [attr.data-tone]="info().tone" aria-hidden="true"></span>
      <span class="lbl">{{ info().label }}</span>
      @if (detailed()) { <p class="faint detail">{{ info().detail }}</p> }
    </div>
  `,
  styles: [`
    .rt { display: flex; align-items: center; gap: 8px; flex-wrap: wrap; font-size: .84rem; color: var(--ink-soft); }
    .dot { width: 8px; height: 8px; border-radius: 50%; background: var(--ink-faint); flex-shrink: 0; }
    .dot[data-tone="ok"] { background: var(--sage); }
    .dot[data-tone="wait"] { background: var(--ember); }
    .detail { flex-basis: 100%; margin-top: 2px; }
  `],
})
export class RealtimeStatusComponent {
  private realtime = inject(RealtimeService);
  readonly detailed = input(false);
  protected readonly info = computed(() => LABELS[this.realtime.state()] ?? LABELS['disconnected']);
}
