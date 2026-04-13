import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf } from '@angular/common';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { RouterLink } from '@angular/router';
import { CourseService } from '../../../core/services/course.service';
import { SubcategoryService } from '../../../core/services/subcategory.service';
import { Course } from '../../../core/models/course.model';
import { DataTableComponent, TableColumn } from '../../../shared/components/data-table/data-table.component';
import { PageHeaderComponent } from '../../../shared/components/page-header/page-header.component';
import { tableActionIconButton } from '../../../shared/utils/table-action-icons';

@Component({
  selector: 'app-courses',
  standalone: true,
  imports: [NgFor, NgIf, ReactiveFormsModule, RouterLink, DataTableComponent, PageHeaderComponent],
  template: `
    <app-page-header title="Cursos" description="Gestiona el catálogo de cursos">
      <button (click)="openCreate()" class="btn-primary">
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 mr-2">
          <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
        </svg>
        Nuevo curso
      </button>
    </app-page-header>

    <div class="mb-6 flex gap-1 rounded-lg border border-[var(--color-border)] bg-[var(--color-muted)] p-1 w-fit">
      <a routerLink="/catalog/categories" class="tab">Categorías</a>
      <a routerLink="/catalog/subcategories" class="tab">Subcategorías</a>
      <a routerLink="/catalog/courses" class="tab-active">Cursos</a>
    </div>

    <app-data-table [columns]="columns" [data]="service.courses()" [loading]="service.loading()" />

    <div *ngIf="showModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4 overflow-y-auto">
      <div class="absolute inset-0 bg-black/50" (click)="closeModal()"></div>
      <div class="relative w-full max-w-lg rounded-xl bg-[var(--color-card)] p-6 shadow-xl my-4">
        <h3 class="mb-5 text-lg font-semibold text-[var(--color-foreground)]">
          {{ editingId() ? 'Editar curso' : 'Nuevo curso' }}
        </h3>
        <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-4">
          <div>
            <label class="form-label">Nombre</label>
            <input formControlName="name" type="text" class="form-input" placeholder="Ej: Angular Avanzado" />
            <p *ngIf="isInvalid('name')" class="form-error">El nombre es requerido.</p>
          </div>
          <div>
            <label class="form-label">Descripción</label>
            <textarea formControlName="description" rows="3" class="form-input resize-none"></textarea>
          </div>
          <div class="grid grid-cols-2 gap-4">
            <div>
              <label class="form-label">Precio</label>
              <input formControlName="price" type="number" min="0" step="0.01" class="form-input" placeholder="0.00" />
              <p *ngIf="isInvalid('price')" class="form-error">El precio es requerido.</p>
            </div>
            <div class="flex items-end pb-1">
              <label class="flex items-center gap-2 text-sm text-[var(--color-foreground)]">
                <input formControlName="isActive" type="checkbox" class="h-4 w-4 rounded accent-[oklch(45%_0.2_260)]" />
                Activo
              </label>
            </div>
          </div>
          <div>
            <label class="form-label">URL de checkout</label>
            <input formControlName="checkoutUrl" type="url" class="form-input" placeholder="https://..." />
            <p *ngIf="isInvalid('checkoutUrl')" class="form-error">Ingresa una URL válida.</p>
          </div>
          <div>
            <label class="form-label">Subcategorías</label>
            <div class="max-h-40 overflow-y-auto rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] p-2 space-y-1">
              <label *ngFor="let sub of subService.subcategories()" class="flex items-center gap-2 text-sm text-[var(--color-foreground)] cursor-pointer hover:bg-[var(--color-muted)] rounded px-2 py-1">
                <input
                  type="checkbox"
                  [value]="sub.id"
                  [checked]="isSubSelected(sub.id)"
                  (change)="toggleSub(sub.id, $event)"
                  class="h-4 w-4 rounded accent-[oklch(45%_0.2_260)]"
                />
                {{ sub.name }}
              </label>
            </div>
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
    .tab { @apply rounded-md px-4 py-1.5 text-sm font-medium text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors; }
    .tab-active { @apply rounded-md bg-[var(--color-card)] px-4 py-1.5 text-sm font-medium text-[var(--color-foreground)] shadow-sm; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
    .form-error { @apply mt-1 text-xs text-red-500; }
  `]
})
export class CoursesComponent implements OnInit {
  service = inject(CourseService);
  subService = inject(SubcategoryService);
  private fb = inject(FormBuilder);

  showModal = signal(false);
  editingId = signal<number | null>(null);
  saving = signal(false);
  selectedSubIds = signal<number[]>([]);

  form = this.fb.group({
    name: ['', Validators.required],
    description: [''],
    price: [0, [Validators.required, Validators.min(0)]],
    checkoutUrl: ['', [Validators.required, Validators.pattern('https?://.*')]],
    isActive: [true]
  });

  columns: TableColumn<Course>[] = [
    { key: 'name', label: 'Nombre' },
    {
      key: 'price', label: 'Precio',
      template: (row) => `<span>$${row.price.toFixed(2)}</span>`
    },
    {
      key: 'checkoutUrl', label: 'Checkout',
      template: (row) => `<a href="${row.checkoutUrl}" target="_blank" class="text-xs text-blue-600 hover:underline">Ver link</a>`
    },
    {
      key: 'isActive', label: 'Estado',
      template: (row) => {
        const active = row.isActive ?? true;
        return `<span class="${active ? 'inline-flex items-center rounded-full bg-green-50 px-2.5 py-0.5 text-xs font-semibold text-green-700' : 'inline-flex items-center rounded-full bg-gray-100 px-2.5 py-0.5 text-xs font-semibold text-gray-600'}">${active ? 'Activo' : 'Inactivo'}</span>`;
      }
    },
    {
      key: 'actions', label: 'Acciones',
      template: (row) => {
        const active = row.isActive ?? true;
        const toggleTitle = active ? 'Desactivar curso' : 'Activar curso';
        const toggleIcon = active ? 'toggle-on' : 'toggle-off';
        const toggleTone = active ? 'warning' : 'success';
        return `<div class="flex items-center gap-1">
          ${tableActionIconButton(`window.__editCourse(${row.id})`, 'Editar curso', 'edit', 'primary')}
          ${tableActionIconButton(`window.__toggleCourse(${row.id})`, toggleTitle, toggleIcon, toggleTone)}
        </div>`;
      }
    }
  ];

  ngOnInit() {
    this.service.loadAll();
    this.subService.loadAll();
    (window as any).__editCourse = (id: number) => this.openEdit(id);
    (window as any).__toggleCourse = (id: number) => this.toggleActive(id);
  }

  isSubSelected(id: number) {
    return this.selectedSubIds().includes(id);
  }

  toggleSub(id: number, event: Event) {
    const checked = (event.target as HTMLInputElement).checked;
    if (checked) {
      this.selectedSubIds.set([...this.selectedSubIds(), id]);
    } else {
      this.selectedSubIds.set(this.selectedSubIds().filter(i => i !== id));
    }
  }

  openCreate() {
    this.editingId.set(null);
    this.selectedSubIds.set([]);
    this.form.reset({ isActive: true, price: 0 });
    this.showModal.set(true);
  }

  openEdit(id: number) {
    const course = this.service.courses().find(c => c.id === id);
    if (!course) return;
    this.editingId.set(id);
    this.selectedSubIds.set(course.subcategoryIds ?? []);
    this.form.patchValue({
      name: course.name,
      description: course.description ?? '',
      price: course.price,
      checkoutUrl: course.checkoutUrl,
      isActive: course.isActive ?? true
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
    const dto = { ...this.form.value as any, subcategoryIds: this.selectedSubIds() };
    const obs = this.editingId()
      ? this.service.update(this.editingId()!, dto)
      : this.service.create(dto);

    obs.subscribe({
      next: () => { this.saving.set(false); this.closeModal(); },
      error: () => this.saving.set(false)
    });
  }

  toggleActive(id: number) {
    const course = this.service.courses().find(c => c.id === id);
    if (!course) return;
    this.service.update(id, {
      name: course.name,
      description: course.description,
      price: course.price,
      checkoutUrl: course.checkoutUrl,
      subcategoryIds: course.subcategoryIds ?? [],
      isActive: !(course.isActive ?? true)
    }).subscribe({
      error: () => this.service.loadAll()
    });
  }
}
