import { Component, Input, signal, computed, OnChanges } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormsModule } from '@angular/forms';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  template?: (row: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, FormsModule],
  template: `
    <div class="overflow-hidden rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] shadow-sm">
      <!-- Header: search + actions -->
      <div class="flex flex-col gap-3 border-b border-[var(--color-border)] px-4 py-3 sm:flex-row sm:items-center sm:justify-between">
        <div class="relative">
          <svg class="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-[var(--color-muted-foreground)]" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/><path stroke-linecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            type="text"
            placeholder="Buscar..."
            class="h-9 w-64 rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] pl-9 pr-3 text-sm text-[var(--color-foreground)] placeholder:text-[var(--color-muted-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)] focus:border-transparent"
          />
        </div>
        <div class="flex items-center gap-2">
          <ng-content select="[slot=actions]" />
        </div>
      </div>

      <!-- Loading skeletons -->
      <div *ngIf="loading" class="divide-y divide-[var(--color-border)]">
        <div *ngFor="let _ of [1,2,3,4,5]" class="flex gap-4 px-4 py-3">
          <div *ngFor="let col of columns" class="h-4 flex-1 animate-pulse rounded bg-[var(--color-muted)]"></div>
        </div>
      </div>

      <!-- Table -->
      <div *ngIf="!loading" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead class="bg-[var(--color-muted)]">
            <tr>
              <th
                *ngFor="let col of columns"
                class="px-4 py-3 text-left text-xs font-semibold uppercase tracking-wider text-[var(--color-muted-foreground)]"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border)]">
            <tr *ngIf="paginatedData().length === 0">
              <td [attr.colspan]="columns.length" class="px-4 py-12 text-center text-sm text-[var(--color-muted-foreground)]">
                No hay registros.
              </td>
            </tr>
            <tr
              *ngFor="let row of paginatedData()"
              class="hover:bg-[var(--color-muted)] transition-colors"
            >
              <td *ngFor="let col of columns" class="px-4 py-3 text-[var(--color-foreground)]">
                <ng-container *ngIf="col.template; else plain">
                  <span [innerHTML]="col.template(row)"></span>
                </ng-container>
                <ng-template #plain>{{ row[col.key] ?? '—' }}</ng-template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- Pagination -->
      <div *ngIf="!loading && filteredData().length > pageSize" class="flex items-center justify-between border-t border-[var(--color-border)] px-4 py-3">
        <p class="text-sm text-[var(--color-muted-foreground)]">
          {{ (currentPage - 1) * pageSize + 1 }}–{{ Math.min(currentPage * pageSize, filteredData().length) }} de {{ filteredData().length }}
        </p>
        <div class="flex gap-1">
          <button
            (click)="currentPage = currentPage - 1"
            [disabled]="currentPage === 1"
            class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>
          <button
            (click)="currentPage = currentPage + 1"
            [disabled]="currentPage * pageSize >= filteredData().length"
            class="flex h-8 w-8 items-center justify-center rounded-md text-sm text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] disabled:opacity-40 disabled:cursor-not-allowed transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 5l7 7-7 7"/>
            </svg>
          </button>
        </div>
      </div>
    </div>
  `
})
export class DataTableComponent<T extends Record<string, any>> implements OnChanges {
  @Input() columns: TableColumn<T>[] = [];
  @Input() data: T[] = [];
  @Input() loading = false;
  @Input() pageSize = 10;

  searchQuery = '';
  currentPage = 1;
  Math = Math;

  private _filteredData = signal<T[]>([]);

  filteredData = this._filteredData.asReadonly();

  paginatedData = computed(() => {
    const start = (this.currentPage - 1) * this.pageSize;
    return this._filteredData().slice(start, start + this.pageSize);
  });

  ngOnChanges() {
    this._filteredData.set(this.data);
    this.currentPage = 1;
  }

  onSearch() {
    const q = this.searchQuery.toLowerCase();
    this.currentPage = 1;
    if (!q) {
      this._filteredData.set(this.data);
      return;
    }
    this._filteredData.set(
      this.data.filter(row =>
        Object.values(row).some(v => String(v).toLowerCase().includes(q))
      )
    );
  }
}
