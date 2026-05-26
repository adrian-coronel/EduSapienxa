import { inject, Injectable, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { ENVIRONMENT } from '../tokens';
import { AgentConfig, AgentConfigDetail, CreateAgentConfigDto, UpdateAgentConfigDto } from '../models/agent-config.model';
import { tap } from 'rxjs/operators';

@Injectable({ providedIn: 'root' })
export class AgentConfigService {
  private http = inject(HttpClient);
  private apiUrl = inject(ENVIRONMENT).apiUrl;

  agents = signal<AgentConfig[]>([]);
  loading = signal(false);

  loadAll() {
    this.loading.set(true);
    this.http.get<AgentConfig[]>(`${this.apiUrl}/admin/agents`).subscribe({
      next: data => { this.agents.set(data); this.loading.set(false); },
      error: () => this.loading.set(false)
    });
  }

  getById(id: string) {
    return this.http.get<AgentConfigDetail>(`${this.apiUrl}/admin/agents/${id}`);
  }

  create(dto: CreateAgentConfigDto) {
    return this.http.post<{ id: string }>(`${this.apiUrl}/admin/agents`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  update(id: string, dto: UpdateAgentConfigDto) {
    return this.http.put(`${this.apiUrl}/admin/agents/${id}`, dto).pipe(
      tap(() => this.loadAll())
    );
  }

  delete(id: string) {
    return this.http.delete(`${this.apiUrl}/admin/agents/${id}`).pipe(
      tap(() => this.loadAll())
    );
  }
}
