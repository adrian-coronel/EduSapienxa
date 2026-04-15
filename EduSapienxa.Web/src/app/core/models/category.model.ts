export interface Category {
  id: number;
  name: string;
  description?: string;
  isActive?: boolean;
  subcategories?: import('./subcategory.model').Subcategory[];
}

export interface CreateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}

export interface UpdateCategoryDto {
  name: string;
  description?: string;
  isActive?: boolean;
}
