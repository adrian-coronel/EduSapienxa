import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { Lead, LeadStatus } from '../../../core/models/lead.model';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Leads" description="Gestiona los prospectos del negocio">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo lead
      </button>
    </app-page-header>

    <!-- Status filter -->
    <div class="mb-5 flex flex-wrap gap-2">
      <button
        *ngFor="let f of filters"
        (click)="applyFilter(f.value)"
        [class]="activeFilter() === f.value ? 'filter-active' : 'filter'"
      >
        {{ f.label }}
      </button>
    </div>

    <app-data-table [columns]="columns" [data]="service.leads()" [loading]="service.loading()" />

    <!-- Create modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">Nuevo lead</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre</label>
            <input formControlName="name" type="text" class="form-input" placeholder="Nombre completo" />
            <p *ngIf="isInvalid('name')" class="form-error">El nombre es requerido.</p>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Teléfono / WhatsApp</label>
              <input formControlName="phone" type="tel" class="form-input" placeholder="+52 1 55 0000 0000" />
              <p *ngIf="isInvalid('phone')" class="form-error">El teléfono es requerido.</p>
            </div>
            <div>
              <label class="form-label">Email (opcional)</label>
              <input formControlName="email" type="email" class="form-input" placeholder="correo@empresa.com" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Estado</label>
              <select formControlName="status" class="form-input">
                <option value="nuevo">Nuevo</option>
                <option value="en_conversacion">En conversación</option>
                <option value="convertido">Convertido</option>
                <option value="inactivo">Inactivo</option>
              </select>
            </div>
            <div>
              <label class="form-label">Fuente</label>
              <select formControlName="source" class="form-input">
                <option value="manual">Manual</option>
                <option value="whatsapp">WhatsApp</option>
              </select>
            </div>
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeModal()" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Guardando...' : 'Crear lead' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .filter { @apply rounded-full border border-[var(--color-border)] px-3.5 py-1 text-xs font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .filter-active { @apply rounded-full border border-[oklch(45%_0.2_260)] bg-[oklch(45%_0.2_260)]/10 px-3.5 py-1 text-xs font-medium text-[oklch(45%_0.2_260)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class LeadListComponent implements OnInit {
  service = inject(LeadService);
  private fb = inject(FormBuilder);
  private router = inject(Router);

  showModal = signal(false);
  saving = signal(false);
  activeFilter = signal<LeadStatus | undefined>(undefined);

  filters = [
    { label: 'Todos', value: undefined as LeadStatus | undefined },
    { label: 'Nuevos', value: 'nuevo' as LeadStatus },
    { label: 'En conversación', value: 'en_conversacion' as LeadStatus },
    { label: 'Convertidos', value: 'convertido' as LeadStatus },
    { label: 'Inactivos', value: 'inactivo' as LeadStatus }
  ];

  form = this.fb.group({
    name: ['', Validators.required],
    phone: ['', Validators.required],
    email: [''],
    status: ['nuevo' as LeadStatus],
    source: ['manual']
  });

  columns: TableColumn<Lead>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'phone', label: 'Teléfono' },
    {
      key: 'source', label: 'Fuente',
      template: (row) => `<span class="${row.source === 'whatsapp' ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700' : 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'}">${row.source === 'whatsapp' ? '💬 WhatsApp' : '✏️ Manual'}</span>`
    },
    {
      key: 'status', label: 'Estado',
      template: (row) => {
        const classes: Record<string, string> = {
          nuevo: 'bg-blue-50 text-blue-700',
          en_conversacion: 'bg-amber-50 text-amber-700',
          convertido: 'bg-green-50 text-green-700',
          inactivo: 'bg-gray-100 text-gray-600'
        };
        const labels: Record<string, string> = {
          nuevo: 'Nuevo', en_conversacion: 'En conversación', convertido: 'Convertido', inactivo: 'Inactivo'
        };
        return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${classes[row.status] ?? ''}">${labels[row.status] ?? row.status}</span>`;
      }
    },
    {
      key: 'lastInteraction', label: 'Última interacción',
      template: (row) => row.lastInteraction ? new Date(row.lastInteraction).toLocaleDateString('es-MX') : '—'
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<button onclick="window.__viewLead(${row.id})" class="text-xs text-blue-600 hover:underline">Ver detalle</button>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__viewLead = (id: number) => this.router.navigate(['/leads', id]);
  }

  applyFilter(status: LeadStatus | undefined) {
    this.activeFilter.set(status);
    this.service.loadAll(status);
  }

  openCreate() {
    this.form.reset({ status: 'nuevo', source: 'manual' });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.service.create(this.form.value as any).subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false)
    });
  }
}
