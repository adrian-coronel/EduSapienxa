import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf],
  template: `
    <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
      <div class="flex items-start justify-between">
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-[var(--color-muted-foreground)] truncate">{{ title }}</p>
          <p class="mt-2 text-3xl font-bold tracking-tight text-[var(--color-foreground)]">{{ value }}</p>
          <p *ngIf="subtitle" class="mt-1 text-xs text-[var(--color-muted-foreground)]">{{ subtitle }}</p>
        </div>
        <div
          *ngIf="icon"
          [ngClass]="iconBgClass"
          class="flex h-11 w-11 flex-shrink-0 items-center justify-center rounded-lg"
        >
          <span class="h-6 w-6 text-white" [innerHTML]="icon"></span>
        </div>
      </div>
      <div *ngIf="change !== undefined" class="mt-3 flex items-center gap-1.5">
        <span
          [ngClass]="(change || 0) >= 0 ? 'text-green-600 bg-green-50' : 'text-red-600 bg-red-50'"
          class="inline-flex items-center gap-0.5 rounded px-1.5 py-0.5 text-xs font-semibold"
        >
          <svg *ngIf="(change || 0) >= 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3 w-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
          </svg>
          <svg *ngIf="(change || 0) < 0" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" class="h-3 w-3">
            <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
          </svg>
          {{ Math.abs(change || 0) }}%
        </span>
        <span class="text-xs text-[var(--color-muted-foreground)]">vs mes anterior</span>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconBgClass = 'bg-[oklch(45%_0.2_260)]';
  @Input() change?: number;

  Math = Math;
}
