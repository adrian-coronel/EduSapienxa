import { Component, inject, OnInit } from '@angular/core';
import { NgFor, NgIf, CurrencyPipe } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, CurrencyPipe, StatCardComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Dashboard" description="Resumen general del chatbot y ventas" />

    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <ng-container *ngIf="svc.loading()">
        <div *ngFor="let _ of [1,2,3,4]" class="h-32 animate-pulse rounded-xl bg-[var(--color-muted)]"></div>
      </ng-container>

      <ng-container *ngIf="!svc.loading() && svc.summary() as s">
        <app-stat-card title="Total Leads" [value]="s.totalLeads" subtitle="Capturados vía WhatsApp"
          iconBgClass="bg-blue-500" [icon]="icons.leads" />
        <app-stat-card title="Inscripciones" [value]="s.totalEnrollments" subtitle="Total registradas"
          iconBgClass="bg-purple-500" [icon]="icons.enrollments" />
        <app-stat-card title="Convertidos" [value]="s.convertedEnrollments" [subtitle]="convRate(s) + '% conversión'"
          iconBgClass="bg-green-500" [icon]="icons.converted" />
        <app-stat-card title="Pagos Pendientes" [value]="s.pendingValidations" subtitle="Esperando validación"
          iconBgClass="bg-amber-500" [icon]="icons.pending" />
      </ng-container>
    </div>

    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Top cursos -->
      <div class="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div class="border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-semibold text-[var(--color-foreground)]">Cursos más inscritos</h2>
        </div>
        <ng-container *ngIf="svc.summary() as s">
          <div class="overflow-x-auto">
            <table class="w-full text-sm">
              <thead class="bg-[var(--color-muted)]">
                <tr>
                  <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Curso</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Inscripciones</th>
                  <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Ingresos</th>
                </tr>
              </thead>
              <tbody class="divide-y divide-[var(--color-border)]">
                <tr *ngFor="let c of s.topCourses" class="hover:bg-[var(--color-muted)] transition-colors">
                  <td class="px-5 py-3 font-medium text-[var(--color-foreground)]">{{ c.title }}</td>
                  <td class="px-5 py-3 text-right text-[var(--color-muted-foreground)]">{{ c.enrollmentCount }}</td>
                  <td class="px-5 py-3 text-right">
                    <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                      {{ c.revenue | currency:'USD':'symbol':'1.2-2' }}
                    </span>
                  </td>
                </tr>
                <tr *ngIf="s.topCourses.length === 0">
                  <td colspan="3" class="px-5 py-8 text-center text-sm text-[var(--color-muted-foreground)]">Sin datos</td>
                </tr>
              </tbody>
            </table>
          </div>
        </ng-container>
      </div>

      <!-- Leads recientes -->
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-semibold text-[var(--color-foreground)]">Últimos leads</h2>
          <a routerLink="/leads" class="text-xs font-medium text-[oklch(45%_0.2_260)] hover:underline">Ver todos</a>
        </div>
        <ng-container *ngIf="svc.summary() as s">
          <ul class="divide-y divide-[var(--color-border)]">
            <li *ngFor="let lead of s.recentLeads" class="flex items-center gap-3 px-5 py-3">
              <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[oklch(45%_0.2_260)]/10 text-sm font-semibold text-[oklch(45%_0.2_260)]">
                {{ (lead.name || lead.phoneNumber).charAt(0).toUpperCase() }}
              </div>
              <div class="min-w-0 flex-1">
                <p class="truncate text-sm font-medium text-[var(--color-foreground)]">{{ lead.name || 'Sin nombre' }}</p>
                <p class="text-xs text-[var(--color-muted-foreground)]">{{ lead.phoneNumber }}</p>
              </div>
              <span class="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700">{{ lead.status }}</span>
            </li>
            <li *ngIf="s.recentLeads.length === 0" class="px-5 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
              Sin leads recientes
            </li>
          </ul>
        </ng-container>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  svc = inject(DashboardService);

  icons = {
    leads:       `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    enrollments: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/></svg>`,
    converted:   `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    pending:     `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`
  };

  ngOnInit() {
    this.svc.loadSummary();
  }

  convRate(s: any): number {
    if (!s.totalEnrollments) return 0;
    return Math.round((s.convertedEnrollments / s.totalEnrollments) * 100);
  }
}
