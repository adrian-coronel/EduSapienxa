export interface Company {
  id: string;
  name: string;
  slug: string;
  isActive: boolean;
  createdAt: string;
}

export interface CreateCompanyDto {
  name: string;
  slug: string;
}

export interface UpdateCompanyDto {
  name: string;
  isActive: boolean;
}
