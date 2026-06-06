import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../tokens';
import { Company, CreateCompanyDto, UpdateCompanyDto } from '../models/company.model';

@Injectable({ providedIn: 'root' })
export class CompanyService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  companies = signal<Company[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<Company[]>(`${this.apiUrl}/admin/companies`).subscribe({
      next: data => { this.companies.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  create(dto: CreateCompanyDto) {
    return this.http.post<Company>(`${this.apiUrl}/admin/companies`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdateCompanyDto) {
    return this.http.put<Company>(`${this.apiUrl}/admin/companies/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }
}
