import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { CatalogItem, CreateCatalogItemDto, UpdateCatalogItemDto } from '../models/catalog-item.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CatalogService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  items = signal<CatalogItem[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<CatalogItem[]>(`${this.apiUrl}/admin/catalog`).subscribe({
      next: data => { this.items.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: string) {
    return this.http.get<CatalogItem>(`${this.apiUrl}/admin/catalog/${id}`);
  }

  create(dto: CreateCatalogItemDto) {
    return this.http.post<{ id: string }>(`${this.apiUrl}/admin/catalog`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdateCatalogItemDto) {
    return this.http.put(`${this.apiUrl}/admin/catalog/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/admin/catalog/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
