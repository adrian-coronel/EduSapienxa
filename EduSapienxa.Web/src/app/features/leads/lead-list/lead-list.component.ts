import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor } from '@angular/common';
import { Router } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { Lead } from '../../../core/models/lead.model';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../../shared/utils/table-action-icons';

const STATUS_COLORS: Record<string, string> = {
  'New':              'bg-blue-50 text-blue-700',
  'Interesado':       'bg-yellow-50 text-yellow-700',
  'EscaladoAHumano':  'bg-orange-50 text-orange-700'
};

@Component({
  selector: 'app-lead-list',
  standalone: true,
  imports: [NgFor, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Leads" description="Prospectos capturados por el chatbot de WhatsApp"></app-page-header>

    <div class="mb-5 flex flex-wrap gap-2">
      <button *ngFor="let f of filters" (click)="applyFilter(f.value)"
        [class]="activeFilter() === f.value ? 'filter-active' : 'filter'">
        {{ f.label }}
      </button>
    </div>

    <app-data-table [columns]="columns" [data]="service.leads()" [loading]="service.loading()" />
  `,
  styles: [`
    .filter { @apply rounded-full border border-[var(--color-border)] px-3 py-1 text-xs font-medium text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .filter-active { @apply rounded-full bg-[oklch(45%_0.2_260)] px-3 py-1 text-xs font-medium text-white; }
  `]
})
export class LeadListComponent implements OnInit {
  service = inject(LeadService);
  private router = inject(Router);

  activeFilter = signal('');

  filters = [
    { label: 'Todos', value: '' },
    { label: 'Nuevos', value: 'New' },
    { label: 'Interesados', value: 'Interesado' },
    { label: 'Escalados', value: 'EscaladoAHumano' }
  ];

  columns: TableColumn<Lead>[] = [
    {
      key: 'name', label: 'Nombre',
      template: (row) => `<span>${row.name || '<span class="text-gray-400">Sin nombre</span>'}</span>`
    },
    { key: 'phoneNumber', label: 'Teléfono' },
    { key: 'email', label: 'Email' },
    { key: 'contactMethod', label: 'Canal' },
    {
      key: 'status', label: 'Estado',
      template: (row) => {
        const cls = STATUS_COLORS[row.status] ?? 'bg-gray-100 text-gray-600';
        return `<span class="inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ${cls}">${row.status}</span>`;
      }
    },
    { key: 'salesAgentName', label: 'Agente' },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__viewLead('${row.id}')`, 'Ver detalle', 'view', 'primary')}
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__viewLead = (id: string) => this.router.navigate(['/leads', id]);
  }

  applyFilter(status: string) {
    this.activeFilter.set(status);
    this.service.loadAll(status || undefined);
  }
}
