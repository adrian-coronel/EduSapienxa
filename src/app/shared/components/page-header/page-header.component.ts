import { Component, Input } from '@angular/core';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-page-header',
  standalone: true,
  imports: [NgIf],
  template: `
    <div class="mb-6 flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between">
      <div>
        <h1 class="text-2xl font-bold tracking-tight text-[var(--color-foreground)]">{{ title }}</h1>
        <p *ngIf="description" class="mt-1 text-sm text-[var(--color-muted-foreground)]">{{ description }}</p>
      </div>
      <div class="flex-shrink-0 flex flex-col sm:flex-row w-full sm:w-auto">
        <ng-content />
      </div>
    </div>
  `
})
export class PageHeaderComponent {
  @Input() title = '';
  @Input() description = '';
}
