import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Lead, CreateLeadDto, UpdateLeadDto, CreateLeadInterestDto, LeadInterest, LeadStatus } from '../models/lead.model';
import { Course } from '../models/course.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class LeadService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  leads = signal<Lead[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll(status?: LeadStatus) {
    this.loading.set(true);
    const url = status ? `${this.apiUrl}/leads?status=${status}` : `${this.apiUrl}/leads`;
    this.http.get<Lead[]>(url).subscribe({
      next: data => { this.leads.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getById(id: number) {
    return this.http.get<Lead>(`${this.apiUrl}/leads/${id}`);
  }

  create(dto: CreateLeadDto) {
    return this.http.post<Lead>(`${this.apiUrl}/leads`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: number, dto: UpdateLeadDto) {
    return this.http.put<Lead>(`${this.apiUrl}/leads/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  addInterest(id: number, dto: CreateLeadInterestDto) {
    return this.http.post<LeadInterest>(`${this.apiUrl}/leads/${id}/interests`, dto);
  }

  getRecommendations(id: number) {
    return this.http.get<Course[]>(`${this.apiUrl}/leads/${id}/recommendations`);
  }
}
