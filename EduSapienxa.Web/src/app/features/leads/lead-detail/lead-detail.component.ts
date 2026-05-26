import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { LeadService } from '../../../core/services/lead.service';
import { LeadDetail } from '../../../core/models/lead.model';

const STATUS_COLORS: Record<string, string> = {
  'Interesado':        'bg-blue-50 text-blue-700',
  'Pendiente Pago':    'bg-yellow-50 text-yellow-700',
  'Pagado':            'bg-green-50 text-green-700',
  'Escalado a Humano': 'bg-orange-50 text-orange-700',
  'Inactivo':          'bg-gray-100 text-gray-600'
};

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink],
  template: `
    <div *ngIf="loading()" class="space-y-4">
      <div class="h-10 w-48 animate-pulse rounded-lg bg-[var(--color-muted)]"></div>
      <div class="h-48 animate-pulse rounded-xl bg-[var(--color-muted)]"></div>
    </div>

    <div *ngIf="!loading() && lead()">
      <div class="mb-4">
        <a routerLink="/leads" class="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Volver a Leads
        </a>
      </div>

      <!-- Info card -->
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-6 shadow-sm mb-6">
        <div class="flex items-start justify-between mb-4">
          <div class="flex items-center gap-4">
            <div class="flex h-14 w-14 items-center justify-center rounded-full bg-[oklch(45%_0.2_260)]/10 text-xl font-bold text-[oklch(45%_0.2_260)]">
              {{ (lead()!.name || lead()!.phoneNumber).charAt(0).toUpperCase() }}
            </div>
            <div>
              <h1 class="text-xl font-bold text-[var(--color-foreground)]">{{ lead()!.name || 'Sin nombre' }}</h1>
              <p class="text-sm text-[var(--color-muted-foreground)]">{{ lead()!.phoneNumber }}</p>
            </div>
          </div>
          <span class="inline-flex items-center rounded-full bg-blue-50 px-3 py-1 text-xs font-semibold text-blue-700">
            {{ lead()!.status }}
          </span>
        </div>

        <dl class="grid grid-cols-2 gap-4 sm:grid-cols-4">
          <div>
            <dt class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Email</dt>
            <dd class="mt-1 text-sm text-[var(--color-foreground)]">{{ lead()!.email || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Canal</dt>
            <dd class="mt-1 text-sm text-[var(--color-foreground)]">{{ lead()!.contactMethod || '—' }}</dd>
          </div>
          <div>
            <dt class="text-xs font-medium text-[var(--color-muted-foreground)] uppercase tracking-wide">Agente asignado</dt>
            <dd class="mt-1 text-sm text-[var(--color-foreground)]">{{ lead()!.salesAgent?.agentName || '—' }}</dd>
          </div>
        </dl>
      </div>

      <!-- Inscripciones -->
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div class="border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-semibold text-[var(--color-foreground)]">Inscripciones</h2>
        </div>

        <div *ngIf="lead()!.enrollments?.length === 0" class="px-5 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
          Sin inscripciones registradas
        </div>

        <ul class="divide-y divide-[var(--color-border)]">
          <li *ngFor="let e of lead()!.enrollments" class="px-5 py-4 flex items-center justify-between">
            <div>
              <p class="font-medium text-[var(--color-foreground)]">{{ e.courseTitle || 'Curso desconocido' }}</p>
              <p *ngIf="e.observation" class="mt-0.5 text-xs text-[var(--color-muted-foreground)]">{{ e.observation }}</p>
            </div>
            <div class="flex items-center gap-3">
              <span *ngIf="e.totalCost" class="text-sm font-medium text-[var(--color-foreground)]">&#36;{{ e.totalCost!.toFixed(2) }}</span>
              <span [class]="'inline-flex items-center rounded-full px-2.5 py-0.5 text-xs font-semibold ' + statusColor(e.status)">
                {{ e.status }}
              </span>
              <a *ngIf="e.voucher" [href]="e.voucher" target="_blank" class="text-xs text-blue-600 hover:underline">Ver voucher</a>
            </div>
          </li>
        </ul>
      </div>
    </div>
  `
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leadService = inject(LeadService);

  lead = signal<LeadDetail | null>(null);
  loading = signal(true);

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.leadService.getById(id).subscribe({
      next: data => { this.lead.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  statusColor(status: string): string {
    return STATUS_COLORS[status] ?? 'bg-gray-100 text-gray-600';
  }
}
