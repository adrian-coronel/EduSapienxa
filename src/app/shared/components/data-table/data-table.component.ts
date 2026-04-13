import { Component, Input, signal, computed, OnChanges } from '@angular/core';
import { NgFor, NgIf, NgClass } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { SafeHtmlPipe } from '../../pipes/safe-html.pipe';

export interface TableColumn<T = any> {
  key: string;
  label: string;
  sortable?: boolean;
  template?: (row: T) => string;
}

@Component({
  selector: 'app-data-table',
  standalone: true,
  imports: [NgFor, NgIf, NgClass, FormsModule, SafeHtmlPipe],
  template: `
    <div class="overflow-hidden rounded-2xl
                border border-[var(--color-border)]
                bg-[var(--color-card)]
                shadow-[var(--shadow-card)]">

      <!-- ── Toolbar ─────────────────────────────────────── -->
      <div class="flex flex-col gap-3 border-b border-[var(--color-border)]
                  px-5 py-4
                  sm:flex-row sm:items-center sm:justify-between">

        <!-- Search -->
        <div class="relative w-full sm:w-72">
          <svg class="pointer-events-none absolute left-3.5 top-1/2 h-4 w-4 -translate-y-1/2
                      text-[var(--color-muted-foreground)]"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="11" cy="11" r="8"/>
            <path stroke-linecap="round" d="m21 21-4.35-4.35"/>
          </svg>
          <input
            [(ngModel)]="searchQuery"
            (ngModelChange)="onSearch()"
            type="text"
            placeholder="Buscar..."
            class="h-10 w-full rounded-lg
                   border border-[var(--color-border)]
                   bg-[var(--color-background)]
                   pl-10 pr-4 text-sm
                   text-[var(--color-foreground)]
                   placeholder:text-[var(--color-muted-foreground)]
                   focus:outline-none focus:border-[var(--color-primary)]
                   focus:ring-1 focus:ring-[var(--color-primary)]
                   transition-colors"
          />
        </div>

        <!-- Slot for action buttons -->
        <div class="flex flex-shrink-0 items-center gap-2">
          <ng-content select="[slot=actions]" />
        </div>
      </div>

      <!-- ── Loading skeletons ────────────────────────────── -->
      <div *ngIf="loading" class="divide-y divide-[var(--color-border)]">
        <div *ngFor="let _ of skeletonRows" class="flex items-center gap-6 px-5 py-4">
          <div *ngFor="let col of columns"
               class="h-4 flex-1 animate-pulse rounded-full bg-[var(--color-muted)]"></div>
        </div>
      </div>

      <!-- ── Table ────────────────────────────────────────── -->
      <div *ngIf="!loading" class="overflow-x-auto">
        <table class="w-full text-sm">
          <thead>
            <tr class="border-b border-[var(--color-border)] bg-[var(--color-muted)]">
              <th
                *ngFor="let col of columns"
                class="px-5 py-3.5 text-left text-xs font-semibold
                       uppercase tracking-wider whitespace-nowrap
                       text-[var(--color-muted-foreground)]"
              >
                {{ col.label }}
              </th>
            </tr>
          </thead>
          <tbody class="divide-y divide-[var(--color-border)]">

            <!-- Empty state -->
            <tr *ngIf="paginatedData().length === 0">
              <td [attr.colspan]="columns.length" class="px-5 py-14 text-center">
                <div class="flex flex-col items-center gap-3">
                  <svg class="h-10 w-10 opacity-30 text-[var(--color-muted-foreground)]"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M20 13V6a2 2 0 00-2-2H6a2 2 0 00-2 2v7m16 0v5a2 2 0 01-2 2H6a2 2 0 01-2-2v-5m16 0h-2.586a1 1 0 00-.707.293l-2.414 2.414a1 1 0 01-.707.293h-3.172a1 1 0 01-.707-.293l-2.414-2.414A1 1 0 006.586 13H4"/>
                  </svg>
                  <p class="text-sm text-[var(--color-muted-foreground)]">No hay registros.</p>
                </div>
              </td>
            </tr>

            <!-- Data rows -->
            <tr
              *ngFor="let row of paginatedData()"
              class="hover:bg-[var(--color-muted)] transition-colors duration-100"
            >
              <td *ngFor="let col of columns"
                  class="px-5 py-3.5 text-[var(--color-foreground)] whitespace-nowrap align-middle">
                <ng-container *ngIf="col.template; else plain">
                  <span [innerHTML]="col.template(row) | safeHtml"></span>
                </ng-container>
                <ng-template #plain>{{ row[col.key] ?? '—' }}</ng-template>
              </td>
            </tr>
          </tbody>
        </table>
      </div>

      <!-- ── Pagination ───────────────────────────────────── -->
      <div *ngIf="!loading && totalPages() > 1"
           class="flex flex-col gap-3 border-t border-[var(--color-border)]
                  px-5 py-4
                  sm:flex-row sm:items-center sm:justify-between">

        <p class="text-sm text-[var(--color-muted-foreground)]">
          Mostrando
          <span class="font-medium text-[var(--color-foreground)]">{{ rangeStart() }}–{{ rangeEnd() }}</span>
          de
          <span class="font-medium text-[var(--color-foreground)]">{{ filteredData().length }}</span>
          registros
        </p>

        <div class="flex items-center gap-1">

          <!-- Previous -->
          <button
            (click)="setPage(currentPage - 1)"
            [disabled]="currentPage === 1"
            class="flex h-9 w-9 items-center justify-center rounded-md
                   border border-[var(--color-border)]
                   text-[var(--color-muted-foreground)]
                   hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
          >
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
            </svg>
          </button>

          <!-- Page numbers -->
          <button
            *ngFor="let p of pageNumbers()"
            (click)="setPage(p)"
            [ngClass]="p === currentPage
              ? 'border-[var(--color-primary)] bg-[var(--color-primary)] text-white'
              : 'border-[var(--color-border)] text-[var(--color-muted-foreground)] hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]'"
            class="flex h-9 min-w-[2.25rem] items-center justify-center rounded-md
                   border px-2 text-sm font-medium transition-colors"
          >
            {{ p }}
          </button>

          <!-- Next -->
          <button
            (click)="setPage(currentPage + 1)"
            [disabled]="currentPage >= totalPages()"
            class="flex h-9 w-9 items-center justify-center rounded-md
                   border border-[var(--color-border)]
                   text-[var(--color-muted-foreground)]
                   hover:border-[var(--color-primary)] hover:text-[var(--color-primary)]
                   disabled:opacity-40 disabled:cursor-not-allowed
                   transition-colors"
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

  readonly skeletonRows = [1, 2, 3, 4, 5];

  private _filteredData = signal<T[]>([]);
  filteredData = this._filteredData.asReadonly();

  paginatedData = computed(() => {
    const start = (this.currentPage - 1) * this.pageSize;
    return this._filteredData().slice(start, start + this.pageSize);
  });

  totalPages = computed(() => Math.ceil(this._filteredData().length / this.pageSize));
  rangeStart = computed(() => (this.currentPage - 1) * this.pageSize + 1);
  rangeEnd   = computed(() => Math.min(this.currentPage * this.pageSize, this._filteredData().length));

  pageNumbers = computed(() => {
    const total = this.totalPages();
    const cur   = this.currentPage;
    const max   = 5;
    const half  = Math.floor(max / 2);
    let start = Math.max(1, cur - half);
    let end   = Math.min(total, start + max - 1);
    if (end - start + 1 < max) start = Math.max(1, end - max + 1);
    return Array.from({ length: end - start + 1 }, (_, i) => start + i);
  });

  ngOnChanges(): void {
    this._filteredData.set(this.data ?? []);
    this.currentPage = 1;
    this.searchQuery = '';
  }

  onSearch(): void {
    const q = this.searchQuery.toLowerCase().trim();
    this.currentPage = 1;
    this._filteredData.set(
      !q
        ? this.data
        : this.data.filter(row =>
            Object.values(row).some(v => String(v ?? '').toLowerCase().includes(q))
          )
    );
  }

  setPage(page: number): void {
    if (page < 1 || page > this.totalPages()) return;
    this.currentPage = page;
  }
}
