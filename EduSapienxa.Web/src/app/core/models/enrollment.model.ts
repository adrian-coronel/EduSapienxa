export type EnrollmentStatus =
  | 'Interesado'
  | 'Pendiente Pago'
  | 'Pagado'
  | 'Escalado a Humano'
  | 'Inactivo';

export interface Enrollment {
  id: string;
  status: EnrollmentStatus;
  totalCost?: number;
  voucher?: string;
  observation?: string;
  leadId: string;
  leadName?: string;
  leadPhone?: string;
  catalogItemId: string;
  courseTitle?: string;
  courseCost?: number;
  paymentMethodId?: string;
  paymentMethodName?: string;
}

export interface EnrollmentDetail extends Enrollment {
  lead?: { id: string; name: string; phoneNumber: string; email?: string };
  catalogItem?: { id: string; title: string; cost: number; instructorName?: string };
  paymentMethod?: { id: string; name: string };
}
