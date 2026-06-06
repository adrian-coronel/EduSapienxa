export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}

export type AdminRole = 'superadmin' | 'admin' | 'editor';

export interface TokenClaims {
  userId: string;
  email: string;
  role: AdminRole;
  companyId?: string;
  companyName?: string;
}
