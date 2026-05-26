import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { AgentConfigService } from '../../core/services/agent-config.service';
import { AgentConfig } from '../../core/models/agent-config.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { FieldTooltipComponent } from '../../shared/components/field-tooltip/field-tooltip.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-agents',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent, FieldTooltipComponent],
  template: `
    <app-page-header title="Agentes IA" description="Configura los agentes del chatbot: prompts, modelos y parámetros">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo agente
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.agents()" [loading]="service.loading()" />

    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar agente' : 'Nuevo agente' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label flex items-center gap-1.5">
                Nombre *
                <app-field-tooltip text="Nombre descriptivo para identificar el agente en el panel. No afecta al chatbot." />
              </label>
              <input formControlName="name" type="text" class="form-input" />
              <p *ngIf="isInvalid('name')" class="form-error">Requerido.</p>
            </div>
            <div>
              <label class="form-label flex items-center gap-1.5">
                Clave (agentKey) *
                <app-field-tooltip text="Identificador único con el que el chatbot busca este agente en la BD. Claves válidas: cursos_general (agente por defecto), cursos_pagos (se activa al detectar intención de pago), cursos_intent (clasificador de intenciones). No se puede cambiar después de creado." />
              </label>
              <input formControlName="agentKey" type="text" class="form-input" placeholder="Ej: cursos_general" [readonly]="!!editingId()" />
              <p *ngIf="isInvalid('agentKey')" class="form-error">Requerido.</p>
            </div>
          </div>
          <div>
            <label class="form-label flex items-center gap-1.5">
              Descripción
              <app-field-tooltip text="Texto libre para documentar el propósito de este agente. Solo visible en el panel de administración." />
            </label>
            <input formControlName="description" type="text" class="form-input" />
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label flex items-center gap-1.5">
                Modelo *
                <app-field-tooltip text="Identificador exacto del modelo LLM a usar. Debe ser válido para el proveedor configurado en la API. Ej: meta-llama/llama-3.3-70b-instruct" />
              </label>
              <input formControlName="model" type="text" class="form-input" placeholder="Ej: meta-llama/llama-3.3-70b-instruct" />
              <p *ngIf="isInvalid('model')" class="form-error">Requerido.</p>
            </div>
            <div>
              <label class="form-label flex items-center gap-1.5">
                Temperatura
                <app-field-tooltip text="Creatividad de las respuestas. 0.0–0.3: respuestas consistentes y predecibles (recomendado para ventas). 0.7–1.0: más variedad y creatividad. Rango: 0 a 2." />
              </label>
              <input formControlName="temperature" type="number" min="0" max="2" step="0.1" class="form-input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label flex items-center gap-1.5">
                Ventana de memoria
                <app-field-tooltip text="Cantidad de mensajes anteriores que se pasan al modelo como contexto de conversación. Más ventana = el agente recuerda más, pero consume más tokens por llamada." />
              </label>
              <input formControlName="memoryWindow" type="number" min="1" class="form-input" />
            </div>
            <div>
              <label class="form-label flex items-center gap-1.5">
                Max tokens
                <app-field-tooltip text="Límite máximo de tokens que el modelo puede generar en una sola respuesta. Déjalo vacío para usar el límite por defecto del modelo. Útil para controlar costos o evitar respuestas muy largas." />
              </label>
              <input formControlName="maxTokens" type="number" min="0" class="form-input" />
            </div>
          </div>
          <div>
            <label class="form-label flex items-center gap-1.5">
              System Prompt *
              <app-field-tooltip text="Instrucción maestra que define la personalidad, objetivos y restricciones del agente. Es lo que más impacta en la calidad del chatbot. Indica quién es, cómo debe comportarse y qué puede hacer." />
            </label>
            <textarea formControlName="systemPrompt" rows="8" class="form-input resize-none font-mono text-xs"></textarea>
            <p *ngIf="isInvalid('systemPrompt')" class="form-error">Requerido.</p>
          </div>
          <div *ngIf="editingId()" class="flex items-center gap-2">
            <input formControlName="isActive" type="checkbox" id="isActive" class="h-4 w-4 rounded accent-[oklch(45%_0.2_260)]" />
            <label for="isActive" class="text-sm text-[var(--color-foreground)]">Activo</label>
            <app-field-tooltip text="Si se desactiva cursos_general, el chatbot no podrá procesar ningún mensaje entrante." />
          </div>
          <div class="flex gap-3 pt-2">
            <button type="button" (click)="closeModal()" class="btn-secondary flex-1">Cancelar</button>
            <button type="submit" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Guardando...' : 'Guardar' }}
            </button>
          </div>
        </form>
      </div>
    </div>
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class AgentsComponent implements OnInit {
  service = inject(AgentConfigService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    agentKey: ['', Validators.required],
    description: [''],
    model: ['', Validators.required],
    temperature: [0.2],
    memoryWindow: [10],
    maxTokens: [null as number | null],
    systemPrompt: ['', Validators.required],
    isActive: [true]
  });

  columns: TableColumn<AgentConfig>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'agentKey', label: 'Clave' },
    { key: 'model', label: 'Modelo' },
    {
      key: 'temperature', label: 'Temperatura',
      template: (row) => `<span>${row.temperature}</span>`
    },
    {
      key: 'isActive', label: 'Estado',
      template: (row) => `<span class="${row.isActive ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700' : 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'}">${row.isActive ? 'Activo' : 'Inactivo'}</span>`
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__editAgent('${row.id}')`, 'Editar', 'edit', 'primary')}
        ${tableActionIconButton(`window.__deleteAgent('${row.id}')`, 'Eliminar', 'delete', 'danger')}
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__editAgent = (id: string) => this.openEdit(id);
    (window as any).__deleteAgent = (id: string) => this.delete(id);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ temperature: 0.2, memoryWindow: 10, isActive: true });
    this.form.get('agentKey')?.enable();
    this.showModal.set(true);
  }

  openEdit(id: string) {
    this.service.getById(id).subscribe(agent => {
      this.editingId.set(id);
      this.form.patchValue({
        name: agent.name,
        agentKey: agent.agentKey,
        description: agent.description ?? '',
        model: agent.model,
        temperature: agent.temperature,
        memoryWindow: agent.memoryWindow,
        maxTokens: agent.maxTokens ?? null,
        systemPrompt: agent.systemPrompt,
        isActive: agent.isActive
      });
      this.form.get('agentKey')?.disable();
      this.showModal.set(true);
    });
  }

  closeModal() { this.showModal.set(false); this.editingId.set(null); }
  isInvalid(f: string) { const c = this.form.get(f); return c?.invalid && c?.touched; }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.getRawValue() as any;

    const obs = this.editingId()
      ? this.service.update(this.editingId()!, {
          name: val.name, systemPrompt: val.systemPrompt, model: val.model,
          temperature: val.temperature, memoryWindow: val.memoryWindow,
          isActive: val.isActive, maxTokens: val.maxTokens || undefined,
          description: val.description || undefined
        })
      : this.service.create({
          agentKey: val.agentKey, name: val.name, systemPrompt: val.systemPrompt,
          model: val.model, temperature: val.temperature, memoryWindow: val.memoryWindow,
          maxTokens: val.maxTokens || undefined, description: val.description || undefined
        });

    obs.subscribe({ next: () => { this.saving.set(false); this.closeModal(); }, error: () => this.saving.set(false) });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este agente?')) return;
    this.service.delete(id).subscribe();
  }
}
