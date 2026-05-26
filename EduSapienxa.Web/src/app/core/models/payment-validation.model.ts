export type PaymentValidationStatus = 'Pendiente' | 'Aprobado' | 'Inválido' | 'Expirado';

export interface PaymentValidation {
  id: string;
  enrollmentId: string;
  voucherDetail?: string;
  voucherUrl?: string;
  status: PaymentValidationStatus;
  requestedBy?: string;
  resolvedBy?: string;
  observation?: string;
  requestedAt: string;
  resolvedAt?: string;
}

export interface PaymentValidationDetail extends PaymentValidation {
  enrollment?: {
    id: string;
    leadName?: string;
    leadPhone?: string;
    courseTitle?: string;
    totalCost?: number;
  };
}
