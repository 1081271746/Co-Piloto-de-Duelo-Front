import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { errorMessage } from '../../core/error-messages';
import { IconComponent } from '../../shared/icon.component';
import { COUNTRIES } from '../../shared/countries';
import { AuthFrameComponent } from './auth-frame.component';

type Field = 'name' | 'email' | 'password' | 'country';

@Component({
  selector: 'app-register',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, AuthFrameComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './register.component.html',
  styleUrl: './auth.css',
})
export class RegisterComponent {
  private auth = inject(AuthService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  protected readonly countries = COUNTRIES;

  protected readonly form = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
    country: ['', [Validators.required]],
  });
  protected readonly submitting = signal(false);
  protected readonly error = signal('');

  protected invalid(name: Field) {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.submitting.set(true);
    this.error.set('');
    const v = this.form.getRawValue();
    this.auth.register({ name: v.name.trim(), email: v.email.trim(), password: v.password, country: v.country }).subscribe({
      next: () => {
        this.form.reset();
        void this.router.navigate(['/login'], { queryParams: { registered: '1' } });
      },
      error: err => {
        this.submitting.set(false);
        this.form.controls.password.reset();
        this.error.set(errorMessage(err));
      },
    });
  }
}
