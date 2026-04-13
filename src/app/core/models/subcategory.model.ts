export interface Subcategory {
  id: number;
  name: string;
  description: string;
  isActive: boolean;
  categoryId: number;
  categoryName?: string;
}

export interface CreateSubcategoryDto {
  name: string;
  description: string;
  isActive: boolean;
  categoryId: number;
}

export interface UpdateSubcategoryDto {
  name: string;
  description: string;
  isActive: boolean;
  categoryId: number;
}
