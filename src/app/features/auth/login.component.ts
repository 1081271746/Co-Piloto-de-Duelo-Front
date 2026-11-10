import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { safeReturnUrl } from '../../core/auth.guard';
import { errorMessage } from '../../core/error-messages';
import { IconComponent } from '../../shared/icon.component';
import { AuthFrameComponent } from './auth-frame.component';

@Component({
  selector: 'app-login',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, AuthFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './login.component.html',
  styleUrl: './auth.css',
})
export class LoginComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private route = inject(ActivatedRoute);
  private fb = inject(FormBuilder);

  protected readonly form = this.fb.nonNullable.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required]],
  });
  protected readonly submitting = signal(false);
  protected readonly error = signal('');
  protected readonly notice = signal(this.initialNotice());
  protected readonly storageWarning = !this.auth.tokens.storageAvailable();

  private initialNotice(): { tone: 'success' | 'info' | 'warn'; text: string } | null {
    const q = this.route.snapshot.queryParamMap;
    if (q.get('registered')) return { tone: 'success', text: 'Tu cuenta está lista. Inicia sesión para abrir tu cuaderno.' };
    if (q.get('password')) return { tone: 'success', text: 'Cambiaste tu contraseña. Inicia sesión con la nueva.' };
    if (q.get('logout') === 'partial') return { tone: 'warn', text: 'Cerramos la sesión en este navegador, pero no pudimos confirmar con el servidor. Es posible que la sesión remota no se haya revocado.' };
    if (q.get('logout')) return { tone: 'info', text: 'Cerraste sesión. Hasta pronto.' };
    if (q.get('expired')) return { tone: 'info', text: 'Tu sesión terminó. Inicia sesión de nuevo para continuar.' };
    return null;
  }

  protected invalid(name: 'email' | 'password') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');
    const { email, password } = this.form.getRawValue();
    this.auth.login({ email: email.trim(), password }).subscribe({
      next: () => {
        this.form.reset();
        void this.router.navigateByUrl(safeReturnUrl(this.route.snapshot.queryParamMap.get('returnUrl')));
      },
      error: err => {
        this.submitting.set(false);
        this.form.controls.password.reset();
        this.error.set(errorMessage(err));
      },
    });
  }
}
