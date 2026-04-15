export interface Course {
  id: number;
  name: string;
  description?: string;
  price: number;
  checkoutUrl: string;
  isActive?: boolean;
  subcategoryIds?: number[];
  subcategoryNames?: string[];
}

export interface CreateCourseDto {
  name: string;
  description?: string;
  price: number;
  checkoutUrl: string;
  isActive?: boolean;
  subcategoryIds?: number[];
}

export interface UpdateCourseDto {
  name: string;
  description?: string;
  price: number;
  checkoutUrl: string;
  isActive?: boolean;
  subcategoryIds?: number[];
}
