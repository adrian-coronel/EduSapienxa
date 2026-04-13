export type LeadStatus = 'new' | 'contacted' | 'interested' | 'converted' | 'lost';
export type LeadSource = 'whatsapp' | 'manual';

export interface Lead {
  id: number;
  name: string;
  phone?: string;
  email?: string;
  whatsAppId?: string;
  source: LeadSource;
  status: LeadStatus;
  lastInteraction?: string;
  interests?: LeadInterest[];
}

export interface LeadInterest {
  id: number;
  leadId: number;
  courseId: number;
  courseName: string;
  notes?: string;
  createdAt: string;
}

export interface CreateLeadDto {
  name: string;
  phone: string;
  email?: string;
  source: LeadSource;
  status: LeadStatus;
}

export interface UpdateLeadDto {
  name: string;
  phone?: string;
  email?: string;
  status: LeadStatus;
}

export interface CreateLeadInterestDto {
  courseId: number;
  notes?: string;
}
