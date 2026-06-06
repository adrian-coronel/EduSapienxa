import { inject, Injectable, signal } from '@angular/core';
import { HttpClient, HttpEventType, HttpRequest } from '@angular/common/http';
import { Observable, Subscription } from 'rxjs';
import { ENVIRONMENT } from '../tokens';
import { DocumentUpload, DocumentStatusResult, UploadDocumentResult, DocumentStatus } from '../models/document.model';

export type UploadEvent =
  | { type: 'progress'; percent: number }
  | { type: 'complete'; id: string };

export interface ActiveUpload {
  localId: number;
  fileName: string;
  percent: number;
  error?: string;
  sub?: Subscription;
}

export const STATUS_LABEL: Record<DocumentStatus, string> = {
  Pending:   'Pendiente',
  Queued:    'En cola',
  Parsing:   'Analizando',
  Chunking:  'Fragmentando',
  Embedding: 'Generando embeddings',
  Completed: 'Completado',
  Failed:    'Error',
  Paused:    'Pausado'
};

export const ACTIVE_STATUSES: DocumentStatus[] = ['Queued', 'Parsing', 'Chunking', 'Embedding'];

let _uid = 0;

@Injectable({ providedIn: 'root' })
export class DocumentService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  documents    = signal<DocumentUpload[]>([]);
  loading      = signal(false);
  activeUploads = signal<ActiveUpload[]>([]);

  private pollingIds = new Set<string>();

  // ── Load ─────────────────────────────────────────────────────
  loadAll() {
    this.loading.set(true);
    this.http.get<{ items: DocumentUpload[] }>(`${this.apiUrl}/admin/documents`).subscribe({
      next: data => {
        this.documents.set(data?.items ?? []);
        this.loading.set(false);
        // Retomar polling de docs que siguen activos (por si el usuario navegó y volvió)
        this.documents().filter(d => ACTIVE_STATUSES.includes(d.status))
          .forEach(d => this._startPolling(d.id));
      },
      error: () => this.loading.set(false)
    });
  }

  // ── Upload ───────────────────────────────────────────────────
  upload(file: File) {
    const localId = ++_uid;
    this._addActive({ localId, fileName: file.name, percent: 0 });

    const sub = this._doUpload(file).subscribe({
      next: evt => {
        if (evt.type === 'progress') {
          this._patchUpload(localId, { percent: evt.percent });
        } else if (evt.type === 'complete') {
          // Upload terminó: el archivo queda como Pending en la lista
          // NO iniciamos polling — el usuario decide cuándo procesar
          this.loadAll();
          this._patchUpload(localId, { percent: 100 });
          setTimeout(() => this._removeUpload(localId), 2000);
        }
      },
      error: err => {
        const msg = err?.error?.message ?? 'Error al subir el archivo';
        this._patchUpload(localId, { error: msg });
        setTimeout(() => this._removeUpload(localId), 5000);
      }
    });
    this._patchUpload(localId, { sub });
  }

  cancelUpload(localId: number) {
    const item = this.activeUploads().find(a => a.localId === localId);
    if (!item) return;
    item.sub?.unsubscribe();
    this._removeUpload(localId);
  }

  // ── Queue (trigger processing) ───────────────────────────────
  queueDoc(docId: string): Observable<void> {
    return new Observable(observer => {
      this.http.post<void>(`${this.apiUrl}/admin/documents/${docId}/queue`, {}).subscribe({
        next: () => {
          // Optimistic update: cambiar a Queued en el signal antes del primer poll
          this.documents.update(list =>
            list.map(d => d.id === docId ? { ...d, status: 'Queued' as DocumentStatus, progressPct: 0 } : d)
          );
          this._startPolling(docId);
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  queueAll(): Observable<{ count: number }> {
    return new Observable(observer => {
      this.http.post<{ count: number }>(`${this.apiUrl}/admin/documents/queue-all`, {}).subscribe({
        next: result => {
          // Optimistic update de todos los Pending/Failed a Queued
          this.documents.update(list =>
            list.map(d =>
              (d.status === 'Pending' || d.status === 'Failed')
                ? { ...d, status: 'Queued' as DocumentStatus, progressPct: 0, errorMessage: null }
                : d
            )
          );
          // Iniciar polling para cada uno
          this.documents()
            .filter(d => d.status === 'Queued')
            .forEach(d => this._startPolling(d.id));
          observer.next(result);
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  // ── Pause / Resume ───────────────────────────────────────────
  pauseDoc(docId: string): Observable<void> {
    return new Observable(observer => {
      this.http.post<void>(`${this.apiUrl}/admin/documents/${docId}/pause`, {}).subscribe({
        next: () => {
          this.pollingIds.delete(docId);
          this.documents.update(list =>
            list.map(d => d.id === docId ? { ...d, status: 'Paused' as DocumentStatus } : d)
          );
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  resumeDoc(docId: string): Observable<void> {
    return new Observable(observer => {
      this.http.post<void>(`${this.apiUrl}/admin/documents/${docId}/resume`, {}).subscribe({
        next: () => {
          this.documents.update(list =>
            list.map(d => d.id === docId ? { ...d, status: 'Queued' as DocumentStatus, progressPct: 0 } : d)
          );
          this._startPolling(docId);
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  // ── Delete ───────────────────────────────────────────────────
  deleteDoc(docId: string): Observable<void> {
    return new Observable(observer => {
      this.pollingIds.delete(docId);
      this.http.delete<void>(`${this.apiUrl}/admin/documents/${docId}`).subscribe({
        next: () => {
          this.documents.update(list => list.filter(d => d.id !== docId));
          observer.next();
          observer.complete();
        },
        error: err => observer.error(err)
      });
    });
  }

  // ── Polling (interno) ────────────────────────────────────────
  private _startPolling(docId: string, initialDelayMs = 1500) {
    if (this.pollingIds.has(docId)) return;
    this.pollingIds.add(docId);
    setTimeout(() => this._poll(docId), initialDelayMs);
  }

  private _poll(docId: string) {
    if (!this.pollingIds.has(docId)) return;

    this.http.get<DocumentStatusResult>(`${this.apiUrl}/admin/documents/${docId}/status`).subscribe({
      next: result => {
        // Actualizar solo este doc en el signal
        this.documents.update(list =>
          list.map(d => d.id === docId
            ? { ...d, status: result.status, progressPct: result.progressPct,
                errorMessage: result.errorMessage ?? null, chunkCount: result.chunkCount ?? null }
            : d)
        );

        if (result.status === 'Completed' || result.status === 'Failed' || result.status === 'Paused') {
          this.pollingIds.delete(docId);
          // Si completó, recargar para tener todos los campos (chunkCount, completedAt, etc.)
          if (result.status === 'Completed') {
            setTimeout(() => this.loadAll(), 500);
          }
        } else {
          setTimeout(() => this._poll(docId), 2000);
        }
      },
      error: () => {
        // Error de red silencioso — reintenta en 5s sin notificar al usuario
        if (this.pollingIds.has(docId)) {
          setTimeout(() => this._poll(docId), 5000);
        }
      }
    });
  }

  // ── Helpers ──────────────────────────────────────────────────
  private _doUpload(file: File): Observable<UploadEvent> {
    return new Observable(observer => {
      const formData = new FormData();
      formData.append('file', file);
      const req = new HttpRequest('POST', `${this.apiUrl}/admin/documents`, formData, { reportProgress: true });
      const sub = this.http.request<UploadDocumentResult>(req).subscribe({
        next: event => {
          if (event.type === HttpEventType.UploadProgress && event.total) {
            observer.next({ type: 'progress', percent: Math.round(100 * event.loaded / event.total) });
          } else if (event.type === HttpEventType.Response && event.body) {
            observer.next({ type: 'complete', id: event.body.id });
            observer.complete();
          }
        },
        error: err => observer.error(err)
      });
      return () => sub.unsubscribe();
    });
  }

  private _addActive(entry: ActiveUpload) {
    this.activeUploads.update(list => [...list, entry]);
  }

  private _patchUpload(localId: number, patch: Partial<ActiveUpload>) {
    this.activeUploads.update(list =>
      list.map(a => a.localId === localId ? { ...a, ...patch } : a));
  }

  private _removeUpload(localId: number) {
    this.activeUploads.update(list => list.filter(a => a.localId !== localId));
  }
}
