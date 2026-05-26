import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Instructor, CreateInstructorDto, UpdateInstructorDto } from '../models/instructor.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class InstructorService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  instructors = signal<Instructor[]>([]);
  loading = signal(false);

  loadAll() {
    this.loading.set(true);
    this.http.get<Instructor[]>(`${this.apiUrl}/admin/instructors`).subscribe({
      next: data => { this.instructors.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create(dto: CreateInstructorDto) {
    return this.http.post<{ id: string }>(`${this.apiUrl}/admin/instructors`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdateInstructorDto) {
    return this.http.put(`${this.apiUrl}/admin/instructors/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/admin/instructors/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
