export type UserRole = 'superadmin' | 'admin' | 'editor';

export interface AppUser {
  id: string;
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  companyId?: string | null;
}

export interface CreateUserDto {
  name: string;
  email: string;
  password: string;
  role: UserRole;
  companyId?: string | null;
}

export interface UpdateUserDto {
  name: string;
  email: string;
  role: UserRole;
  isActive: boolean;
  password?: string;
}
