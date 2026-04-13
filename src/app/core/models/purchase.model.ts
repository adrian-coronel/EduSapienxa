import { AppUser } from './user.model';

export interface PurchaseLeadRef {
  id: number;
  name: string;
  email?: string;
  whatsAppId?: string;
  status?: string;
  source?: string;
}

export interface PurchaseCourseRef {
  id: number;
  name: string;
  description?: string;
  price: number;
  checkoutUrl?: string;
  isActive?: boolean;
}

export interface Purchase {
  id: number;
  leadId: number;
  courseId: number;
  amountPaid: number;
  registeredById: string;
  notes?: string;
  purchasedAt: string;
  createdAt: string;
  updatedAt: string;
  lead?: PurchaseLeadRef;
  course?: PurchaseCourseRef;
  registeredBy?: AppUser;
}

export interface CreatePurchaseDto {
  leadId: number;
  courseId: number;
  amountPaid: number;
  notes?: string;
}
