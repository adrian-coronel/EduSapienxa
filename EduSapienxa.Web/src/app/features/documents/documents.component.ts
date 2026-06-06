import { Component, inject, signal, computed, OnInit, OnDestroy } from '@angular/core';
import { NgIf, NgFor, NgClass, NgTemplateOutlet } from '@angular/common';
import { DocumentService, STATUS_LABEL, ACTIVE_STATUSES } from '../../core/services/document.service';
import { DocumentUpload, DocumentStatus } from '../../core/models/document.model';
import { ConfirmModalComponent } from '../../shared/components/confirm-modal/confirm-modal.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';

const STATUS_CHIP: Record<DocumentStatus, string> = {
  Pending:   'bg-gray-100 text-gray-600 dark:bg-gray-800 dark:text-gray-400',
  Queued:    'bg-blue-100 text-blue-700 dark:bg-blue-950/40 dark:text-blue-300',
  Parsing:   'bg-blue-50 text-blue-700 dark:bg-blue-950/40 dark:text-blue-400',
  Chunking:  'bg-indigo-50 text-indigo-700 dark:bg-indigo-950/40 dark:text-indigo-400',
  Embedding: 'bg-yellow-50 text-yellow-700 dark:bg-yellow-950/40 dark:text-yellow-400',
  Completed: 'bg-green-50 text-green-700 dark:bg-green-950/40 dark:text-green-400',
  Failed:    'bg-red-50 text-red-700 dark:bg-red-950/40 dark:text-red-400',
  Paused:    'bg-orange-50 text-orange-700 dark:bg-orange-950/40 dark:text-orange-400'
};

const BAR_COLOR: Partial<Record<DocumentStatus, string>> = {
  Queued:    'bg-blue-400',
  Parsing:   'bg-blue-500',
  Chunking:  'bg-indigo-500',
  Embedding: 'bg-yellow-500',
};

@Component({
  selector: 'app-documents',
  standalone: true,
  imports: [NgIf, NgFor, NgClass, NgTemplateOutlet, ConfirmModalComponent, PageHeaderComponent],
  template: `
    <!-- ── Header ─────────────────────────────────────────────── -->
    <app-page-header title="Documentos" description="Base de conocimiento del agente IA">
      <div class="flex items-center gap-2">
        <button *ngIf="tab() === 'pending' && pendingCount() > 0"
                (click)="processAll()"
                class="btn-secondary flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Procesar todos ({{ pendingCount() }})
        </button>
        <button (click)="showUploadModal.set(true)" class="btn-primary flex items-center gap-1.5">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5
                     M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9"/>
          </svg>
          Subir archivo
        </button>
      </div>
    </app-page-header>

    <!-- ── Tabs ───────────────────────────────────────────────── -->
    <div class="mb-5 flex gap-1 border-b border-[var(--color-border)]">
      <button (click)="tab.set('pending')"
              class="relative px-4 py-2.5 text-sm font-medium transition-colors"
              [ngClass]="tab() === 'pending'
                ? 'text-[var(--color-foreground)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'">
        Pendientes
        <span *ngIf="pendingDocs().length > 0"
              class="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
              [ngClass]="tab() === 'pending' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'">
          {{ pendingDocs().length }}
        </span>
      </button>
      <button (click)="tab.set('processed')"
              class="relative px-4 py-2.5 text-sm font-medium transition-colors"
              [ngClass]="tab() === 'processed'
                ? 'text-[var(--color-foreground)] after:absolute after:bottom-0 after:left-0 after:right-0 after:h-0.5 after:bg-[var(--color-primary)]'
                : 'text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]'">
        Procesados
        <span *ngIf="processedCount() > 0"
              class="ml-1.5 inline-flex h-4 min-w-4 items-center justify-center rounded-full px-1 text-[10px] font-semibold"
              [ngClass]="tab() === 'processed' ? 'bg-[var(--color-primary)]/15 text-[var(--color-primary)]' : 'bg-[var(--color-muted)] text-[var(--color-muted-foreground)]'">
          {{ processedCount() }}
        </span>
      </button>
    </div>

    <!-- ══ TAB: PENDIENTES ════════════════════════════════════════ -->
    <ng-container *ngIf="tab() === 'pending'">

      <!-- Barra de progreso de lote -->
      <div *ngIf="showBatchBar()"
           class="mb-5 rounded-xl border border-blue-200 bg-blue-50 p-4 dark:border-blue-900/30 dark:bg-blue-950/20">
        <div class="flex items-center justify-between text-sm mb-2">
          <span class="font-medium text-blue-800 dark:text-blue-300">Procesando documentos…</span>
          <span class="text-blue-700 dark:text-blue-400 font-semibold">
            {{ batchDone() }} de {{ batchTotal() }} completados
          </span>
        </div>
        <div class="h-2 w-full overflow-hidden rounded-full bg-blue-200 dark:bg-blue-900/40">
          <div class="h-full rounded-full bg-blue-500 transition-all duration-500"
               [style.width.%]="batchProgress()"></div>
        </div>
      </div>

      <!-- Uploads HTTP activos -->
      <div *ngIf="svc.activeUploads().length > 0" class="mb-4 space-y-2">
        <div *ngFor="let up of svc.activeUploads()"
             class="flex items-center gap-3 rounded-xl border border-[var(--color-border)]
                    bg-[var(--color-card)] px-4 py-3">
          <svg class="h-5 w-5 flex-shrink-0 text-[var(--color-primary)]"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5
                     M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9"/>
          </svg>
          <div class="min-w-0 flex-1">
            <div class="flex items-center justify-between gap-2 text-sm">
              <span class="truncate font-medium text-[var(--color-foreground)]">{{ up.fileName }}</span>
              <span *ngIf="!up.error" class="flex-shrink-0 font-semibold text-[var(--color-primary)]">
                {{ up.percent === 100 ? '✓ Subido' : up.percent + '%' }}
              </span>
            </div>
            <div *ngIf="!up.error" class="mt-1.5 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
              <div class="h-full rounded-full bg-[var(--color-primary)] transition-all duration-300"
                   [style.width.%]="up.percent"></div>
            </div>
            <p *ngIf="up.error" class="mt-1 text-xs text-red-500">{{ up.error }}</p>
          </div>
          <button *ngIf="up.percent < 100 && !up.error"
                  (click)="svc.cancelUpload(up.localId)"
                  class="flex-shrink-0 rounded-md p-1 text-[var(--color-muted-foreground)]
                         hover:bg-[var(--color-muted)] hover:text-red-500 transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
      </div>

      <!-- Lista de documentos pendientes -->
      <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <div *ngIf="pendingDocs().length === 0 && !svc.loading() && svc.activeUploads().length === 0"
             class="flex flex-col items-center justify-center py-16">
          <svg class="h-10 w-10 text-[var(--color-muted-foreground)]"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M19.5 14.25v-2.625a3.375 3.375 0 00-3.375-3.375h-1.5A1.125 1.125 0 0113.5 7.125v-1.5
                     a3.375 3.375 0 00-3.375-3.375H8.25m0 12.75h7.5m-7.5 3H12M10.5 2.25H5.625
                     c-.621 0-1.125.504-1.125 1.125v17.25c0 .621.504 1.125 1.125 1.125h12.75
                     c.621 0 1.125-.504 1.125-1.125V11.25a9 9 0 00-9-9z"/>
          </svg>
          <p class="mt-3 text-sm font-medium text-[var(--color-muted-foreground)]">No hay documentos pendientes</p>
          <p class="mt-1 text-xs text-[var(--color-muted-foreground)]">Sube un archivo para empezar</p>
        </div>

        <div *ngFor="let doc of pendingDocs(); let last = last"
             class="flex items-center gap-4 bg-[var(--color-card)] px-5 py-4 transition-colors
                    hover:bg-[var(--color-muted)]/30"
             [ngClass]="!last ? 'border-b border-[var(--color-border)]' : ''">
          <ng-container *ngTemplateOutlet="docRow; context: { $implicit: doc }"/>
        </div>
      </div>

    </ng-container>

    <!-- ══ TAB: PROCESADOS ════════════════════════════════════════ -->
    <ng-container *ngIf="tab() === 'processed'">

      <div class="overflow-hidden rounded-xl border border-[var(--color-border)]">
        <div *ngIf="processedDocs().length === 0 && !svc.loading()"
             class="flex flex-col items-center justify-center py-16">
          <svg class="h-10 w-10 text-[var(--color-muted-foreground)]"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z"/>
          </svg>
          <p class="mt-3 text-sm font-medium text-[var(--color-muted-foreground)]">No hay documentos procesados</p>
          <p class="mt-1 text-xs text-[var(--color-muted-foreground)]">Procesa un documento para verlo aquí</p>
        </div>

        <div *ngFor="let doc of processedDocs(); let last = last"
             class="flex items-center gap-4 bg-[var(--color-card)] px-5 py-4 transition-colors
                    hover:bg-[var(--color-muted)]/30"
             [ngClass]="!last ? 'border-b border-[var(--color-border)]' : ''">
          <ng-container *ngTemplateOutlet="docRow; context: { $implicit: doc }"/>
        </div>
      </div>

    </ng-container>

    <!-- ── Plantilla de fila (reutilizada en ambos tabs) ──────── -->
    <ng-template #docRow let-doc>

      <!-- File icon -->
      <div class="flex h-9 w-9 flex-shrink-0 items-center justify-center rounded-lg"
           [ngClass]="doc.status === 'Completed'
             ? 'bg-green-50 dark:bg-green-950/30'
             : doc.status === 'Failed'
               ? 'bg-red-50 dark:bg-red-950/30'
               : 'bg-[var(--color-muted)]'">
        <svg class="h-4 w-4" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75"
             [ngClass]="doc.status === 'Completed' ? 'text-green-600'
               : doc.status === 'Failed' ? 'text-red-500'
               : 'text-[var(--color-muted-foreground)]'">
          <path stroke-linecap="round" stroke-linejoin="round"
                d="M7 21h10a2 2 0 002-2V9.414a1 1 0 00-.293-.707l-5.414-5.414A1 1 0 0012.586 3H7
                   a2 2 0 00-2 2v14a2 2 0 002 2z"/>
        </svg>
      </div>

      <!-- Info + progress -->
      <div class="min-w-0 flex-1">
        <div class="flex flex-wrap items-center gap-x-3 gap-y-1">
          <span class="truncate text-sm font-medium text-[var(--color-foreground)]">{{ doc.fileName }}</span>
          <span class="text-xs text-[var(--color-muted-foreground)]">{{ formatSize(doc.fileSize) }}</span>
          <span class="inline-flex items-center rounded-full px-2 py-0.5 text-[11px] font-semibold"
                [ngClass]="chipClass(doc)">
            {{ statusLabel(doc) }}
          </span>
          <span *ngIf="doc.status === 'Completed' && doc.chunkCount"
                class="text-xs text-[var(--color-muted-foreground)]">
            {{ doc.chunkCount }} fragmentos
          </span>
          <span *ngIf="isActive(doc)"
                class="text-xs font-semibold text-[var(--color-primary)]">
            {{ doc.progressPct }}%
          </span>
        </div>

        <!-- Barra inline (solo activos) -->
        <div *ngIf="isActive(doc)"
             class="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-[var(--color-muted)]">
          <div class="h-full rounded-full transition-all duration-500"
               [ngClass]="barColor(doc)"
               [style.width.%]="doc.progressPct"></div>
        </div>

        <!-- Error -->
        <p *ngIf="doc.status === 'Failed' && doc.errorMessage"
           class="mt-1 truncate text-xs text-red-500" [title]="doc.errorMessage!">
          {{ doc.errorMessage }}
        </p>
      </div>

      <!-- Acciones -->
      <div class="flex flex-shrink-0 items-center gap-1">

        <!-- Procesar (Pending / Failed) -->
        <button *ngIf="doc.status === 'Pending' || doc.status === 'Failed'"
                (click)="queueDoc(doc.id)"
                title="Procesar documento"
                class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-[var(--color-border)]
                       px-2.5 text-xs font-medium text-[var(--color-foreground)]
                       hover:bg-[var(--color-muted)] transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5 text-[var(--color-primary)]">
            <path d="M8 5v14l11-7z"/>
          </svg>
          {{ doc.status === 'Failed' ? 'Reintentar' : 'Procesar' }}
        </button>

        <!-- Reanudar (Paused) -->
        <button *ngIf="doc.status === 'Paused'"
                (click)="resumeDoc(doc.id)"
                title="Reanudar procesamiento"
                class="inline-flex h-8 cursor-pointer items-center gap-1.5 rounded-md border border-orange-200
                       px-2.5 text-xs font-medium text-orange-700
                       hover:bg-orange-50 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-3.5 w-3.5">
            <path d="M8 5v14l11-7z"/>
          </svg>
          Reanudar
        </button>

        <!-- Pausar (activos) -->
        <button *ngIf="isActive(doc)"
                (click)="pauseDoc(doc.id)"
                title="Pausar procesamiento"
                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md
                       text-orange-500 hover:bg-orange-50 hover:text-orange-700 transition-colors">
          <svg viewBox="0 0 24 24" fill="currentColor" class="h-4 w-4">
            <path d="M6 19h4V5H6v14zm8-14v14h4V5h-4z"/>
          </svg>
        </button>

        <!-- Eliminar (inactivos) -->
        <button *ngIf="!isActive(doc)"
                (click)="confirmDelete(doc.id)"
                title="Eliminar documento"
                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md
                       text-[var(--color-muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M3 6h18M8 6V4h8v2M19 6l-1 14H6L5 6"/>
          </svg>
        </button>

        <!-- Cancelar (activos) -->
        <button *ngIf="isActive(doc)"
                (click)="confirmDelete(doc.id)"
                title="Cancelar y eliminar"
                class="inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md
                       text-[var(--color-muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
          </svg>
        </button>
      </div>

    </ng-template>

    <!-- ── Upload modal ──────────────────────────────────────── -->
    <div *ngIf="showUploadModal()" class="fixed inset-0 z-50 flex items-end justify-center p-4 sm:items-center">
      <div class="absolute inset-0 bg-black/50" (click)="showUploadModal.set(false)"></div>
      <div class="relative w-full max-w-lg rounded-2xl bg-[var(--color-card)] shadow-2xl overflow-hidden">
        <div class="flex items-center justify-between border-b border-[var(--color-border)] px-6 py-4">
          <h3 class="text-base font-semibold text-[var(--color-foreground)]">Subir archivo</h3>
          <button (click)="showUploadModal.set(false)"
                  class="flex h-8 w-8 items-center justify-center rounded-lg
                         text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
              <path stroke-linecap="round" stroke-linejoin="round" d="M6 18L18 6M6 6l12 12"/>
            </svg>
          </button>
        </div>
        <label class="group flex cursor-pointer flex-col items-center justify-center px-8 py-14 transition-all"
               [ngClass]="isDragging()
                 ? 'bg-blue-50/60 dark:bg-blue-950/20'
                 : 'hover:bg-[var(--color-muted)]/30'"
               (dragover)="onDragOver($event)" (dragleave)="onDragLeave()" (drop)="onDrop($event)">
          <div class="flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/10
                      group-hover:bg-[var(--color-primary)]/20 transition-all duration-200"
               [ngClass]="isDragging() ? 'scale-110 bg-[var(--color-primary)]/20' : ''">
            <svg class="h-8 w-8 text-[var(--color-primary)]"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
              <path stroke-linecap="round" stroke-linejoin="round"
                    d="M3 16.5v2.25A2.25 2.25 0 005.25 21h13.5A2.25 2.25 0 0021 18.75V16.5
                       M16.5 12L12 7.5m0 0L7.5 12M12 7.5v9"/>
            </svg>
          </div>
          <p class="mt-5 text-base font-semibold text-[var(--color-foreground)]">Arrastra tus archivos aquí</p>
          <p class="mt-1.5 text-sm text-[var(--color-muted-foreground)]">
            o <span class="font-medium text-[var(--color-primary)]">haz clic para seleccionarlos</span>
          </p>
          <span class="mt-5 inline-flex items-center gap-1.5 rounded-full border border-[var(--color-border)]
                       bg-[var(--color-muted)]/60 px-3.5 py-1 text-xs text-[var(--color-muted-foreground)]">
            <span class="font-medium">PDF</span><span class="opacity-40">·</span>
            <span class="font-medium">DOCX</span><span class="opacity-40">·</span>
            <span class="font-medium">MD</span><span class="opacity-40">·</span>
            <span class="font-medium">TXT</span><span class="opacity-40">·</span>
            Máx. 20 MB
          </span>
          <input type="file" class="sr-only" multiple accept=".pdf,.docx,.md,.txt" (change)="onFileInput($event)"/>
        </label>
      </div>
    </div>

    <!-- ── Confirm delete ──────────────────────────────────────── -->
    <app-confirm-modal
      [open]="showConfirm()"
      title="Eliminar documento"
      message="¿Eliminar este documento? Se borrarán todos sus fragmentos."
      confirmLabel="Eliminar"
      (confirm)="onDelete()"
      (cancel)="showConfirm.set(false)"
    />
  `,
  styles: [`
    .btn-primary  { @apply rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors; }
    .btn-secondary{ @apply rounded-lg border border-[var(--color-border)] px-3 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
  `]
})
export class DocumentsComponent implements OnInit, OnDestroy {
  svc = inject(DocumentService);

  readonly STATUS_LABEL = STATUS_LABEL;
  readonly STATUS_CHIP  = STATUS_CHIP;
  readonly BAR_COLOR    = BAR_COLOR;

  tab             = signal<'pending' | 'processed'>('pending');
  showUploadModal = signal(false);
  isDragging      = signal(false);
  showConfirm     = signal(false);
  deletingId      = signal<string | null>(null);

  // Batch progress
  batchIds      = signal<string[]>([]);
  batchTotal    = computed(() => this.batchIds().length);
  batchDone     = computed(() => {
    const ids = this.batchIds();
    if (ids.length === 0) return 0;
    const docMap = new Map(this.svc.documents().map(d => [d.id, d]));
    return ids.filter(id => {
      const doc = docMap.get(id);
      // Eliminado o terminal (Completed / Failed) → cuenta como terminado
      return !doc || doc.status === 'Completed' || doc.status === 'Failed';
    }).length;
  });
  batchProgress = computed(() =>
    this.batchTotal() > 0 ? Math.round(100 * this.batchDone() / this.batchTotal()) : 0
  );
  showBatchBar  = computed(() => this.batchTotal() > 0 && this.batchDone() < this.batchTotal());

  pendingDocs   = computed(() => this.svc.documents().filter(d => d.status !== 'Completed'));
  processedDocs = computed(() => this.svc.documents().filter(d => d.status === 'Completed'));

  pendingCount   = computed(() =>
    this.svc.documents().filter(d => d.status === 'Pending' || d.status === 'Failed' || d.status === 'Paused').length
  );
  processedCount = computed(() => this.processedDocs().length);

  private refreshTimer?: ReturnType<typeof setInterval>;

  ngOnInit() {
    this.svc.loadAll();
    this.refreshTimer = setInterval(() => {
      // Auto-refresh silencioso para nuevos uploads de otras sesiones
      if (!this.svc.loading()) this.svc.loadAll();
    }, 10_000);
  }

  ngOnDestroy() {
    clearInterval(this.refreshTimer);
  }

  // ── Helpers ───────────────────────────────────────────────
  isActive(doc: DocumentUpload): boolean {
    return ACTIVE_STATUSES.includes(doc.status);
  }

  // ── Queue ─────────────────────────────────────────────────
  queueDoc(docId: string) {
    this.svc.queueDoc(docId).subscribe({ error: () => {} });
  }

  processAll() {
    const ids = this.svc.documents()
      .filter(d => d.status === 'Pending' || d.status === 'Failed')
      .map(d => d.id);
    if (!ids.length) return;
    this.batchIds.set(ids);
    this.svc.queueAll().subscribe({ error: () => this.batchIds.set([]) });
  }

  // ── Pause / Resume ────────────────────────────────────────
  pauseDoc(docId: string) {
    this.svc.pauseDoc(docId).subscribe({ error: () => {} });
  }

  resumeDoc(docId: string) {
    this.svc.resumeDoc(docId).subscribe({ error: () => {} });
  }

  // ── Delete ────────────────────────────────────────────────
  confirmDelete(id: string) {
    this.deletingId.set(id);
    this.showConfirm.set(true);
  }

  onDelete() {
    const id = this.deletingId();
    if (!id) return;
    this.showConfirm.set(false);
    this.deletingId.set(null);
    this.svc.deleteDoc(id).subscribe({ error: () => {} });
  }

  // ── Upload modal ──────────────────────────────────────────
  onDragOver(e: DragEvent) { e.preventDefault(); this.isDragging.set(true); }
  onDragLeave()            { this.isDragging.set(false); }

  onDrop(e: DragEvent) {
    e.preventDefault();
    this.isDragging.set(false);
    this.queueFiles(Array.from(e.dataTransfer?.files ?? []));
  }

  onFileInput(e: Event) {
    const input = e.target as HTMLInputElement;
    this.queueFiles(Array.from(input.files ?? []));
    input.value = '';
  }

  private queueFiles(files: File[]) {
    if (!files.length) return;
    files.forEach(f => this.svc.upload(f));
    this.showUploadModal.set(false);
  }

  // ── Template helpers (typed accessors for ng-template) ───
  chipClass(doc: DocumentUpload): string    { return STATUS_CHIP[doc.status]; }
  statusLabel(doc: DocumentUpload): string  { return STATUS_LABEL[doc.status]; }
  barColor(doc: DocumentUpload): string     { return BAR_COLOR[doc.status] ?? 'bg-[var(--color-primary)]'; }

  // ── Utils ─────────────────────────────────────────────────
  formatSize(bytes: number): string {
    if (bytes < 1024) return `${bytes} B`;
    if (bytes < 1_048_576) return `${(bytes / 1024).toFixed(1)} KB`;
    return `${(bytes / 1_048_576).toFixed(1)} MB`;
  }
}
