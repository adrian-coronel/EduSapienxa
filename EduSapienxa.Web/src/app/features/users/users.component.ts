import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { AppUser, UserRole } from '../../core/models/user.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, ConfirmModalComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Usuarios" description="Gestiona el equipo de trabajo">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo usuario
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.users()" [loading]="service.loading()" />

    <!-- Create/Edit modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar usuario' : 'Nuevo usuario' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre</label>
            <input formControlName="name" type="text" class="form-input" placeholder="Nombre completo" />
            <p *ngIf="isInvalid('name')" class="form-error">El nombre es requerido.</p>
          </div>
          <div>
            <label class="form-label">Email</label>
            <input formControlName="email" type="email" class="form-input" placeholder="usuario@empresa.com" />
            <p *ngIf="isInvalid('email')" class="form-error">El email es requerido.</p>
          </div>
          <div *ngIf="!editingId()">
            <label class="form-label">Contraseña</label>
            <input formControlName="password" type="password" class="form-input" placeholder="••••••••" />
            <p *ngIf="isInvalid('password')" class="form-error">La contraseña es requerida.</p>
          </div>
          <div>
            <label class="form-label">Rol</label>
            <select formControlName="role" class="form-input">
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
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

    <app-confirm-modal
      [open]="showConfirm()"
      title="Desactivar usuario"
      message="¿Estás seguro de desactivar este usuario? Perderá acceso al sistema."
      confirmLabel="Desactivar"
      (confirm)="onDeactivate()"
      (cancel)="showConfirm.set(false)"
    />
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class UsersComponent implements OnInit {
  service = inject(UserService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  showConfirm = signal(false);
  editingId = signal<string | null>(null);
  deactivatingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    email: ['', [Validators.required, Validators.email]],
    password: [''],
    role: ['editor' as UserRole]
  });

  columns: TableColumn<AppUser>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'email', label: 'Email' },
    {
      key: 'role', label: 'Rol',
      template: (row) => {
        const cls = row.role === 'admin'
          ? 'inline-flex items-center rounded-full bg-purple-50 px-2.5 py-0.5 text-xs font-semibold text-purple-700'
          : 'inline-flex items-center rounded-full bg-blue-50 px-2.5 py-0.5 text-xs font-semibold text-blue-700';
        return `<span class="${cls}">${row.role === 'admin' ? 'Admin' : 'Editor'}</span>`;
      }
    },
    {
      key: 'isActive', label: 'Estado',
      template: (row) => `<span class="${row.isActive ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700' : 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'}">${row.isActive ? 'Activo' : 'Inactivo'}</span>`
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => {
        const actions = [
          tableActionIconButton(`window.__editUser('${row.id}')`, 'Editar usuario', 'edit', 'primary')
        ];

        if (row.isActive) {
          actions.push(tableActionIconButton(`window.__deactivateUser('${row.id}')`, 'Desactivar usuario', 'disable', 'danger'));
        }

        return `<div class="flex items-center gap-1">${actions.join('')}</div>`;
      }
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__editUser = (id: string) => this.openEdit(id);
    (window as any).__deactivateUser = (id: string) => {
      this.deactivatingId.set(id);
      this.showConfirm.set(true);
    };
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ role: 'editor' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(id: string) {
    const user = this.service.users().find(u => u.id === id);
    if (!user) return;
    this.editingId.set(id);
    this.form.patchValue(user);
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as any;
    const obs = this.editingId()
      ? this.service.update(this.editingId()!, {
          name: val.name, email: val.email, role: val.role,
          isActive: true, password: val.password || undefined
        })
      : this.service.create({ name: val.name, email: val.email, password: val.password, role: val.role });

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false)
    });
  }

  onDeactivate() {
    if (!this.deactivatingId()) return;
    this.service.deactivate(this.deactivatingId()!).subscribe({
      next: () => this.showConfirm.set(false),
      error: () => this.showConfirm.set(false)
    });
  }
}
