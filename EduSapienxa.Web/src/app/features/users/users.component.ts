import { Component, inject, signal, computed, OnInit } from '@angular/core';
import { NgIf, NgFor } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { UserService } from '../../core/services/user.service';
import { CompanyService } from '../../core/services/company.service';
import { AuthService } from '../../core/services/auth.service';
import { AppUser, UserRole } from '../../core/models/user.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-users',
  standalone: true,
  imports: [NgIf, NgFor, ReactiveFormsModule, DataTableComponent, ConfirmModalComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Usuarios" description="Gestiona el equipo de trabajo">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo usuario
      </button>
    </app-page-header>

    <app-data-table [columns]="columns()" [data]="service.users()" [loading]="service.loading()" />

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
              <option *ngIf="auth.isSuperadmin()" value="superadmin">Superadmin</option>
              <option value="admin">Admin</option>
              <option value="editor">Editor</option>
            </select>
          </div>

          <!-- Selector de empresa: solo para superadmin creando admin/editor -->
          <div *ngIf="!editingId() && auth.isSuperadmin() && form.value.role !== 'superadmin'">
            <label class="form-label">Empresa</label>
            <select formControlName="companyId" class="form-input">
              <option value="">— Selecciona una empresa —</option>
              <option *ngFor="let c of companySvc.companies()" [value]="c.id">{{ c.name }}</option>
            </select>
            <p *ngIf="isInvalid('companyId')" class="form-error">La empresa es requerida.</p>
          </div>

          <!-- Display info para admin: empresa fija -->
          <div *ngIf="!editingId() && auth.isAdmin()" class="rounded-lg bg-[var(--color-muted)]/40 px-3 py-2 text-sm text-[var(--color-muted-foreground)]">
            El usuario será asignado a tu empresa: <strong class="text-[var(--color-foreground)]">{{ auth.currentUser()?.companyName }}</strong>
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
  companySvc = inject(CompanyService);
  auth = inject(AuthService);
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
    role: ['editor' as UserRole],
    companyId: ['']
  });

  columns = computed<TableColumn<AppUser>[]>(() => {
    const showCompany = this.auth.isSuperadmin();
    const base: TableColumn<AppUser>[] = [
      { key: 'name', label: 'Nombre' },
      { key: 'email', label: 'Email' },
      {
        key: 'role', label: 'Rol',
        template: (row) => {
          const map: Record<string, { cls: string; label: string }> = {
            superadmin: { cls: 'bg-pink-50 text-pink-700', label: 'Superadmin' },
            admin:      { cls: 'bg-purple-50 text-purple-700', label: 'Admin' },
            editor:     { cls: 'bg-blue-50 text-blue-700', label: 'Editor' }
          };
          const v = map[row.role] ?? { cls: 'bg-gray-100 text-gray-700', label: row.role };
          return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${v.cls}">${v.label}</span>`;
        }
      }
    ];

    if (showCompany) {
      base.push({
        key: 'companyId', label: 'Empresa',
        template: (row) => {
          if (!row.companyId) return `<span class="text-xs text-[var(--color-muted-foreground)]">— global —</span>`;
          const c = this.companySvc.companies().find(x => x.id === row.companyId);
          return c ? c.name : '<span class="text-xs text-[var(--color-muted-foreground)]">(desconocida)</span>';
        }
      });
    }

    base.push(
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
    );

    return base;
  });

  ngOnInit() {
    this.service.loadAll();
    if (this.auth.isSuperadmin()) {
      this.companySvc.loadAll();
    }
    (window as any).__editUser = (id: string) => this.openEdit(id);
    (window as any).__deactivateUser = (id: string) => {
      this.deactivatingId.set(id);
      this.showConfirm.set(true);
    };
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ role: 'editor', companyId: '' });
    this.form.get('password')?.setValidators(Validators.required);
    this.form.get('password')?.updateValueAndValidity();
    this.applyCompanyValidator();
    this.showModal.set(true);
  }

  openEdit(id: string) {
    const user = this.service.users().find(u => u.id === id);
    if (!user) return;
    this.editingId.set(id);
    this.form.patchValue({ ...user, password: '', companyId: user.companyId ?? '' });
    this.form.get('password')?.clearValidators();
    this.form.get('password')?.updateValueAndValidity();
    this.form.get('companyId')?.clearValidators();
    this.form.get('companyId')?.updateValueAndValidity();
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

  private applyCompanyValidator() {
    const companyCtrl = this.form.get('companyId');
    if (!companyCtrl) return;
    const role = this.form.value.role;
    const needsCompany = this.auth.isSuperadmin() && role !== 'superadmin';
    if (needsCompany) {
      companyCtrl.setValidators(Validators.required);
    } else {
      companyCtrl.clearValidators();
    }
    companyCtrl.updateValueAndValidity();
  }

  onSubmit() {
    if (!this.editingId()) this.applyCompanyValidator();
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as any;
    const obs = this.editingId()
      ? this.service.update(this.editingId()!, {
          name: val.name, email: val.email, role: val.role,
          isActive: true, password: val.password || undefined
        })
      : this.service.create({
          name: val.name, email: val.email, password: val.password, role: val.role,
          companyId: val.companyId || null
        });

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
