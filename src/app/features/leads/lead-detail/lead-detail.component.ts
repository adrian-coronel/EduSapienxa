import { Component, inject, signal, OnInit } from '@angular/core';
import { NgFor, NgIf, DatePipe, CurrencyPipe } from '@angular/common';
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
  imports: [NgFor, NgIf, RouterLink, ReactiveFormsModule, BadgeStatusComponent, DatePipe, CurrencyPipe],
  template: `
    <div *ngIf="loading()" class="space-y-4">
      <div class="h-10 w-48 animate-pulse rounded-lg bg-[var(--color-muted)]"></div>
      <div class="h-48 animate-pulse rounded-xl bg-[var(--color-muted)]"></div>
    </div>

    <ng-container *ngIf="!loading() && lead()">
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
            </div>

            <dl class="space-y-3 text-sm">
              <div class="flex justify-between">
                <dt class="text-[var(--color-muted-foreground)]">Teléfono</dt>
                <dd class="font-medium text-[var(--color-foreground)]">{{ lead()!.phone }}</dd>
              </div>
              <div class="flex justify-between" *ngIf="lead()!.email">
                <dt class="text-[var(--color-muted-foreground)]">Email</dt>
                <dd class="font-medium text-[var(--color-foreground)]">{{ lead()!.email }}</dd>
              </div>
              <div class="flex justify-between">
                <dt class="text-[var(--color-muted-foreground)]">Fuente</dt>
                <dd class="font-medium text-[var(--color-foreground)] capitalize">{{ lead()!.source }}</dd>
              </div>
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
            <div *ngIf="loadingRecs()" class="space-y-2">
              <div *ngFor="let _ of [1,2]" class="h-8 animate-pulse rounded bg-[var(--color-muted)]"></div>
            </div>
            <ul *ngIf="!loadingRecs()" class="space-y-2">
              <li *ngFor="let c of recommendations()" class="flex items-center justify-between rounded-lg bg-[var(--color-muted)] px-3 py-2">
                <span class="text-sm text-[var(--color-foreground)]">{{ c.name }}</span>
                <span class="text-xs font-semibold text-[oklch(45%_0.2_260)]">{{ '$' + c.price }}</span>
              </li>
              <li *ngIf="recommendations().length === 0" class="text-sm text-[var(--color-muted-foreground)]">Sin recomendaciones</li>
            </ul>
          </div>
        </div>

        <!-- Right column -->
        <div class="lg:col-span-2 space-y-6">
          <!-- Interest timeline -->
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-[var(--color-foreground)]">Historial de intereses</h2>
              <button (click)="showInterestModal.set(true)" class="btn-sm-primary">+ Agregar</button>
            </div>
            <div *ngIf="!lead()!.interests?.length" class="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
              Sin intereses registrados.
            </div>
            <ol class="relative border-l border-[var(--color-border)] ml-3 space-y-4">
              <li *ngFor="let interest of sortedInterests()" class="ml-4">
                <div class="absolute -left-1.5 mt-1.5 h-3 w-3 rounded-full border border-white bg-[oklch(45%_0.2_260)]"></div>
                <p class="text-xs text-[var(--color-muted-foreground)]">{{ interest.createdAt | date:'dd/MM/yyyy HH:mm' }}</p>
                <p class="text-sm font-medium text-[var(--color-foreground)]">{{ interest.course?.name ?? 'Curso sin nombre' }}</p>
                <p *ngIf="interest.notes" class="text-xs text-[var(--color-muted-foreground)]">{{ interest.notes }}</p>
              </li>
            </ol>
          </div>

          <!-- Purchases -->
          <div class="rounded-xl border border-[var(--color-border)] bg-[var(--color-card)] p-5 shadow-sm">
            <div class="mb-4 flex items-center justify-between">
              <h2 class="font-semibold text-[var(--color-foreground)]">Compras</h2>
              <button (click)="showPurchaseModal.set(true)" class="btn-sm-primary">+ Registrar compra</button>
            </div>
            <div *ngIf="loadingPurchases()" class="space-y-2">
              <div *ngFor="let _ of [1,2]" class="h-8 animate-pulse rounded bg-[var(--color-muted)]"></div>
            </div>
            <div *ngIf="!loadingPurchases()">
              <div *ngIf="!purchases().length" class="py-6 text-center text-sm text-[var(--color-muted-foreground)]">
                Sin compras registradas.
              </div>
              <div *ngIf="purchases().length" class="overflow-x-auto">
                <table class="w-full text-sm">
                  <thead class="bg-[var(--color-muted)]">
                    <tr>
                      <th class="px-3 py-2 text-left text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Curso</th>
                      <th class="px-3 py-2 text-right text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Monto</th>
                      <th class="px-3 py-2 text-right text-xs font-semibold text-[var(--color-muted-foreground)] whitespace-nowrap">Fecha</th>
                    </tr>
                  </thead>
                  <tbody class="divide-y divide-[var(--color-border)]">
                    <tr *ngFor="let p of purchases()">
                      <td class="px-3 py-2 text-[var(--color-foreground)] whitespace-nowrap">{{ p.course?.name || '—' }}</td>
                      <td class="px-3 py-2 text-right font-semibold text-green-600 whitespace-nowrap">{{ p.amountPaid | currency:'MXN' }}</td>
                      <td class="px-3 py-2 text-right text-[var(--color-muted-foreground)] whitespace-nowrap">{{ p.purchasedAt | date:'dd/MM/yy' }}</td>
                    </tr>
                  </tbody>
                </table>
              </div>
            </div>
          </div>
        </div>
      </div>
    </ng-container>

    <!-- Interest modal -->
    <div *ngIf="showInterestModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="showInterestModal.set(false)"></div>
      <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Registrar interés</h3>
        <form [formGroup]="interestForm" (ngSubmit)="onAddInterest()" class="space-y-4">
          <div>
            <label class="form-label">Curso</label>
            <select formControlName="courseId" class="form-input">
              <option value="" disabled>Selecciona un curso</option>
              <option *ngFor="let c of courses()" [value]="c.id">{{ c.name }}</option>
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

    <!-- Purchase modal -->
    <div *ngIf="showPurchaseModal()" class="fixed inset-0 z-50 flex items-center justify-center p-4">
      <div class="absolute inset-0 bg-black/50" (click)="showPurchaseModal.set(false)"></div>
      <div class="relative w-full max-w-md max-h-[90vh] overflow-y-auto rounded-xl bg-[var(--color-card)] p-6 shadow-xl">
        <h3 class="mb-4 text-lg font-semibold text-[var(--color-foreground)]">Registrar compra</h3>
        <form [formGroup]="purchaseForm" (ngSubmit)="onAddPurchase()" class="space-y-4">
          <div>
            <label class="form-label">Curso</label>
            <select formControlName="courseId" class="form-input">
              <option value="" disabled>Selecciona un curso</option>
              <option *ngFor="let c of courses()" [value]="c.id">{{ c.name }}</option>
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
  `,
  styles: [`
    .btn-primary { @apply flex items-center justify-center rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2 text-sm font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors; }
    .btn-sm-primary { @apply rounded-lg bg-[oklch(45%_0.2_260)] px-3 py-1.5 text-xs font-medium text-white hover:bg-[oklch(40%_0.2_260)] transition-colors; }
    .btn-secondary { @apply rounded-lg border border-[var(--color-border)] px-4 py-2 text-sm font-medium text-[var(--color-foreground)] hover:bg-[var(--color-muted)] transition-colors; }
    .form-label { @apply mb-1 block text-sm font-medium text-[var(--color-foreground)]; }
    .form-input { @apply w-full rounded-lg border border-[var(--color-border)] bg-[var(--color-background)] px-3 py-2 text-sm text-[var(--color-foreground)] focus:outline-none focus:ring-2 focus:ring-[oklch(45%_0.2_260)]; }
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
    // Subscribe to courses signal update
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

  onStatusChange(event: Event) {
    const status = (event.target as HTMLSelectElement).value as LeadStatus;
    const l = this.lead();
    if (!l) return;
    this.leadService.update(this.leadId, { name: l.name, phone: l.phone, email: l.email, status }).subscribe({
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
