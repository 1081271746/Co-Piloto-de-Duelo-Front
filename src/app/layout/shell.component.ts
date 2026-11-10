import { ChangeDetectionStrategy, Component, DestroyRef, effect, inject, signal } from '@angular/core';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';
import { NavigationEnd, Router, RouterLink, RouterLinkActive, RouterOutlet } from '@angular/router';
import { filter } from 'rxjs';
import { AuthService } from '../core/auth.service';
import { RealtimeService } from '../core/realtime.service';
import { IconComponent } from '../shared/icon.component';
import { RealtimeStatusComponent } from '../shared/realtime-status.component';
import { SessionExitService } from '../shared/session-exit.service';
import { BrandComponent } from './brand.component';

interface NavItem { path: string; label: string; icon: string }

@Component({
  selector: 'app-shell',
  imports: [RouterOutlet, RouterLink, RouterLinkActive, IconComponent, RealtimeStatusComponent, BrandComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './shell.component.html',
  styleUrl: './shell.component.css',
})
export class ShellComponent {
  protected readonly auth = inject(AuthService);
  private router = inject(Router);
  private realtime = inject(RealtimeService);
  protected readonly menuOpen = signal(false);
  protected readonly signingOut = signal(false);
  private exit = inject(SessionExitService);

  protected readonly nav: NavItem[] = [
    { path: '/dashboard', label: 'Inicio', icon: 'home' },
    { path: '/journal', label: 'Diario', icon: 'book' },
    { path: '/analysis', label: 'Reflexiones', icon: 'lens' },
    { path: '/library', label: 'Biblioteca', icon: 'leaf' },
    { path: '/tracking', label: 'Seguimiento', icon: 'chart' },
    { path: '/support', label: 'Acompañamiento', icon: 'shield' },
    { path: '/settings', label: 'Mi cuenta', icon: 'gear' },
  ];

  constructor() {
    this.exit.intentional = false;
    effect(() => {
      if (!this.auth.authenticated()) {
        this.auth.user.set(null);
        if (this.exit.intentional) return;
        this.exit.intentional = true;
        void this.router.navigate(['/login'], { queryParams: { expired: '1' } });
      }
    });
    this.router.events.pipe(filter(e => e instanceof NavigationEnd), takeUntilDestroyed(inject(DestroyRef)))
      .subscribe(() => this.menuOpen.set(false));
  }

  protected initials(): string {
    const name = this.auth.user()?.name?.trim() ?? '';
    return name.split(/\s+/).slice(0, 2).map(p => p[0]?.toUpperCase() ?? '').join('') || 'Tú';
  }

  protected logout() {
    if (this.signingOut()) return;
    this.signingOut.set(true);
    this.exit.intentional = true;
    this.auth.logout().subscribe({
      next: () => this.finish(false),
      error: () => this.finish(true),
    });
  }

  private finish(failed: boolean) {
    this.realtime.disconnect();
    void this.router.navigate(['/login'], { queryParams: failed ? { logout: 'partial' } : { logout: '1' } });
  }
}
