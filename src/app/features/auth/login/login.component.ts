import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgFor, NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgFor, NgClass],
  template: `
    <!-- ── Full-screen split layout ──────────────────────── -->
    <div class="flex min-h-screen">

      <!-- LEFT — brand panel (lg+) ─────────────────────── -->
      <div class="hidden lg:flex lg:w-[52%] xl:w-[55%] flex-col items-center justify-center
                  relative overflow-hidden px-16
                  bg-[var(--color-primary)]">

        <!-- Decorative blobs -->
        <div class="pointer-events-none absolute -top-24 -left-24 h-96 w-96
                    rounded-full bg-white/5 blur-3xl"></div>
        <div class="pointer-events-none absolute -bottom-32 -right-16 h-[28rem] w-[28rem]
                    rounded-full bg-black/10 blur-3xl"></div>

        <!-- Brand content -->
        <div class="relative z-10 text-center">
          <div class="mx-auto mb-6 flex h-16 w-16 items-center justify-center
                      rounded-2xl bg-white/20 backdrop-blur-sm
                      text-white font-bold text-2xl tracking-tight select-none shadow-lg">
            ES
          </div>
          <h1 class="text-4xl font-bold text-white tracking-tight">EduSapienxa</h1>
          <p class="mt-3 text-base text-white/60 max-w-xs mx-auto leading-relaxed">
            Panel de administración para gestión de cursos, leads y compras.
          </p>

          <ul class="mt-10 space-y-3 text-left">
            <li *ngFor="let feat of features"
                class="flex items-center gap-3 text-sm text-white/80">
              <span class="flex h-5 w-5 flex-shrink-0 items-center justify-center
                           rounded-full bg-white/20 text-white">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5"
                     class="h-3 w-3">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M5 13l4 4L19 7"/>
                </svg>
              </span>
              {{ feat }}
            </li>
          </ul>
        </div>
      </div>

      <!-- RIGHT — login form ────────────────────────────── -->
      <div class="flex flex-1 flex-col items-center justify-center
                  bg-[var(--color-background)] px-6 py-12 lg:px-16 xl:px-24">

        <div class="w-full max-w-[420px]">

          <!-- Mobile brand (small screens) -->
          <div class="mb-8 text-center lg:hidden">
            <div class="mx-auto mb-4 flex h-12 w-12 items-center justify-center
                        rounded-xl bg-[var(--color-primary)] text-white font-bold text-base select-none">
              ES
            </div>
            <h1 class="text-2xl font-bold text-[var(--color-foreground)]">EduSapienxa</h1>
            <p class="mt-1 text-sm text-[var(--color-muted-foreground)]">Panel de administración</p>
          </div>

          <div class="mb-8">
            <h2 class="text-2xl font-bold text-[var(--color-foreground)]">Bienvenido de nuevo</h2>
            <p class="mt-1 text-sm text-[var(--color-muted-foreground)]">
              Ingresa tus credenciales para continuar
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">

            <!-- Email -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
                Correo electrónico
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5
                             text-[var(--color-muted-foreground)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M3 8l7.89 5.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z"/>
                  </svg>
                </span>
                <input
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  placeholder="usuario@empresa.com"
                  [ngClass]="isInvalid('email')
                    ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'"
                  class="w-full rounded-lg border py-2.5 pl-10 pr-4 text-sm
                         bg-[var(--color-card)] text-[var(--color-foreground)]
                         placeholder:text-[var(--color-muted-foreground)]
                         focus:outline-none focus:ring-2 focus:border-transparent
                         transition-colors"
                />
              </div>
              <p *ngIf="isInvalid('email')"
                 class="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                  <circle cx="12" cy="12" r="10"/>
                  <path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                Ingresa un correo válido.
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-[var(--color-foreground)]">
                Contraseña
              </label>
              <div class="relative">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5
                             text-[var(--color-muted-foreground)]">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  [ngClass]="isInvalid('password')
                    ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)]'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-primary)]'"
                  class="w-full rounded-lg border py-2.5 pl-10 pr-11 text-sm
                         bg-[var(--color-card)] text-[var(--color-foreground)]
                         placeholder:text-[var(--color-muted-foreground)]
                         focus:outline-none focus:ring-2 focus:border-transparent
                         transition-colors"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 flex items-center pr-3.5
                         text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)]
                         transition-colors"
                >
                  <svg *ngIf="!showPassword()"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword()"
                       viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round"
                          d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="isInvalid('password')"
                 class="mt-1.5 flex items-center gap-1 text-xs text-[var(--color-danger)]">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3 w-3">
                  <circle cx="12" cy="12" r="10"/>
                  <path stroke-linecap="round" d="M12 8v4m0 4h.01"/>
                </svg>
                La contraseña es requerida.
              </p>
            </div>

            <!-- Global error -->
            <div *ngIf="errorMsg()"
                 class="flex items-start gap-3 rounded-lg px-4 py-3
                        border border-[var(--color-danger)] border-opacity-30
                        bg-[var(--color-danger-light)]">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"
                   class="h-4 w-4 flex-shrink-0 mt-0.5 text-[var(--color-danger)]">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p class="text-sm text-[var(--color-danger-dark)]">{{ errorMsg() }}</p>
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-[var(--color-primary)] px-6 py-2.5
                     text-sm font-semibold text-white shadow-sm
                     hover:bg-[var(--color-primary-600)] active:bg-[var(--color-primary-700)]
                     disabled:opacity-60 disabled:cursor-not-allowed
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2
                     transition-all duration-150"
            >
              <span *ngIf="!loading()">Iniciar sesión</span>
              <span *ngIf="loading()" class="flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10"
                          stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor"
                        d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Verificando...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb     = inject(FormBuilder);
  private auth   = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email:    ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading      = signal(false);
  errorMsg     = signal<string | null>(null);
  showPassword = signal(false);

  features = [
    'Gestión de cursos y catálogo',
    'CRM de leads y conversiones',
    'Seguimiento de compras',
    'Administración de usuarios',
  ];

  isInvalid(field: string): boolean {
    const ctrl = this.form.get(field);
    return !!(ctrl?.invalid && ctrl?.touched);
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    this.loading.set(true);
    this.errorMsg.set(null);

    this.auth.login(this.form.value as any).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => {
        this.errorMsg.set('Credenciales inválidas. Verifica tu correo y contraseña.');
        this.loading.set(false);
      }
    });
  }
}
