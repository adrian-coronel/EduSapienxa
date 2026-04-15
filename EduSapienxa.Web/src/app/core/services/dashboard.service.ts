import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { DashboardSummary, TopCourse } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  summary = signal<DashboardSummary | null>(null);
  topCourses = signal<TopCourse[]>([]);
  loading = signal(false);

  loadSummary() {
    this.loading.set(true);
    this.http.get<DashboardSummary>(`${this.apiUrl}/dashboard/summary`).subscribe({
      next: data => { this.summary.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  loadTopCourses() {
    return this.http.get<TopCourse[]>(`${this.apiUrl}/dashboard/top-courses`);
  }
}
