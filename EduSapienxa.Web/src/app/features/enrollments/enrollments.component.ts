import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { EnrollmentService } from '../../core/services/enrollment.service';
import { Enrollment } from '../../core/models/enrollment.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

const STATUS_COLORS: Record<string, string> = {
  'Interesado':       'bg-blue-50 text-blue-700',
  'Pendiente Pago':   'bg-yellow-50 text-yellow-700',
  'Pagado':           'bg-green-50 text-green-700',
  'Escalado a Humano':'bg-orange-50 text-orange-700',
  'Inactivo':         'bg-gray-100 text-gray-600'
};

@Component({
  selector: 'app-enrollments',
  standalone: true,
  imports: [NgFor, NgIf, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Inscripciones" description="Gestión de inscripciones y su estado"></app-page-header>

    <div class="mb-4 flex gap-2 flex-wrap">
      <button *ngFor="let s of statuses" (click)="filterStatus.set(s === filterStatus() ? '' : s)"
        [class]="filterStatus() === s ? 'btn-filter-active' : 'btn-filter'">
        {{ s || 'Todos' }}
      </button>
    </div>

    <app-data-table [columns]="columns" [data]="service.enrollments()" [loading]="service.loading()" />

    <div *ngIf="changingStatusFor()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="changingStatusFor.set(null)"></div>
      <div class="relative w-full max-w-sm rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-4 text-base font-semibold text-[var(--color-foreground)]">Cambiar estado</h3>
        <div class="space-y-2">
          <button *ngFor="let s of allowedNext()" (click)="applyStatus(s)"
            class="w-full rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm text-left hover:bg-[var(--color-muted)] transition-colors">
            {{ s }}
          </button>
        </div>
        <button (click)="changingStatusFor.set(null)" class="mt-4 w-full btn-secondary">Cancelar</button>
      </div>
    </div>
  `,
  styles: [`
    .btn-filter { @apply rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .btn-filter-active { @apply rounded-full bg-[oklch(45%_0.2_260)] px-3 py-1 text-xs font-medium text-white; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
  `]
})
export class EnrollmentsComponent implements OnInit {
  service = inject(EnrollmentService);

  statuses = ['', 'Interesado', 'Pendiente Pago', 'Pagado', 'Escalado a Humano', 'Inactivo'];
  filterStatus = signal('');
  changingStatusFor = signal<Enrollment | null>(null);

  private readonly transitions: Record<string, string[]> = {
    'Interesado':        ['Pendiente Pago', 'Escalado a Humano', 'Inactivo'],
    'Pendiente Pago':    ['Pagado', 'Escalado a Humano', 'Inactivo'],
    'Pagado':            [],
    'Escalado a Humano': ['Inactivo'],
    'Inactivo':          []
  };

  allowedNext() {
    const e = this.changingStatusFor();
    return e ? (this.transitions[e.status] ?? []) : [];
  }

  columns: TableColumn<Enrollment>[] = [
    { key: 'leadName', label: 'Lead' },
    { key: 'leadPhone', label: 'Teléfono' },
    { key: 'courseTitle', label: 'Curso' },
    {
      key: 'status', label: 'Estado',
      template: (row) => {
        const cls = STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600';
        return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}">${row.status}</span>`;
      }
    },
    {
      key: 'totalCost', label: 'Monto',
      template: (row) => row.totalCost ? `<span>$${row.totalCost.toFixed(2)}</span>` : '<span class="text-gray-400">—</span>'
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__changeEnrollmentStatus('${row.id}')`, 'Cambiar estado', 'edit', 'primary')}
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__changeEnrollmentStatus = (id: string) => {
      const e = this.service.enrollments().find(x => x.id === id);
      if (e) this.changingStatusFor.set(e);
    };
  }

  applyStatus(status: string) {
    const e = this.changingStatusFor();
    if (!e) return;
    this.service.updateStatus(e.id, status).subscribe({
      next: () => this.changingStatusFor.set(null)
    });
  }
}
