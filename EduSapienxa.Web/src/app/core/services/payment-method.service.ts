import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { PaymentMethod, CreatePaymentMethodDto, UpdatePaymentMethodDto } from '../models/payment-method.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class PaymentMethodService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  methods = signal<PaymentMethod[]>([]);
  loading = signal(false);

  loadAll() {
    this.loading.set(true);
    this.http.get<PaymentMethod[]>(`${this.apiUrl}/admin/payment-methods`).subscribe({
      next: data => { this.methods.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  create(dto: CreatePaymentMethodDto) {
    return this.http.post<{ id: string }>(`${this.apiUrl}/admin/payment-methods`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdatePaymentMethodDto) {
    return this.http.put(`${this.apiUrl}/admin/payment-methods/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/admin/payment-methods/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
