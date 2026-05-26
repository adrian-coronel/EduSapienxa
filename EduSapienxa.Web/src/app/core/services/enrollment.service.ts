import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Enrollment, EnrollmentDetail } from '../models/enrollment.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class EnrollmentService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  enrollments = signal<Enrollment[]>([]);
  loading = signal(false);

  loadAll(status?: string) {
    this.loading.set(true);
    const url = status
      ? `${this.apiUrl}/admin/enrollments?status=${status}`
      : `${this.apiUrl}/admin/enrollments`;
    this.http.get<Enrollment[]>(url).subscribe({
      next: data => { this.enrollments.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getById(id: string) {
    return this.http.get<EnrollmentDetail>(`${this.apiUrl}/admin/enrollments/${id}`);
  }

  updateStatus(id: string, status: string) {
    return this.http.put(`${this.apiUrl}/admin/enrollments/${id}/status`, { status }).pipe(
      tap(() => this.loadAll())
    );
  }
}
