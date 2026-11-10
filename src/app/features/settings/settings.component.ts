import { ChangeDetectionStrategy, Component, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../core/auth.service';
import { RealtimeService } from '../../core/realtime.service';
import { errorMessage } from '../../core/error-messages';
import { COUNTRIES } from '../../shared/countries';
import { SessionExitService } from '../../shared/session-exit.service';
import { EsDatePipe } from '../../shared/format';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

const differs = (g: AbstractControl): ValidationErrors | null => {
  const cur = g.get('current_password')?.value;
  const next = g.get('new_password')?.value;
  return cur && next && cur === next ? { same: true } : null;
};

@Component({
  selector: 'app-settings',
  imports: [ReactiveFormsModule, EsDatePipe, IconComponent, PageHeaderComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './settings.component.html',
})
export class SettingsComponent {
  protected readonly auth = inject(AuthService);
  private router = inject(Router);
  private realtime = inject(RealtimeService);
  private fb = inject(FormBuilder);
  private exit = inject(SessionExitService);
  protected readonly countries = COUNTRIES;

  protected readonly profile = this.fb.nonNullable.group({
    name: ['', [Validators.required, Validators.maxLength(100)]],
    country: ['', [Validators.required]],
  });
  protected readonly password = this.fb.nonNullable.group({
    current_password: ['', [Validators.required]],
    new_password: ['', [Validators.required, Validators.minLength(12), Validators.maxLength(128)]],
  }, { validators: differs });

  protected readonly loading = signal(true);
  protected readonly loadError = signal('');
  protected readonly savingProfile = signal(false);
  protected readonly profileMsg = signal<{ ok: boolean; text: string } | null>(null);
  protected readonly savingPassword = signal(false);
  protected readonly passwordError = signal('');

  constructor() { this.load(); }

  load() {
    this.loading.set(true);
    this.loadError.set('');
    this.auth.profile().subscribe({
      next: u => { this.profile.reset({ name: u.name, country: u.country }); this.loading.set(false); },
      error: err => { this.loadError.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  protected hasCountry(code: string) { return this.countries.some(c => c.code === code); }

  protected invalid(c: AbstractControl) { return c.invalid && (c.touched || c.dirty); }

  protected saveProfile() {
    if (this.profile.invalid) { this.profile.markAllAsTouched(); return; }
    const v = this.profile.getRawValue();
    this.savingProfile.set(true);
    this.profileMsg.set(null);
    this.auth.updateProfile({ name: v.name.trim(), country: v.country }).subscribe({
      next: u => { this.profile.reset({ name: u.name, country: u.country }); this.savingProfile.set(false); this.profileMsg.set({ ok: true, text: 'Guardamos tus datos.' }); },
      error: err => { this.savingProfile.set(false); this.profileMsg.set({ ok: false, text: errorMessage(err) }); },
    });
  }

  protected changePassword() {
    if (this.password.invalid) { this.password.markAllAsTouched(); return; }
    this.savingPassword.set(true);
    this.passwordError.set('');
    this.exit.intentional = true;
    this.auth.changePassword(this.password.getRawValue()).subscribe({
      next: () => {
        this.password.reset();
        this.realtime.disconnect();
        void this.router.navigate(['/login'], { queryParams: { password: '1' } });
      },
      error: err => { this.exit.intentional = false; this.savingPassword.set(false); this.password.reset(); this.passwordError.set(errorMessage(err)); },
    });
  }
}
