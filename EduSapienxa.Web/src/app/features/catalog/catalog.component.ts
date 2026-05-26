import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CatalogService } from '../../core/services/catalog.service';
import { InstructorService } from '../../core/services/instructor.service';
import { CatalogItem } from '../../core/models/catalog-item.model';
import { DataTableComponent, TableColumn } from '../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../shared/utils/table-action-icons';

@Component({
  selector: 'app-catalog',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Cursos" description="Gestiona el catálogo de cursos del chatbot">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo curso
      </button>
    </app-page-header>

    <app-data-table [columns]="columns" [data]="service.items()" [loading]="service.loading()" />

    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar curso' : 'Nuevo curso' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Título *</label>
              <input formControlName="title" type="text" class="form-input" placeholder="Ej: Angular Avanzado" />
              <p *ngIf="isInvalid('title')" class="form-error">Requerido.</p>
            </div>
            <div>
              <label class="form-label">Código</label>
              <input formControlName="code" type="text" class="form-input" placeholder="Ej: ANG-101" />
            </div>
          </div>
          <div>
            <label class="form-label">Descripción corta</label>
            <textarea formControlName="shortDescription" rows="2" class="form-input resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Costo *</label>
              <input formControlName="cost" type="number" min="0" step="0.01" class="form-input" />
              <p *ngIf="isInvalid('cost')" class="form-error">Requerido.</p>
            </div>
            <div>
              <label class="form-label">Fecha inicio</label>
              <input formControlName="startDate" type="date" class="form-input" />
            </div>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Cupos totales</label>
              <input formControlName="places" type="text" class="form-input" placeholder="Ej: 30" />
            </div>
            <div>
              <label class="form-label">Cupos disponibles</label>
              <input formControlName="availablePlaces" type="text" class="form-input" placeholder="Ej: 15" />
            </div>
          </div>
          <div>
            <label class="form-label">Instructor</label>
            <select formControlName="instructorId" class="form-input">
              <option value="">Sin instructor</option>
              <option *ngFor="let i of instructorService.instructors()" [value]="i.id">{{ i.name }}</option>
            </select>
          </div>
          <div>
            <label class="form-label">Link de registro</label>
            <input formControlName="link" type="url" class="form-input" placeholder="https://..." />
          </div>
          <div>
            <label class="form-label">Características</label>
            <textarea formControlName="features" rows="2" class="form-input resize-none" placeholder="Una por línea"></textarea>
          </div>
          <div>
            <label class="form-label">Syllabus</label>
            <textarea formControlName="syllabus" rows="3" class="form-input resize-none"></textarea>
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
export class CatalogComponent implements OnInit {
  service = inject(CatalogService);
  instructorService = inject(InstructorService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  editingId = signal<string | null>(null);
  saving = signal(false);

  form = this.fb.group({
    title: ['', Validators.required],
    code: [''],
    shortDescription: [''],
    cost: [0, [Validators.required, Validators.min(0)]],
    startDate: [''],
    places: [''],
    availablePlaces: [''],
    instructorId: [''],
    link: [''],
    features: [''],
    syllabus: [''],
    details: [''],
    projects: ['']
  });

  columns: TableColumn<CatalogItem>[] = [
    { key: 'title', label: 'Título' },
    { key: 'code', label: 'Código' },
    {
      key: 'cost', label: 'Costo',
      template: (row) => `<span>$${row.cost.toFixed(2)}</span>`
    },
    { key: 'instructorName', label: 'Instructor' },
    {
      key: 'availablePlaces', label: 'Cupos',
      template: (row) => `<span>${row.availablePlaces ?? '—'} / ${row.places ?? '—'}</span>`
    },
    {
      key: 'startDate', label: 'Inicio',
      template: (row) => row.startDate ? `<span>${row.startDate}</span>` : '<span class="text-gray-400">—</span>'
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex items-center gap-1">
        ${tableActionIconButton(`window.__editCatalogItem('${row.id}')`, 'Editar', 'edit', 'primary')}
        ${tableActionIconButton(`window.__deleteCatalogItem('${row.id}')`, 'Eliminar', 'delete', 'danger')}
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    this.instructorService.loadAll();
    (window as any).__editCatalogItem = (id: string) => this.openEdit(id);
    (window as any).__deleteCatalogItem = (id: string) => this.delete(id);
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ cost: 0 });
    this.showModal.set(true);
  }

  openEdit(id: string) {
    const item = this.service.items().find(i => i.id === id);
    if (!item) return;
    this.editingId.set(id);
    this.form.patchValue({
      title: item.title,
      code: item.code ?? '',
      shortDescription: item.shortDescription ?? '',
      cost: item.cost,
      startDate: item.startDate ?? '',
      places: item.places ?? '',
      availablePlaces: item.availablePlaces ?? '',
      instructorId: item.instructorId ?? '',
      link: item.link ?? '',
      features: item.features ?? '',
      syllabus: item.syllabus ?? ''
    });
    this.showModal.set(true);
  }

  closeModal() {
    this.showModal.set(false);
    this.editingId.set(null);
  }

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
    if (this.form.invalid) { this.form.markAllAsTouched(); return; }
    this.saving.set(true);
    const val = this.form.value as any;
    const dto = {
      title: val.title,
      cost: val.cost,
      code: val.code || undefined,
      shortDescription: val.shortDescription || undefined,
      features: val.features || undefined,
      syllabus: val.syllabus || undefined,
      details: val.details || undefined,
      projects: val.projects || undefined,
      link: val.link || undefined,
      instructorId: val.instructorId || undefined,
      places: val.places || undefined,
      availablePlaces: val.availablePlaces || undefined,
      startDate: val.startDate || undefined
    };

    const obs = this.editingId()
      ? this.service.update(this.editingId()!, dto)
      : this.service.create(dto);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false)
    });
  }

  delete(id: string) {
    if (!confirm('¿Eliminar este curso?')) return;
    this.service.delete(id).subscribe();
  }
}
