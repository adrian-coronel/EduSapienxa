import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { Purchase, CreatePurchaseDto } from '../models/purchase.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PurchaseService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  purchases = signal<Purchase[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<Purchase[]>(`${this.apiUrl}/purchases`).subscribe({
      next: data => { this.purchases.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  getByLead(leadId: number) {
    return this.http.get<Purchase[]>(`${this.apiUrl}/leads/${leadId}/purchases`);
  }

  create(dto: CreatePurchaseDto) {
    return this.http.post<Purchase>(`${this.apiUrl}/purchases`, dto).pipe(
      tap(() => this.loadAll())
    );
  }
}
