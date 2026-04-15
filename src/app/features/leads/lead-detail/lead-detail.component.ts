import { Component, inject, signal, OnInit } from '@angular/core';
import { DatePipe, CurrencyPipe } from '@angular/common';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { LeadService } from '../../../core/services/lead.service';
import { PurchaseService } from '../../../core/services/purchase.service';
import { CourseService } from '../../../core/services/course.service';
import { Lead, LeadInterest, LeadStatus } from '../../../core/models/lead.model';
import { Purchase } from '../../../core/models/purchase.model';
import { Course } from '../../../core/models/course.model';
import { BadgeStatusComponent } from '../../../shared/components/badge-status/badge-status.component';

@Component({
  selector: 'app-lead-detail',
  standalone: true,
  imports: [RouterLink, ReactiveFormsModule, BadgeStatusComponent, DatePipe, CurrencyPipe],
  template: `
    @if (loading()) {
      <div class="space-y-4">
        <div class="h-10 w-48 animate-pulse rounded-lg bg-[var(--color-muted)]"></div>
        <div class="h-48 animate-pulse rounded-xl bg-[var(--color-muted)]"></div>
      </div>
    }

    @if (!loading() && lead()) {
      <!-- Back link -->
      <div class="mb-4">
        <a routerLink="/leads" class="flex items-center gap-1.5 text-sm text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors">
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M15 19l-7-7 7-7"/>
          </svg>
          Volver a leads
        </a>
      </div>

      <div class="grid grid-cols-1 gap-6 lg:grid-cols-3">
        <!-- Lead card -->
        <div class="lg:col-span-1 space-y-5">
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div class="flex items-start justify-between mb-4">
              <div class="flex items-center gap-3">
                <div class="flex h-12 w-12 items-center justify-center rounded-full bg-[oklch(45%_0.2_260)] text-xl font-bold text-white">
                  {{ lead()!.name.charAt(0).toUpperCase() }}
                </div>
                <div>
                  <h1 class="text-lg font-bold text-[var(--color-foreground)]">{{ lead()!.name }}</h1>
                  <app-badge-status [status]="lead()!.status" />
                </div>
              </div>
              <button
                (click)="onOpenEdit()"
                title="Editar lead"
                aria-label="Editar lead"
                class="btn-primary h-9 w-9 !p-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 pointer-events-none">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 20h9"/>
                  <path stroke-linecap="round" stroke-linejoin="round" d="M16.5 3.5a2.121 2.121 0 013 3L7 19l-4 1 1-4 12.5-12.5z"/>
                </svg>
              </button>
            </div>

            <dl class="space-y-3 text-sm">
              @if (lead()!.whatsAppId || lead()!.phone) {
                <div class="flex justify-between">
                  <dt class="text-[var(--color-muted-foreground)]">Teléfono</dt>
                  <dd class="font-medium text-[var(--color-foreground)]">{{ lead()!.whatsAppId || lead()!.phone }}</dd>
                </div>
              }
              @if (lead()!.email) {
                <div class="flex justify-between">
                  <dt class="text-[var(--color-muted-foreground)]">Email</dt>
                  <dd class="font-medium text-[var(--color-foreground)]">{{ lead()!.email }}</dd>
                </div>
              }
              <div class="flex justify-between">
                <dt class="text-[var(--color-muted-foreground)]">Fuente</dt>
                <dd class="font-medium text-[var(--color-foreground)] capitalize">{{ lead()!.source }}</dd>
              </div>
              @if (lead()!.notes) {
                <div class="flex flex-col gap-1">
                  <dt class="text-[var(--color-muted-foreground)]">Notas</dt>
                  <dd class="text-[var(--color-foreground)] text-xs leading-relaxed">{{ lead()!.notes }}</dd>
                </div>
              }
            </dl>

            <!-- Status selector -->
            <div class="mt-5 border-t border-[var(--color-border)] pt-4">
              <label class="mb-2 block text-sm font-medium text-[var(--color-foreground)]">Cambiar estado</label>
              <select
                [value]="lead()!.status"
                (change)="onStatusChange($event)"
                class="w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]"
              >
                <option value="new">Nuevo</option>
                <option value="contacted">En conversación</option>
                <option value="interested">Interesado</option>
                <option value="converted">Convertido</option>
                <option value="lost">Inactivo</option>
              </select>
            </div>
          </div>

          <!-- Recommended courses -->
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <h2 class="mb-3 font-semibold text-[var(--color-foreground)]">Cursos recomendados</h2>
            @if (loadingRecs()) {
              <div class="space-y-2">
                @for (_ of [1,2]; track $index) {
                  <div class="h-8 animate-pulse rounded bg-[var(--color-muted)]"></div>
                }
              </div>
            } @else {
              <ul class="space-y-2">
                @for (c of recommendations(); track c.id) {
                  <li class="flex items-center justify-between rounded-lg bg-[var(--color-muted)] px-3 py-2">
                    <span class="text-sm text-[var(--color-foreground)]">{{ c.name }}</span>
                    <span class="text-xs font-semibold text-[oklch(45%_0.2_260)]">{{ '$' + c.price }}</span>
                  </li>
                } @empty {
                  <li class="text-sm text-[var(--color-muted-foreground)]">Sin recomendaciones</li>
                }
              </ul>
            }
          </div>
        </div>

        <!-- Right column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Interest timeline -->
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-[var(--color-foreground)]">Historial de intereses</h2>
              <button
                (click)="showInterestModal.set(true)"
                title="Agregar interés"
                aria-label="Agregar interés"
                class="btn-primary h-9 w-9 !p-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 pointer-events-none">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 4v16m8-8H4"/>
                </svg>
              </button>
            </div>
            @if (!lead()!.interests?.length) {
              <div class="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                Sin intereses registrados.
              </div>
            }
            <ol class="relative border-l border-[var(--color-border)] ml-3 space-y-4">
              @for (interest of sortedInterests(); track interest.id) {
                <li class="ml-4">
                  <div class="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-[oklch(45%_0.2_260)]"></div>
                  <p class="text-xs text-[var(--color-muted-foreground)]">{{ interest.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                  <p class="text-sm font-medium text-[var(--color-foreground)]">{{ interest.course?.name ?? 'Curso sin nombre' }}</p>
                  @if (interest.notes) {
                    <p class="text-xs text-[var(--color-muted-foreground)]">{{ interest.notes }}</p>
                  }
                </li>
              }
            </ol>
          </div>

          <!-- Purchases -->
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-[var(--color-foreground)]">Compras</h2>
              <button
                (click)="showPurchaseModal.set(true)"
                title="Registrar compra"
                aria-label="Registrar compra"
                class="btn-primary h-9 w-9 !p-0"
              >
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 pointer-events-none">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 1v22M17 5H9.5a3.5 3.5 0 000 7h5a3.5 3.5 0 010 7H6"/>
                </svg>
              </button>
            </div>
            @if (loadingPurchases()) {
              <div class="space-y-2">
                @for (_ of [1,2]; track $index) {
                  <div class="h-8 animate-pulse rounded bg-[var(--color-muted)]"></div>
                }
              </div>
            } @else if (!purchases().length) {
              <div class="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                Sin compras registradas.
              </div>
            } @else {
              <div class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-[var(--color-muted)]">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Curso</th>
                      <th class="px-3 py-2 text-right text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Monto</th>
                      <th class="px-3 py-2 text-right text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Fecha</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--color-border)]">
                    @for (p of purchases(); track p.id) {
                      <tr>
                        <td class="px-3 py-2 text-[var(--color-foreground)] whitespace-nowrap">{{ p.course?.name || '—' }}</td>
                        <td class="px-3 py-2 text-right font-semibold text-green-600 whitespace-nowrap">{{ p.amountPaid | currency:'MXN' }}</td>
                        <td class="px-3 py-2 text-right text-[var(--color-muted-foreground)] whitespace-nowrap">{{ p.purchasedAt | date:'dd/MM/yy' }}</td>
                      </tr>
                    }
                  </tbody>
                </table>
              </div>
            }
          </div>
        </div>
      </div>
    }

    <!-- ── Edit modal ── -->
    @if (showEditModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showEditModal.set(false)"></div>
        <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
          <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Editar lead</h3>
          <form [formGroup]="editForm" (ngSubmit)="onSubmitEdit()" class="space-y-4">
            <div>
              <label class="form-label">Nombre <span class="text-red-500">*</span></label>
              <input formControlName="name" type="text" class="form-input"
                [class.ring-2]="editForm.get('name')!.invalid && editForm.get('name')!.touched"
                [class.ring-red-500]="editForm.get('name')!.invalid && editForm.get('name')!.touched" />
            </div>
            <div>
              <label class="form-label">Teléfono / WhatsApp</label>
              <input
                formControlName="whatsAppId"
                type="tel"
                inputmode="tel"
                placeholder="+52 1 55 0000 0000"
                class="form-input"
                maxlength="20"
                (input)="onPhoneInput($event)"
              />
              <p class="mt-1 text-xs text-[var(--color-muted-foreground)]">Formato: +52 1 55 0000 0000</p>
            </div>
            <div>
              <label class="form-label">Email</label>
              <input formControlName="email" type="email" class="form-input" />
            </div>
            <div>
              <label class="form-label">Estado</label>
              <select formControlName="status" class="form-input">
                <option value="new">Nuevo</option>
                <option value="contacted">En conversación</option>
                <option value="interested">Interesado</option>
                <option value="converted">Convertido</option>
                <option value="lost">Inactivo</option>
              </select>
            </div>
            <div>
              <label class="form-label">Notas</label>
              <textarea formControlName="notes" rows="3" class="form-input resize-none"></textarea>
            </div>
            <div class="flex gap-3 pt-1">
              <button type="button" (click)="showEditModal.set(false)" class="btn-secondary flex-1">Cancelar</button>
              <button type="submit" [disabled]="editForm.invalid" class="btn-primary flex-1">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- ── Confirm edit dialog ── -->
    @if (showConfirmModal()) {
      <div class="fixed inset-0 z-[60] flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/60"></div>
        <div class="relative w-full max-w-sm rounded-xl bg-[var(--color-card)] p-6 shadow-2xl">
          <div class="mb-4 flex items-start gap-3">
            <div class="flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-amber-100">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-amber-600">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v4m0 4h.01M10.29 3.86L1.82 18a2 2 0 001.71 3h16.94a2 2 0 001.71-3L13.71 3.86a2 2 0 00-3.42 0z"/>
              </svg>
            </div>
            <div>
              <h4 class="font-semibold text-[var(--color-foreground)]">¿Confirmar cambios?</h4>
              <p class="mt-1 text-sm text-[var(--color-muted-foreground)]">
                Se actualizará la información del lead. Esta acción no se puede deshacer.
              </p>
            </div>
          </div>
          <div class="flex gap-3">
            <button type="button" (click)="showConfirmModal.set(false)" [disabled]="saving()" class="btn-secondary flex-1">
              Cancelar
            </button>
            <button type="button" (click)="onConfirmEdit()" [disabled]="saving()" class="btn-primary flex-1">
              {{ saving() ? 'Guardando…' : 'Confirmar' }}
            </button>
          </div>
        </div>
      </div>
    }

    <!-- Interest modal -->
    @if (showInterestModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showInterestModal.set(false)"></div>
        <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
          <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Registrar interés</h3>
          <form [formGroup]="interestForm" (ngSubmit)="onAddInterest()" class="space-y-4">
            <div>
              <label class="form-label">Curso</label>
              <select formControlName="courseId" class="form-input">
                <option value="" disabled>Selecciona un curso</option>
                @for (c of courses(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="form-label">Notas (opcional)</label>
              <textarea formControlName="notes" rows="2" class="form-input resize-none"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="showInterestModal.set(false)" class="btn-secondary flex-1">Cancelar</button>
              <button type="submit" class="btn-primary flex-1">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }

    <!-- Purchase modal -->
    @if (showPurchaseModal()) {
      <div class="fixed inset-0 z-50 flex items-center justify-center p-4">
        <div class="absolute inset-0 bg-black/50" (click)="showPurchaseModal.set(false)"></div>
        <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
          <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Registrar compra</h3>
          <form [formGroup]="purchaseForm" (ngSubmit)="onAddPurchase()" class="space-y-4">
            <div>
              <label class="form-label">Curso</label>
              <select formControlName="courseId" class="form-input">
                <option value="" disabled>Selecciona un curso</option>
                @for (c of courses(); track c.id) {
                  <option [value]="c.id">{{ c.name }}</option>
                }
              </select>
            </div>
            <div>
              <label class="form-label">Monto pagado</label>
              <input formControlName="amountPaid" type="number" min="0" step="0.01" class="form-input" />
            </div>
            <div>
              <label class="form-label">Notas (opcional)</label>
              <textarea formControlName="notes" rows="2" class="form-input resize-none"></textarea>
            </div>
            <div class="flex gap-3">
              <button type="button" (click)="showPurchaseModal.set(false)" class="btn-secondary flex-1">Cancelar</button>
              <button type="submit" class="btn-primary flex-1">Guardar</button>
            </div>
          </form>
        </div>
      </div>
    }
  `,
  styles: [`
    /* Modal action buttons */
    .btn-primary   { @apply flex cursor-pointer items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
    .btn-secondary { @apply cursor-pointer rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed; }
    .form-label    { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input    { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }

    /* Icon action buttons */
    .tbl-btn         { @apply inline-flex h-8 w-8 cursor-pointer items-center justify-center rounded-md transition-colors duration-150; }
    .tbl-btn-primary { @apply bg-blue-600 text-white hover:bg-blue-700; }
  `]
})
export class LeadDetailComponent implements OnInit {
  private route = inject(ActivatedRoute);
  private leadService = inject(LeadService);
  private purchaseService = inject(PurchaseService);
  private courseService = inject(CourseService);
  private fb = inject(FormBuilder);

  lead = signal<Lead | null>(null);
  purchases = signal<Purchase[]>([]);
  recommendations = signal<Course[]>([]);
  courses = signal<Course[]>([]);
  loading = signal(true);
  loadingPurchases = signal(true);
  loadingRecs = signal(true);
  showInterestModal = signal(false);
  showPurchaseModal = signal(false);
  showEditModal = signal(false);
  showConfirmModal = signal(false);
  saving = signal(false);

  editForm = this.fb.group({
    name: ['', Validators.required],
    whatsAppId: [''],
    email: [''],
    status: ['new' as LeadStatus, Validators.required],
    notes: ['']
  });

  interestForm = this.fb.group({
    courseId: [null as number | null, Validators.required],
    notes: ['']
  });

  purchaseForm = this.fb.group({
    courseId: [null as number | null, Validators.required],
    amountPaid: [0, [Validators.required, Validators.min(0)]],
    notes: ['']
  });

  get leadId(): number {
    return Number(this.route.snapshot.params['id']);
  }

  sortedInterests(): LeadInterest[] {
    return [...(this.lead()?.interests ?? [])].sort(
      (a, b) => new Date(b.createdAt).getTime() - new Date(a.createdAt).getTime()
    );
  }

  ngOnInit() {
    this.loadLead();
    this.courseService.loadAll();
    this.courses.set(this.courseService.courses());
    setTimeout(() => this.courses.set(this.courseService.courses()), 500);
  }

  loadLead() {
    this.loading.set(true);
    this.leadService.getById(this.leadId).subscribe({
      next: data => {
        this.lead.set(data);
        this.loading.set(false);
        this.loadPurchases();
        this.loadRecommendations();
      },
      error: () => this.loading.set(false)
    });
  }

  loadPurchases() {
    this.loadingPurchases.set(true);
    this.purchaseService.getByLead(this.leadId).subscribe({
      next: data => { this.purchases.set(data); this.loadingPurchases.set(false); },
      error: () => this.loadingPurchases.set(false)
    });
  }

  loadRecommendations() {
    this.loadingRecs.set(true);
    this.leadService.getRecommendations(this.leadId).subscribe({
      next: data => { this.recommendations.set(data); this.loadingRecs.set(false); },
      error: () => this.loadingRecs.set(false)
    });
  }

  // ── Phone formatter ──────────────────────────────────────────────────────────
  private formatPhone(raw: string): string {
    const hasPlus = raw.trimStart().startsWith('+');
    const digits = raw.replace(/\D/g, '');
    if (!digits) return hasPlus ? '+' : '';

    if (hasPlus) {
      // International: +CC XXX XXX XXXX  (e.g. +52 155 123 4567)
      const cc = digits.slice(0, 2);
      const g1 = digits.slice(2, 5);
      const g2 = digits.slice(5, 8);
      const g3 = digits.slice(8, 12);
      let r = '+' + cc;
      if (g1) r += ' ' + g1;
      if (g2) r += ' ' + g2;
      if (g3) r += ' ' + g3;
      return r;
    } else {
      // Local 10-digit: XXX XXX XXXX
      const g1 = digits.slice(0, 3);
      const g2 = digits.slice(3, 6);
      const g3 = digits.slice(6, 10);
      let r = g1;
      if (g2) r += ' ' + g2;
      if (g3) r += ' ' + g3;
      return r;
    }
  }

  onPhoneInput(event: Event) {
    const input = event.target as HTMLInputElement;
    const formatted = this.formatPhone(input.value);
    if (input.value !== formatted) {
      input.value = formatted;
      this.editForm.get('whatsAppId')!.setValue(formatted, { emitEvent: false });
    }
  }

  // ── Edit lead ────────────────────────────────────────────────────────────────
  onOpenEdit() {
    const l = this.lead();
    if (!l) return;
    this.editForm.setValue({
      name: l.name,
      whatsAppId: l.whatsAppId ?? l.phone ?? '',
      email: l.email ?? '',
      status: l.status,
      notes: l.notes ?? ''
    });
    this.showEditModal.set(true);
  }

  onSubmitEdit() {
    if (this.editForm.invalid) return;
    this.showConfirmModal.set(true);
  }

  onConfirmEdit() {
    if (this.editForm.invalid) return;
    const v = this.editForm.value;
    this.saving.set(true);
    this.leadService.update(this.leadId, {
      name: v.name!,
      email: v.email || undefined,
      whatsAppId: v.whatsAppId || undefined,
      status: v.status as LeadStatus,
      notes: v.notes || undefined
    }).subscribe({
      next: () => {
        this.saving.set(false);
        this.showConfirmModal.set(false);
        this.showEditModal.set(false);
        this.loadLead();
      },
      error: () => this.saving.set(false)
    });
  }

  onStatusChange(event: Event) {
    const status = (event.target as HTMLSelectElement).value as LeadStatus;
    const l = this.lead();
    if (!l) return;
    this.leadService.update(this.leadId, {
      name: l.name,
      whatsAppId: l.whatsAppId,
      email: l.email,
      status
    }).subscribe({
      next: () => this.loadLead()
    });
  }

  onAddInterest() {
    if (this.interestForm.invalid) return;
    const dto = this.interestForm.value as any;
    this.leadService.addInterest(this.leadId, dto).subscribe({
      next: () => {
        this.showInterestModal.set(false);
        this.interestForm.reset();
        this.loadLead();
      }
    });
  }

  onAddPurchase() {
    if (this.purchaseForm.invalid) return;
    const dto = { ...this.purchaseForm.value as any, leadId: this.leadId };
    this.purchaseService.create(dto).subscribe({
      next: () => {
        this.showPurchaseModal.set(false);
        this.purchaseForm.reset();
        this.loadPurchases();
      }
    });
  }
}
