export interface Purchase {
  id: number;
  leadId: number;
  leadName: string;
  courseId: number;
  courseName: string;
  amountPaid: number;
  notes?: string;
  purchaseDate: string;
  registeredBy: string;
}

export interface CreatePurchaseDto {
  leadId: number;
  courseId: number;
  amountPaid: number;
  notes?: string;
}
