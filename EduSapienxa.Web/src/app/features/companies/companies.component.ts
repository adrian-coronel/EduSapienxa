import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CompanyService } from '../../core/services/company.service';
import { Company } from '../../core/models/company.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { ToastService } from '../../core/services/toast.service';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-companies',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Empresas" description="Gestiona las empresas registradas en la plataforma">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nueva empresa
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.companies()" [loading]="service.loading()" />

    <!-- Create / Edit modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar empresa' : 'Nueva empresa' }}
        </h3>

        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre</label>
            <input formControlName="name" type="text" class="form-input" placeholder="Ej: Acme Corp" />
            <p *ngIf="isInvalid('name')" class="form-error">El nombre es requerido.</p>
          </div>

          <div *ngIf="!editingId()">
            <label class="form-label">Slug</label>
            <input formControlName="slug" type="text" class="form-input" placeholder="Ej: acme-corp" />
            <p class="mt-1 text-xs text-[var(--color-muted-foreground)]">Solo minúsculas, números y guiones. Ej: <em>mi-empresa</em></p>
            <p *ngIf="isInvalid('slug')" class="form-error">Slug requerido y válido (a-z, 0-9, -).</p>
          </div>

          <div *ngIf="editingId()">
            <label class="form-label">Estado</label>
            <select formControlName="isActive" class="form-input">
              <option [value]="true">Activa</option>
              <option [value]="false">Inactiva</option>
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
  `,
  styles: [`
    .btn-primary  { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary{ @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label   { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input   { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error   { @apply mt-1 text-xs text-red-500; }
  `]
})
export class CompaniesComponent implements OnInit {
  service = inject(CompanyService);
  private fb = inject(FormBuilder);
  private toast = inject(ToastService);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    slug: ['', [Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]],
    isActive: [true]
  });

  columns: TableColumn<Company>[] = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'slug', label: 'Slug',
      template: row => `<code class="rounded bg-[var(--color-muted)] px-1.5 py-0.5 text-xs font-mono">${row.slug}</code>`
    },
    {
      key: 'isActive', label: 'Estado',
      template: row => row.isActive
        ? `<span class="inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700">Activa</span>`
        : `<span class="inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600">Inactiva</span>`
    },
    {
      key: 'createdAt', label: 'Creada',
      template: row => `<span class="text-sm text-[var(--color-muted-foreground)]">${new Date(row.createdAt).toLocaleDateString('es-PE')}</span>`
    },
    {
      key: 'actions', label: 'Acciones',
      template: row => {
        const edit = tableActionIconButton(`window.__editCompany('${row.id}')`, 'Editar empresa', 'edit', 'primary');
        const toggle = row.isActive
          ? tableActionIconButton(`window.__toggleCompany('${row.id}')`, 'Desactivar empresa', 'disable', 'danger')
          : tableActionIconButton(`window.__toggleCompany('${row.id}')`, 'Activar empresa', 'toggle-on', 'success');
        return `<div class="flex items-center gap-1">${edit}${toggle}</div>`;
      }
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__editCompany = (id: string) => this.openEdit(id);
    (window as any).__toggleCompany = (id: string) => {
      const co = this.service.companies().find(c => c.id === id);
      if (!co) return;
      this.service.update(id, { name: co.name, isActive: !co.isActive }).subscribe({
        next: () => this.toast.success(`Empresa ${co.isActive ? 'desactivada' : 'activada'}`),
        error: () => this.toast.error('Error al actualizar la empresa')
      });
    };
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ isActive: true });
    this.form.get('slug')?.setValidators([Validators.required, Validators.pattern(/^[a-z0-9-]+$/)]);
    this.form.get('slug')?.updateValueAndValidity();
    this.showModal.set(true);
  }

  openEdit(id: string) {
    const co = this.service.companies().find(c => c.id === id);
    if (!co) return;
    this.editingId.set(id);
    this.form.patchValue({ name: co.name, isActive: co.isActive });
    this.form.get('slug')?.clearValidators();
    this.form.get('slug')?.updateValueAndValidity();
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
      ? this.service.update(this.editingId()!, { name: val.name, isActive: val.isActive === true || val.isActive === 'true' })
      : this.service.create({ name: val.name, slug: val.slug });

    obs.subscribe({
      next: () => {
        this.toast.success(this.editingId() ? 'Empresa actualizada' : 'Empresa creada');
        this.saving.set(false);
        this.closeModal();
      },
      error: err => {
        this.toast.error(err?.error?.message ?? 'Error al guardar la empresa');
        this.saving.set(false);
      }
    });
  }
}
