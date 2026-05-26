import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { DashboardSummary } from '../models/dashboard.model';

@Injectable({ providedIn: 'root' })
export class DashboardService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  summary = signal<DashboardSummary | null>(null);
  loading = signal(false);

  loadSummary() {
    this.loading.set(true);
    this.http.get<DashboardSummary>(`${this.apiUrl}/admin/dashboard`).subscribe({
      next: data => { this.summary.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }
}
