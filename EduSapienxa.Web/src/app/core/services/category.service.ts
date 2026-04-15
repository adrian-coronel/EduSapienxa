import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Category, CreateCategoryDto, UpdateCategoryDto } from '../models/category.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CategoryService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  categories = signal<Category[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<Category[]>(`${this.apiUrl}/categories`).subscribe({
      next: data => { this.categories.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number) {
    return this.http.get<Category>(`${this.apiUrl}/categories/${id}`);
  }

  create(dto: CreateCategoryDto) {
    return this.http.post<Category>(`${this.apiUrl}/categories`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, dto: UpdateCategoryDto) {
    return this.http.put<Category>(`${this.apiUrl}/categories/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/categories/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
