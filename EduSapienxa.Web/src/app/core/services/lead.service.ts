import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Lead, LeadDetail, UpdateLeadDto } from '../models/lead.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  leads = signal<Lead[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll(status?: string) {
    this.loading.set(true);
    const url = status
      ? `${this.apiUrl}/admin/leads?status=${status}`
      : `${this.apiUrl}/admin/leads`;
    this.http.get<Lead[]>(url).subscribe({
      next: data => { this.leads.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: string) {
    return this.http.get<LeadDetail>(`${this.apiUrl}/admin/leads/${id}`);
  }

  update(id: string, dto: UpdateLeadDto) {
    return this.http.put(`${this.apiUrl}/admin/leads/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }
}
