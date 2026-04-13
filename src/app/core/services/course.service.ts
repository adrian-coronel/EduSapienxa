import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Course, CreateCourseDto, UpdateCourseDto } from '../models/course.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class CourseService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  courses = signal<Course[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<Course[]>(`${this.apiUrl}/courses`).subscribe({
      next: data => { this.courses.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number) {
    return this.http.get<Course>(`${this.apiUrl}/courses/${id}`);
  }

  create(dto: CreateCourseDto) {
    return this.http.post<Course>(`${this.apiUrl}/courses`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, dto: UpdateCourseDto) {
    return this.http.put<Course>(`${this.apiUrl}/courses/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: number) {
    return this.http.delete(`${this.apiUrl}/courses/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
