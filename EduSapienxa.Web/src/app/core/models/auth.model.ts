export interface LoginRequest {
  email: string;
  password: string;
}

export interface LoginResponse {
  token: string;
  expiration: string;
}

export interface TokenClaims {
  userId: string;
  email: string;
  role: 'admin' | 'editor';
}
