import { ChangeDetectionStrategy, Component, inject } from '@angular/core';
import { RouterLink } from '@angular/router';
import { AuthService } from '../core/auth.service';

@Component({
  selector: 'app-not-found',
  imports: [RouterLink],
  changeDetection: ChangeDetectionStrategy.OnPush,
  template: `
    <main class="nf">
      <div class="card stack" style="max-width: 460px; text-align: center; align-items: center">
        <p class="eyebrow">Página no encontrada</p>
        <h1>Este camino no lleva a ninguna página</h1>
        <p class="muted">Puede que el enlace haya cambiado o que el contenido ya no exista.</p>
        <a class="btn btn-primary" [routerLink]="auth.authenticated() ? '/dashboard' : '/login'">Volver a un lugar conocido</a>
      </div>
    </main>
  `,
  styles: ['.nf { min-height: 100dvh; display: grid; place-items: center; padding: 24px; }'],
})
export class NotFoundComponent {
  protected readonly auth = inject(AuthService);
}
