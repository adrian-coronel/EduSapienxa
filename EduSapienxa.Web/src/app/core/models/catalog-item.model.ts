export interface CatalogItem {
  id: string;
  code?: string;
  title: string;
  shortDescription?: string;
  features?: string;
  details?: string;
  syllabus?: string;
  projects?: string;
  link?: string;
  cost: number;
  places?: string;
  availablePlaces?: string;
  startDate?: string;
  instructorId?: string;
  instructorName?: string;
}

export interface CreateCatalogItemDto {
  title: string;
  cost: number;
  code?: string;
  shortDescription?: string;
  features?: string;
  details?: string;
  syllabus?: string;
  projects?: string;
  link?: string;
  instructorId?: string;
  places?: string;
  availablePlaces?: string;
  startDate?: string;
}

export type UpdateCatalogItemDto = CreateCatalogItemDto;
