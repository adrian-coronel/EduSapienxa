import { Component, Input } from '@angular/core';
import { NgClass, NgIf } from '@angular/common';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

@Component({
  selector: 'app-stat-card',
  standalone: true,
  imports: [NgClass, NgIf, SafeHtmlPipe],
  template: `
    <div class="rounded-2xl border border-[var(--color-border)]
                bg-[var(--color-card)] p-5 md:p-6
                shadow-[var(--shadow-card)]
                hover:shadow-[var(--shadow-md)] transition-shadow duration-200">

      <div class="flex items-start justify-between gap-4">

        <!-- Text side -->
        <div class="flex-1 min-w-0">
          <p class="text-sm font-medium text-[var(--color-muted-foreground)] truncate leading-none">
            {{ title }}
          </p>
          <p class="mt-3 text-[2rem] font-bold tracking-tight text-[var(--color-foreground)] leading-none">
            {{ value }}
          </p>

          <!-- Trend badge -->
          <div *ngIf="change !== undefined" class="mt-3 flex items-center gap-2">
            <span
              class="inline-flex items-center gap-0.5 rounded-full px-2 py-0.5 text-xs font-semibold"
              [ngClass]="(change || 0) >= 0
                ? 'bg-[var(--color-success-light)] text-[var(--color-success-dark)]'
                : 'bg-[var(--color-danger-light)]  text-[var(--color-danger-dark)]'"
            >
              <!-- Up arrow -->
              <svg *ngIf="(change || 0) >= 0"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   class="h-3 w-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M5 15l7-7 7 7"/>
              </svg>
              <!-- Down arrow -->
              <svg *ngIf="(change || 0) < 0"
                   viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                   class="h-3 w-3">
                <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
              </svg>
              {{ Math.abs(change || 0) }}%
            </span>
            <span class="text-xs text-[var(--color-muted-foreground)]">vs mes anterior</span>
          </div>

          <p *ngIf="subtitle && change === undefined"
             class="mt-2 text-xs text-[var(--color-muted-foreground)]">
            {{ subtitle }}
          </p>
        </div>

        <!-- Icon container -->
        <div
          *ngIf="icon"
          [ngClass]="iconBgClass"
          class="flex h-[52px] w-[52px] flex-shrink-0 items-center justify-center
                 rounded-[var(--radius-md)]"
        >
          <span class="icon-wrap h-6 w-6 text-white" [innerHTML]="icon | safeHtml"></span>
        </div>
      </div>
    </div>
  `
})
export class StatCardComponent {
  @Input() title = '';
  @Input() value: string | number = '';
  @Input() subtitle = '';
  @Input() icon = '';
  @Input() iconBgClass = 'bg-[var(--color-primary)]';
  @Input() change?: number;

  Math = Math;
}
