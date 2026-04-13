import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule, FormsModule } from '@angular/forms';
import { PurchaseService } from '../../core/services/purchase.service';
import { LeadService } from '../../core/services/lead.service';
import { CourseService } from '../../core/services/course.service';
import { Purchase } from '../../core/models/purchase.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-purchases',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, FormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Compras" description="Historial global de compras">
      <button (click)="showModal.set(true)" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Registrar compra
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.purchases()" [loading]="service.loading()" />

    <!-- Create purchase modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="showModal.set(false)"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">Registrar compra manual</h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <!-- Lead search -->
          <div>
            <label class="form-label">Lead</label>
            <div class="relative">
              <input
                [(ngModel)]="leadSearch"
                type="text"
                class="form-input"
                placeholder="Buscar por nombre o teléfono..."
                (input)="filterLeads()"
              />
              <div *ngIf="filteredLeads().length && leadSearch" class="absolute z-10 mt-1 w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-card)] shadow-lg max-h-40 overflow-y-auto">
                <button
                  *ngFor="let lead of filteredLeads()"
                  type="button"
                  (click)="selectLead(lead.id, lead.name)"
                  class="flex w-full items-center justify-between px-3 py-2 text-sm hover:bg-[var(--color-muted)] transition-colors"
                >
                  <span class="text-[var(--color-foreground)]">{{ lead.name }}</span>
                  <span class="text-xs text-[var(--color-muted-foreground)]">{{ lead.phone }}</span>
                </button>
              </div>
            </div>
            <input formControlName="leadId" type="hidden" />
            <p *ngIf="isInvalid('leadId')" class="form-error">Selecciona un lead.</p>
          </div>

          <!-- Course selector -->
          <div>
            <label class="form-label">Curso</label>
            <select formControlName="courseId" class="form-input">
              <option value="" disabled>Selecciona un curso</option>
              <option *ngFor="let c of courseService.courses()" [value]="c.id">{{ c.name }}</option>
            </select>
            <p *ngIf="isInvalid('courseId')" class="form-error">Selecciona un curso.</p>
          </div>

          <!-- Amount -->
          <div>
            <label class="form-label">Monto pagado</label>
            <input formControlName="amountPaid" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
            <p *ngIf="isInvalid('amountPaid')" class="form-error">Ingresa un monto válido.</p>
          </div>

          <!-- Notes -->
          <div>
            <label class="form-label">Notas (opcional)</label>
            <textarea formControlName="notes" rows="2" class="form-input resize-none" placeholder="Información adicional..."></textarea>
          </div>

          <div class="flex gap-3 pt-2">
            <button type="button" (click)="showModal.set(false)" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Guardando...' : 'Registrar' }}
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
export class PurchasesComponent implements OnInit {
  service = inject(PurchaseService);
  leadService = inject(LeadService);
  courseService = inject(CourseService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  saving = signal(false);
  leadSearch = '';
  filteredLeads = signal<any[]>([]);

  form = this.fb.group({
    leadId: [null as number | null, Validators.required],
    courseId: [null as number | null, Validators.required],
    amountPaid: [0, [Validators.required, Validators.min(0)]],
    notes: ['']
  });

  columns: TableColumn<Purchase>[] = [
    { key: 'leadName', label: 'Lead' },
    { key: 'courseName', label: 'Curso' },
    {
      key: 'amountPaid', label: 'Monto',
      template: (row) => `<span class="font-semibold text-green-600">$${row.amountPaid.toFixed(2)}</span>`
    },
    {
      key: 'purchaseDate', label: 'Fecha',
      template: (row) => new Date(row.purchaseDate).toLocaleDateString('es-MX')
    },
    { key: 'registeredBy', label: 'Registrado por' }
  ];

  ngOnInit() {
    this.service.loadAll();
    this.leadService.loadAll();
    this.courseService.loadAll();
  }

  filterLeads() {
    const q = this.leadSearch.toLowerCase();
    if (!q) { this.filteredLeads.set([]); return; }
    this.filteredLeads.set(
      this.leadService.leads().filter(l =>
        l.name.toLowerCase().includes(q) || (l.phone ?? l.whatsAppId ?? '').toLowerCase().includes(q)
      ).slice(0, 5)
    );
  }

  selectLead(id: number, name: string) {
    this.form.patchValue({ leadId: id });
    this.leadSearch = name;
    this.filteredLeads.set([]);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    this.service.create(this.form.value as any).subscribe({
      next: () => {
        this.saving.set(false);
        this.showModal.set(false);
        this.form.reset();
        this.leadSearch = '';
      },
      error: () => this.saving.set(false)
    });
  }
}
