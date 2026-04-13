import { Component, inject, signal, OnInit } from '@angular/core';
import { NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { CategoryService } from '../../../core/services/category.service';
import { Category } from '../../../core/models/category.model';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { ConfirmModalComponent } from '../../../shared/components/confirm-modal/confirm-modal.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';

@Component({
  selector: 'app-categories',
  standalone: true,
  imports: [NgIf, ReactiveFormsModule, DataTableComponent, ConfirmModalComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Categorías" description="Gestiona las categorías del catálogo">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nueva categoría
      </button>
    </app-page-header>

    <!-- Catalog nav tabs -->
    <div class="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-1 w-fit">
      <a routerLink="/catalog/categories" class="tab-active">Categorías</a>
      <a routerLink="/catalog/subcategories" class="tab">Subcategorías</a>
      <a routerLink="/catalog/courses" class="tab">Cursos</a>
    </div>

    <app-data-table [columns]="columns" [data]="service.categories()" [loading]="service.loading()">
      <div slot="actions"></div>
    </app-data-table>

    <!-- Create/Edit Modal -->
    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar categoría' : 'Nueva categoría' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre</label>
            <input formControlName="name" type="text" class="form-input" placeholder="Ej: Tecnología" />
            <p *ngIf="isInvalid('name')" class="form-error">El nombre es requerido.</p>
          </div>
          <div>
            <label class="form-label">Descripción</label>
            <textarea formControlName="description" rows="3" class="form-input resize-none" placeholder="Descripción de la categoría"></textarea>
          </div>
          <div class="flex items-center gap-2">
            <input formControlName="isActive" type="checkbox" id="isActive" class="h-4 w-4 rounded border-[var(--color-border)] accent-[oklch(45%_0.2_260)]" />
            <label for="isActive" class="text-sm text-[var(--color-foreground)]">Activa</label>
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

    <app-confirm-modal
      [open]="showConfirm()"
      title="Eliminar categoría"
      message="¿Estás seguro de que quieres eliminar esta categoría? Esta acción no se puede deshacer."
      confirmLabel="Eliminar"
      (confirm)="onDelete()"
      (cancel)="showConfirm.set(false)"
    />
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-60; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .tab { @apply rounded-md px-4 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors; }
    .tab-active { @apply rounded-md bg-[var(--color-card)] px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)] transition-colors; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class CategoriesComponent implements OnInit {
  service = inject(CategoryService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  showConfirm = signal(false);
  editingId = signal<number | null>(null);
  deletingId = signal<number | null>(null);
  saving = signal(false);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    isActive: [true]
  });

  columns: TableColumn<Category>[] = [
    { key: 'name', label: 'Nombre' },
    { key: 'description', label: 'Descripción' },
    {
      key: 'isActive', label: 'Estado',
      template: (row) => `<span class="${row.isActive ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700' : 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'}">${row.isActive ? 'Activa' : 'Inactiva'}</span>`
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => `<div class="flex gap-2">
        <button onclick="window.__editCategory(${row.id})" class="text-xs text-blue-600 hover:underline">Editar</button>
        <button onclick="window.__deleteCategory(${row.id})" class="text-xs text-red-600 hover:underline">Eliminar</button>
      </div>`
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    (window as any).__editCategory = (id: number) => this.openEdit(id);
    (window as any).__deleteCategory = (id: number) => {
      this.deletingId.set(id);
      this.showConfirm.set(true);
    };
  }

  openCreate() {
    this.editingId.set(null);
    this.form.reset({ isActive: true });
    this.showModal.set(true);
  }

  openEdit(id: number) {
    const cat = this.service.categories().find(c => c.id === id);
    if (!cat) return;
    this.editingId.set(id);
    this.form.patchValue(cat);
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
    const dto = this.form.value as any;
    const obs = this.editingId()
      ? this.service.update(this.editingId()!, dto)
      : this.service.create(dto);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false)
    });
  }

  onDelete() {
    if (!this.deletingId()) return;
    this.service.delete(this.deletingId()!).subscribe({
      next: () => this.showConfirm.set(false),
      error: () => this.showConfirm.set(false)
    });
  }
}
