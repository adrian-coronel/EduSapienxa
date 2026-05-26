import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { InstructorService } from '../../core/services/instructor.service';
import { Instructor } from '../../core/models/instructor.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-instructors',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Instructores" description="Gestiona los instructores del catálogo">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo instructor
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.instructors()" [loading]="service.loading()" />

    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar instructor' : 'Nuevo instructor' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre *</label>
            <input formControlName="name" type="text" class="form-input" />
            <p *ngIf="isInvalid('name')" class="form-error">Requerido.</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Email</label>
              <input formControlName="email" type="email" class="form-input" />
            </div>
            <div>
              <label class="form-label">Teléfono</label>
              <input formControlName="phoneNumber" type="text" class="form-input" />
            </div>
          </div>
          <div>
            <label class="form-label">Especialidad</label>
            <input formControlName="expertise" type="text" class="form-input" />
          </div>
          <div>
            <label class="form-label">Resumen</label>
            <textarea formControlName="summary" rows="3" class="form-input resize-none"></textarea>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeModal()" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class InstructorsComponent implements OnInit {
  service = inject(InstructorService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    email: [''],
    phoneNumber: [''],
    expertise: [''],
    summary: [''],
    profilePicture: ['']
  });

  columns: TableColumn<Instructor>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    { key: 'phoneNumber', label: 'Teléfono' },
    { key: 'expertise', label: 'Especialidad' },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__editInstructor('${row.id}')`, 'Editar', 'edit', 'primary')}
        ${tableActionIconButton(`window.__deleteInstructor('${row.id}')`, 'Eliminar', 'delete', 'danger')}
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__editInstructor = (id: string) => this.openEdit(id);
    (window as any).__deleteInstructor = (id: string) => this.delete(id);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset();
    this.showModal.set(true);
  }

  openEdit(id: string) {
    const item = this.service.instructors().find(i => i.id === id);
    if (!item) return;
    this.editingId.set(id);
    this.form.patchValue({
      name: item.name,
      email: item.email ?? '',
      phoneNumber: item.phoneNumber ?? '',
      expertise: item.expertise ?? '',
      summary: item.summary ?? ''
    });
    this.showModal.set(true);
  }

  closeModal() { this.showModal.set(false); this.editingId.set(null); }
  isInvalid(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as any;
    const dto = { name: val.name, email: val.email || undefined, phoneNumber: val.phoneNumber || undefined,
      expertise: val.expertise || undefined, summary: val.summary || undefined };

    const obs = this.editingId()
      ? this.service.update(this.editingId()!, dto)
      : this.service.create(dto);

    obs.subscribe({ next: () => { this.saving.set(false); this.closeModal(); }, error: () => this.saving.set(false) });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este instructor?')) return;
    this.service.delete(id).subscribe();
  }
}
