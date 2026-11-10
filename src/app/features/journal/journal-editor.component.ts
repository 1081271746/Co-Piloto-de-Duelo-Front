import { ChangeDetectionStrategy, Component, HostListener, inject, signal } from '@angular/core';
import { AbstractControl, FormBuilder, ReactiveFormsModule, ValidationErrors, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { JournalService } from '../../core/journal.service';
import { errorMessage } from '../../core/error-messages';
import type { JournalInput } from '../../core/models/journal.models';
import type { SafetyAlert } from '../../core/models/safety.models';
import { IconComponent } from '../../shared/icon.component';
import { PageHeaderComponent } from '../../shared/page-header.component';
import { SafetyGuidanceComponent } from '../../shared/safety-guidance.component';
import { ErrorStateComponent, LoadingComponent } from '../../shared/status.component';

const notBlank = (c: AbstractControl): ValidationErrors | null =>
  typeof c.value === 'string' && c.value.trim().length === 0 ? { blank: true } : null;

function toLocalInput(iso: string): string {
  const d = new Date(iso);
  if (Number.isNaN(d.getTime())) return '';
  const pad = (n: number) => String(n).padStart(2, '0');
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}T${pad(d.getHours())}:${pad(d.getMinutes())}`;
}

@Component({
  selector: 'app-journal-editor',
  imports: [ReactiveFormsModule, RouterLink, IconComponent, PageHeaderComponent, SafetyGuidanceComponent, ErrorStateComponent, LoadingComponent],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './journal-editor.component.html',
  styleUrl: './journal-editor.component.css',
})
export class JournalEditorComponent {
  private journal = inject(JournalService);
  private router = inject(Router);
  private fb = inject(FormBuilder);
  protected readonly entryId = inject(ActivatedRoute).snapshot.paramMap.get('id');
  protected readonly isEdit = !!this.entryId && this.entryId !== 'new';

  protected readonly states = ['Tristeza', 'Nostalgia', 'Calma', 'Enojo', 'Culpa', 'Cansancio', 'Ansiedad', 'Confusión', 'Vacío', 'Gratitud', 'Alivio', 'Esperanza'];
  protected readonly maxContent = 10000;

  protected readonly form = this.fb.nonNullable.group({
    content: ['', [Validators.required, Validators.maxLength(10000), notBlank]],
    emotional_state: ['', [Validators.required, Validators.maxLength(100), notBlank]],
    recorded_at: [''],
  });

  protected readonly loading = signal(this.isEdit);
  protected readonly loadError = signal('');
  protected readonly ready = signal(!this.isEdit);
  protected readonly saving = signal(false);
  protected readonly saveError = signal('');
  protected readonly savedAlert = signal<SafetyAlert | null>(null);
  protected readonly savedId = signal<string | null>(null);
  protected readonly length = signal(0);

  constructor() {
    this.form.controls.content.valueChanges.subscribe(v => this.length.set(v.length));
    if (this.isEdit) this.load();
  }

  load() {
    if (!this.entryId) return;
    this.loading.set(true);
    this.loadError.set('');
    this.ready.set(false);
    this.journal.get(this.entryId).subscribe({
      next: entry => {
        this.form.reset({ content: entry.content, emotional_state: entry.emotional_state, recorded_at: toLocalInput(entry.recorded_at) });
        this.length.set(entry.content.length);
        this.ready.set(true);
        this.loading.set(false);
      },
      error: err => { this.loadError.set(errorMessage(err)); this.loading.set(false); },
    });
  }

  canLeave(): boolean {
    if (!this.form.dirty || this.saving()) return !this.saving() || confirm('Se está guardando tu entrada. ¿Salir de todos modos?');
    return confirm('Tienes cambios sin guardar. Si sales ahora se perderán. ¿Quieres salir?');
  }

  @HostListener('window:beforeunload', ['$event'])
  protected onBeforeUnload(event: BeforeUnloadEvent) {
    if (this.form.dirty) { event.preventDefault(); event.returnValue = ''; }
  }

  protected pick(state: string) {
    const c = this.form.controls.emotional_state;
    c.setValue(c.value === state ? '' : state);
    c.markAsDirty();
    c.markAsTouched();
  }

  protected invalid(name: 'content' | 'emotional_state') {
    const c = this.form.controls[name];
    return c.invalid && (c.touched || c.dirty);
  }

  protected submit() {
    if (this.saving() || !this.ready()) return;
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    const v = this.form.getRawValue();
    const data: JournalInput = { content: v.content, emotional_state: v.emotional_state.trim() };
    const dateControl = this.form.controls.recorded_at;
    if (v.recorded_at && (!this.isEdit || dateControl.dirty)) {
      const d = new Date(v.recorded_at);
      if (!Number.isNaN(d.getTime())) data.recorded_at = d.toISOString();
    }
    this.saving.set(true);
    this.saveError.set('');
    const request = this.isEdit && this.entryId ? this.journal.update(this.entryId, data) : this.journal.create(data);
    request.subscribe({
      next: result => {
        this.saving.set(false);
        this.form.markAsPristine();
        if (result.safety_alert) {
          this.savedAlert.set(result.safety_alert);
          this.savedId.set(result.entry.id);
        } else {
          void this.router.navigate(['/journal', result.entry.id], { queryParams: { saved: '1' } });
        }
      },
      error: err => { this.saving.set(false); this.saveError.set(errorMessage(err)); },
    });
  }
}
