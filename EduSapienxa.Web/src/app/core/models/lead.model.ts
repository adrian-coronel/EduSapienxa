export type LeadStatus = 'New' | 'Interesado' | 'EscaladoAHumano';

export interface Lead {
  id: string;
  name?: string;
  email?: string;
  phoneNumber: string;
  contactMethod?: string;
  status: string;
  salesAgentId?: string;
  salesAgentName?: string;
}

export interface LeadDetail extends Lead {
  salesAgent?: { id: string; agentName: string; email?: string };
  enrollments?: LeadEnrollment[];
}

export interface LeadEnrollment {
  id: string;
  status: string;
  totalCost?: number;
  voucher?: string;
  observation?: string;
  catalogItemId: string;
  courseTitle?: string;
}

export interface UpdateLeadDto {
  name?: string;
  email?: string;
  salesAgentId?: string;
}
