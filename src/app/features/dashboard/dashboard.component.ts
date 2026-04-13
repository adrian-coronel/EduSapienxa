import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { RouterLink } from '@angular/router';
import { DashboardService } from '../../core/services/dashboard.service';
import { LeadService } from '../../core/services/lead.service';
import { CourseService } from '../../core/services/course.service';
import { StatCardComponent } from '../../shared/components/stat-card/stat-card.component';
import { BadgeStatusComponent } from '../../shared/components/badge-status/badge-status.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { TopCourse } from '../../core/models/dashboard.model';
import { Lead } from '../../core/models/lead.model';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [NgFor, NgIf, RouterLink, StatCardComponent, BadgeStatusComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Dashboard" description="Resumen general de la plataforma" />

    <!-- Stat cards -->
    <div class="grid grid-cols-1 gap-4 sm:grid-cols-2 xl:grid-cols-4">
      <!-- Skeleton -->
      <ng-container *ngIf="dashboardService.loading()">
        <div *ngFor="let _ of [1,2,3,4]" class="h-32 animate-pulse rounded-xl bg-[var(--color-muted)]"></div>
      </ng-container>

      <ng-container *ngIf="!dashboardService.loading() && dashboardService.summary() as summary">
        <app-stat-card
          title="Total Leads"
          [value]="summary.totalLeads"
          subtitle="Leads registrados"
          iconBgClass="bg-blue-500"
          [icon]="icons.leads"
        />
        <app-stat-card
          title="Leads Convertidos"
          [value]="summary.convertedLeads"
          [subtitle]="conversionRate(summary) + '% tasa de conversión'"
          iconBgClass="bg-green-500"
          [icon]="icons.converted"
        />
        <app-stat-card
          title="Total Cursos"
          [value]="courseService.courses().length"
          subtitle="Cursos disponibles"
          iconBgClass="bg-purple-500"
          [icon]="icons.courses"
        />
        <app-stat-card
          title="Compras del Mes"
          [value]="summary.totalPurchases"
          subtitle="Este mes"
          iconBgClass="bg-amber-500"
          [icon]="icons.purchases"
        />
      </ng-container>
    </div>

    <!-- Content grid -->
    <div class="mt-6 grid grid-cols-1 gap-6 lg:grid-cols-3">
      <!-- Top courses table -->
      <div class="lg:col-span-2 rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div class="border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-semibold text-[var(--color-foreground)]">Cursos más populares</h2>
        </div>
        <div *ngIf="loadingCourses()" class="p-5 space-y-3">
          <div *ngFor="let _ of [1,2,3,4,5]" class="h-8 animate-pulse rounded bg-[var(--color-muted)]"></div>
        </div>
        <div *ngIf="!loadingCourses()" class="overflow-x-auto">
          <table class="w-full text-sm">
            <thead class="bg-[var(--color-muted)]">
              <tr>
                <th class="px-5 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Curso</th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Consultas</th>
                <th class="px-5 py-3 text-right text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]">Compras</th>
              </tr>
            </thead>
            <tbody class="divide-y divide-[var(--color-border)]">
              <tr *ngFor="let course of topCourses()" class="hover:bg-[var(--color-muted)] transition-colors">
                <td class="px-5 py-3 font-medium text-[var(--color-foreground)]">{{ course.courseName }}</td>
                <td class="px-5 py-3 text-right text-[var(--color-muted-foreground)]">{{ course.interestCount }}</td>
                <td class="px-5 py-3 text-right">
                  <span class="inline-flex items-center rounded-full bg-green-50 px-2 py-0.5 text-xs font-medium text-green-700">
                    {{ course.purchaseCount }}
                  </span>
                </td>
              </tr>
              <tr *ngIf="topCourses().length === 0">
                <td colspan="3" class="px-5 py-8 text-center text-sm text-[var(--color-muted-foreground)]">Sin datos disponibles</td>
              </tr>
            </tbody>
          </table>
        </div>
      </div>

      <!-- Recent leads -->
      <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-5 py-4">
          <h2 class="font-semibold text-[var(--color-foreground)]">Últimos leads</h2>
          <a routerLink="/leads" class="text-xs font-medium text-[oklch(45%_0.2_260)] hover:underline">Ver todos</a>
        </div>
        <div *ngIf="leadService.loading()" class="p-5 space-y-3">
          <div *ngFor="let _ of [1,2,3,4,5]" class="h-12 animate-pulse rounded bg-[var(--color-muted)]"></div>
        </div>
        <ul *ngIf="!leadService.loading()" class="divide-y divide-[var(--color-border)]">
          <li *ngFor="let lead of recentLeads()" class="flex items-center gap-3 px-5 py-3">
            <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-full bg-[oklch(45%_0.2_260)]/10 text-sm font-semibold text-[oklch(45%_0.2_260)]">
              {{ lead.name.charAt(0).toUpperCase() }}
            </div>
            <div class="min-w-0 flex-1">
              <p class="truncate text-sm font-medium text-[var(--color-foreground)]">{{ lead.name }}</p>
              <p class="text-xs text-[var(--color-muted-foreground)]">{{ lead.phone }}</p>
            </div>
            <app-badge-status [status]="lead.status" />
          </li>
          <li *ngIf="recentLeads().length === 0" class="px-5 py-8 text-center text-sm text-[var(--color-muted-foreground)]">
            Sin leads recientes
          </li>
        </ul>
      </div>
    </div>
  `
})
export class DashboardComponent implements OnInit {
  dashboardService = inject(DashboardService);
  leadService = inject(LeadService);
  courseService = inject(CourseService);

  topCourses = signal<TopCourse[]>([]);
  loadingCourses = signal(false);

  recentLeads = signal<Lead[]>([]);

  icons = {
    leads: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`,
    converted: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/></svg>`,
    courses: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`,
    purchases: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
  };

  ngOnInit() {
    this.dashboardService.loadSummary();
    this.courseService.loadAll();
    this.loadingCourses.set(true);
    this.dashboardService.loadTopCourses().subscribe({
      next: data => { this.topCourses.set(data); this.loadingCourses.set(false); },
      error: () => this.loadingCourses.set(false)
    });
    this.leadService.loadAll();
    // Keep last 5 leads as recent
    setTimeout(() => {
      this.recentLeads.set(this.leadService.leads().slice(0, 5));
    }, 1000);
  }

  conversionRate(summary: any): number {
    if (!summary.totalLeads) return 0;
    return Math.round((summary.convertedLeads / summary.totalLeads) * 100);
  }
}
