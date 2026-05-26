import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { PaymentValidationService } from '../../core/services/payment-validation.service';
import { PaymentMethodService } from '../../core/services/payment-method.service';
import { PaymentValidation } from '../../core/models/payment-validation.model';
import { PaymentMethod } from '../../core/models/payment-method.model';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

const VAL_STATUS_COLORS: Record<string, string> = {
  'Pendiente': 'bg-yellow-50 text-yellow-700',
  'Aprobado':  'bg-green-50 text-green-700',
  'Inválido':  'bg-red-50 text-red-700',
  'Expirado':  'bg-gray-100 text-gray-600'
};

@Component({
  selector: 'app-payments',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Pagos" description="Validaciones de pago y métodos de pago"></app-page-header>

    <div class="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-1 w-fit">
      <button (click)="tab.set('validations')" [class]="tab() === 'validations' ? 'tab-active' : 'tab'">Validaciones</button>
      <button (click)="tab.set('methods')" [class]="tab() === 'methods' ? 'tab-active' : 'tab'">Métodos de Pago</button>
    </div>

    <!-- Validaciones -->
    <div *ngIf="tab() === 'validations'">
      <app-data-table [columns]="valColumns" [data]="validationService.validations()" [loading]="validationService.loading()" />
    </div>

    <!-- Métodos de Pago -->
    <div *ngIf="tab() === 'methods'">
      <div class="mb-4 flex justify-end">
        <button (click)="openCreateMethod()" class="btn-primary">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
            <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
          </svg>
          Nuevo método
        </button>
      </div>
      <app-data-table [columns]="methodColumns" [data]="methodService.methods()" [loading]="methodService.loading()" />
    </div>

    <!-- Modal método de pago -->
    <div *ngIf="showMethodModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeMethodModal()"></div>
      <div class="relative w-full max-w-md rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingMethodId() ? 'Editar método' : 'Nuevo método de pago' }}
        </h3>
        <form [formGroup]="methodForm" (ngSubmit)="onSubmitMethod()" class="space-y-4">
          <div>
            <label class="form-label">Nombre *</label>
            <input formControlName="name" type="text" class="form-input" />
          </div>
          <div>
            <label class="form-label">Descripción</label>
            <textarea formControlName="description" rows="2" class="form-input resize-none"></textarea>
          </div>
          <div>
            <label class="form-label">Límite de monto</label>
            <input formControlName="limitAmount" type="number" min="0" class="form-input" />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeMethodModal()" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" [disabled]="savingMethod()" class="btn-primary flex-1">
              {{ savingMethod() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .tab { @apply rounded-md px-4 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors; }
    .tab-active { @apply rounded-md bg-[var(--color-card)] px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm; }
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
  `]
})
export class PaymentsComponent implements OnInit {
  validationService = inject(PaymentValidationService);
  methodService = inject(PaymentMethodService);
  private fb = inject(FormBuilder);

  tab = signal<'validations' | 'methods'>('validations');
  showMethodModal = signal(false);
  editingMethodId = signal<string | null>(null);
  savingMethod = signal(false);

  methodForm = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    image: [''],
    limitAmount: [0]
  });

  valColumns: TableColumn<PaymentValidation>[] = [
    {
      key: 'status', label: 'Estado',
      template: (row) => {
        const cls = VAL_STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600';
        return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}">${row.status}</span>`;
      }
    },
    { key: 'requestedBy', label: 'Solicitado por' },
    { key: 'voucherDetail', label: 'Detalle voucher' },
    {
      key: 'voucherUrl', label: 'Voucher',
      template: (row) => row.voucherUrl
        ? `<a href="${row.voucherUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">Ver imagen</a>`
        : '<span class="text-gray-400">—</span>'
    },
    {
      key: 'requestedAt', label: 'Fecha solicitud',
      template: (row) => `<span>${new Date(row.requestedAt).toLocaleDateString('es')}</span>`
    },
    { key: 'resolvedBy', label: 'Resuelto por' }
  ];

  methodColumns: TableColumn<PaymentMethod>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'limitAmount', label: 'Límite',
      template: (row) => `<span>$${row.limitAmount.toFixed(2)}</span>`
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__editMethod('${row.id}')`, 'Editar', 'edit', 'primary')}
        ${tableActionIconButton(`window.__deleteMethod('${row.id}')`, 'Eliminar', 'delete', 'danger')}
      </div>`
    }
  ];

  ngOnInit() {
    this.validationService.loadAll();
    this.methodService.loadAll();
    (window as any).__editMethod = (id: string) => this.openEditMethod(id);
    (window as any).__deleteMethod = (id: string) => this.deleteMethod(id);
  }

  openCreateMethod() { this.editingMethodId.set(null); this.methodForm.reset({ limitAmount: 0 }); this.showMethodModal.set(true); }

  openEditMethod(id: string) {
    const m = this.methodService.methods().find(x => x.id === id);
    if (!m) return;
    this.editingMethodId.set(id);
    this.methodForm.patchValue({ name: m.name, description: m.description ?? '', limitAmount: m.limitAmount });
    this.showMethodModal.set(true);
  }

  closeMethodModal() { this.showMethodModal.set(false); this.editingMethodId.set(null); }

  onSubmitMethod() {
    if (this.methodForm.invalid) { this.methodForm.markAllAsTouched(); return; }
    this.savingMethod.set(true);
    const val = this.methodForm.value as any;
    const dto = { name: val.name, description: val.description || undefined, image: val.image || undefined, limitAmount: val.limitAmount ?? 0 };
    const obs = this.editingMethodId()
      ? this.methodService.update(this.editingMethodId()!, dto)
      : this.methodService.create(dto);
    obs.subscribe({ next: () => { this.savingMethod.set(false); this.closeMethodModal(); }, error: () => this.savingMethod.set(false) });
  }

  deleteMethod(id: string) {
    if (!confirm('¿Eliminar este método de pago?')) return;
    this.methodService.delete(id).subscribe();
  }
}
