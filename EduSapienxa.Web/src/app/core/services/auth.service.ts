import { inject, Injectable, signal, computed } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { ENVIRONMENT } from '../tokens';
import { LoginRequest, LoginResponse, TokenClaims } from '../models/auth.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private http = inject(HttpClient);
  private router = inject(Router);
  private env = inject(ENVIRONMENT);

  private _token = signal<string | null>(localStorage.getItem('token'));
  private _claims = signal<TokenClaims | null>(this.parseToken(localStorage.getItem('token')));

  currentUser = this._claims.asReadonly();
  isAuthenticated = computed(() => !!this._token());

  login(dto: LoginRequest) {
    return this.http.post<LoginResponse>(`${this.env.apiUrl}/auth/login`, dto).pipe(
      tap(res => {
        localStorage.setItem('token', res.token);
        this._token.set(res.token);
        this._claims.set(this.parseToken(res.token));
      })
    );
  }

  logout() {
    localStorage.removeItem('token');
    this._token.set(null);
    this._claims.set(null);
    this.router.navigate(['/login']);
  }

  getToken(): string | null {
    return this._token();
  }

  hasRole(role: string): boolean {
    return this._claims()?.role === role;
  }

  private parseToken(token: string | null): TokenClaims | null {
    if (!token) return null;
    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return {
        userId: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/nameidentifier'] ?? payload.sub ?? payload.userId,
        email: payload['http://schemas.xmlsoap.org/ws/2005/05/identity/claims/emailaddress'] ?? payload.email,
        role: (payload['http://schemas.microsoft.com/ws/2008/06/identity/claims/role'] ?? payload.role ?? 'editor').toLowerCase()
      };
    } catch {
      return null;
    }
  }
}
