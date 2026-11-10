import { TestBed } from '@angular/core/testing';
import { FormGroup } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { describe, expect, it, vi } from 'vitest';
import { AuthService } from '../../core/auth.service';
import { RegisterComponent } from './register.component';

describe('Registro compatible con las reglas de contraseña del servidor', () => {
  it('rechaza contraseñas de ocho u once caracteres y admite doce', () => {
    TestBed.configureTestingModule({ providers: [
      { provide: AuthService, useValue: {} },
      { provide: Router, useValue: { navigate: vi.fn() } },
    ] });
    const component = TestBed.runInInjectionContext(() => new RegisterComponent());
    const form = (component as unknown as { form: FormGroup }).form;
    const password = form.controls['password'];
    password.setValue('12345678');
    expect(password.hasError('minlength')).toBe(true);
    password.setValue('12345678901');
    expect(password.hasError('minlength')).toBe(true);
    password.setValue('123456789012');
    expect(password.valid).toBe(true);
    password.setValue('x'.repeat(129));
    expect(password.hasError('maxlength')).toBe(true);
  });
});
