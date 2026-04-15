import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Subcategory, CreateSubcategoryDto, UpdateSubcategoryDto } from '../models/subcategory.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class SubcategoryService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  subcategories = signal<Subcategory[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<Subcategory[]>(`${this.apiUrl}/subcategories`).subscribe({
      next: data => { this.subcategories.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number) {
    return this.http.get<Subcategory>(`${this.apiUrl}/subcategories/${id}`);
  }

  create(dto: CreateSubcategoryDto) {
    return this.http.post<Subcategory>(`${this.apiUrl}/subcategories`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, dto: UpdateSubcategoryDto) {
    return this.http.put<Subcategory>(`${this.apiUrl}/subcategories/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/subcategories/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
