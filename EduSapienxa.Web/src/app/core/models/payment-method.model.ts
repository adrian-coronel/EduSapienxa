export interface PaymentMethod {
  id: string;
  name: string;
  description?: string;
  image?: string;
  limitAmount: number;
}

export interface CreatePaymentMethodDto {
  name: string;
  description?: string;
  image?: string;
  limitAmount: number;
}

export type UpdatePaymentMethodDto = CreatePaymentMethodDto;
