import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { PaymentValidation, PaymentValidationDetail } from '../models/payment-validation.model';

@Injectable({ providedIn: 'root' })
export class PaymentValidationService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  validations = signal<PaymentValidation[]>([]);
  loading = signal(false);

  loadAll(status?: string) {
    this.loading.set(true);
    const url = status
      ? `${this.apiUrl}/admin/payment-validations?status=${status}`
      : `${this.apiUrl}/admin/payment-validations`;
    this.http.get<PaymentValidation[]>(url).subscribe({
      next: data => { this.validations.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getById(id: string) {
    return this.http.get<PaymentValidationDetail>(`${this.apiUrl}/admin/payment-validations/${id}`);
  }
}
