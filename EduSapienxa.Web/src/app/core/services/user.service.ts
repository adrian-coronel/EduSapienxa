import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { AppUser, CreateUserDto, UpdateUserDto } from '../models/user.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class UserService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  users = signal<AppUser[]>([]);
  loading = signal(false);
  error = signal<string | null>(null);

  loadAll() {
    this.loading.set(true);
    this.http.get<AppUser[]>(`${this.apiUrl}/users`).subscribe({
      next: data => { this.users.set(data); this.loading.set(false); },
      error: err => { this.error.set(err.message); this.loading.set(false); }
    });
  }

  create(dto: CreateUserDto) {
    return this.http.post<AppUser>(`${this.apiUrl}/users`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdateUserDto) {
    return this.http.put<AppUser>(`${this.apiUrl}/users/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  deactivate(id: string) {
    return this.http.delete(`${this.apiUrl}/users/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
