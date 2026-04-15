import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf, NgClass } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf, NgClass],
  template: `
    <!-- ── Full-screen split layout ──────────────────────── -->
    <div class="flex min-h-screen bg-[var(--color-background)]">

      <!-- LEFT — brand & image panel (lg+) ─────────────────────── -->
      <div class="hidden lg:flex lg:w-[50%] xl:w-[55%] flex-col justify-between relative overflow-hidden bg-black px-12 py-16 text-white shadow-2xl z-10">

        <!-- Background Image -->
        <img src="https://images.unsplash.com/photo-1486406146926-c627a92ad1ab?ixlib=rb-4.0.3&auto=format&fit=crop&w=1400&q=80" 
             alt="Modern architecture aesthetic" 
             class="absolute inset-0 h-full w-full object-cover opacity-60">
        
        <!-- Gradient Overlay for better text legibility -->
        <div class="absolute inset-0 bg-gradient-to-t from-black/90 via-black/40 to-[var(--color-primary)]/40 mix-blend-multiply"></div>
        <div class="absolute inset-0 bg-[var(--color-primary)]/10"></div>

        <!-- Top logo -->
        <div class="relative z-10 flex items-center gap-3">
          <div class="flex h-10 w-10 items-center justify-center rounded-xl bg-white/20 backdrop-blur-md shadow-sm font-bold text-lg select-none">
            ES
          </div>
          <span class="text-xl font-bold tracking-tight">EduSapienxa</span>
        </div>

        <!-- Bottom content -->
        <div class="relative z-10 max-w-lg mt-auto">
          <h1 class="text-4xl md:text-5xl font-bold tracking-tight mb-4 leading-tight text-white drop-shadow-sm">
            Empodera el futuro de la educación.
          </h1>
          <p class="text-base md:text-lg text-white/80 leading-relaxed mb-8">
            Tu panel integral para la gestión de cursos, administración de ventas y seguimiento preciso de estudiantes, todo en un solo lugar.
          </p>
          
          <div class="flex items-center gap-3 text-sm text-white/90 font-medium bg-black/30 backdrop-blur-md px-4 py-3 rounded-2xl w-fit border border-white/10 shadow-lg">
            <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 text-green-400 drop-shadow-md">
              <path stroke-linecap="round" stroke-linejoin="round" d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"/>
            </svg>
            Plataforma segura y conectada
          </div>
        </div>
      </div>

      <!-- RIGHT — login form ────────────────────────────── -->
      <div class="flex flex-1 flex-col items-center justify-center px-6 py-12 lg:px-16 xl:px-24">

        <div class="w-full max-w-[400px]">

          <!-- Brand / Logo on Right Side -->
          <div class="mb-10 text-center flex flex-col items-center">
            <!-- Decorative icon -->
            <div class="mb-5 flex h-16 w-16 items-center justify-center rounded-2xl bg-[var(--color-primary)]/[0.08] text-[var(--color-primary)] shadow-sm border border-[var(--color-primary)]/20 ring-4 ring-[var(--color-primary)]/5">
              <svg viewBox="0 0 24 24" fill="currentColor" class="h-8 w-8">
                <!-- Stacked Layers/Books Icon -->
                <path d="M12 2L2 7l10 5 10-5-10-5zM2 17l10 5 10-5M2 12l10 5 10-5"/>
              </svg>
            </div>
            <h2 class="text-3xl font-extrabold text-[var(--color-foreground)] tracking-tight">Bienvenido de nuevo</h2>
            <p class="mt-2 text-[var(--color-muted-foreground)]">
              Ingresa tus credenciales para acceder al panel
            </p>
          </div>

          <!-- Form -->
          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-6">

            <!-- Email -->
            <div class="space-y-1.5">
              <label class="block text-sm font-semibold text-[var(--color-foreground)]">
                Correo electrónico
              </label>
              <div class="relative group">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--color-primary)] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207"/>
                  </svg>
                </span>
                <input
                  formControlName="email"
                  type="email"
                  autocomplete="email"
                  placeholder="admin@edusapienxa.com"
                  [ngClass]="isInvalid('email')
                    ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)] bg-[var(--color-danger)]/5'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-primary)] hover:border-[var(--color-muted-foreground)]/40'"
                  class="w-full rounded-xl border py-3 pl-11 pr-4 text-sm
                         bg-[var(--color-card)] text-[var(--color-foreground)]
                         placeholder:text-[var(--color-muted-foreground)]/60
                         focus:outline-none focus:ring-2 focus:border-transparent
                         transition-all duration-200"
                />
              </div>
              <p *ngIf="isInvalid('email')" class="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] mt-1 animate-in fade-in slide-in-from-top-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                Ingresa un correo electrónico válido.
              </p>
            </div>

            <!-- Password -->
            <div class="space-y-1.5">
              <div class="flex items-center justify-between">
                <label class="block text-sm font-semibold text-[var(--color-foreground)]">
                  Contraseña
                </label>
                <a href="javascript:void(0)" class="text-sm font-medium text-[var(--color-primary)] hover:text-[var(--color-primary-600)] transition-colors">¿Olvidaste tu contraseña?</a>
              </div>
              <div class="relative group">
                <span class="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3.5 text-[var(--color-muted-foreground)] group-focus-within:text-[var(--color-primary)] transition-colors">
                  <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
                    <rect x="3" y="11" width="18" height="11" rx="2" ry="2"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M7 11V7a5 5 0 0110 0v4"/>
                  </svg>
                </span>
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  [ngClass]="isInvalid('password')
                    ? 'border-[var(--color-danger)] focus:ring-[var(--color-danger)] bg-[var(--color-danger)]/5'
                    : 'border-[var(--color-border)] focus:ring-[var(--color-primary)] hover:border-[var(--color-muted-foreground)]/40'"
                  class="w-full rounded-xl border py-3 pl-11 pr-12 text-sm
                         bg-[var(--color-card)] text-[var(--color-foreground)]
                         placeholder:text-[var(--color-muted-foreground)]/60
                         focus:outline-none focus:ring-2 focus:border-transparent
                         transition-all duration-200"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute inset-y-0 right-0 flex items-center pr-4 text-[var(--color-muted-foreground)] hover:text-[var(--color-foreground)] transition-colors"
                >
                  <svg *ngIf="!showPassword()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.5" class="h-5 w-5">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="isInvalid('password')" class="flex items-center gap-1.5 text-xs font-medium text-[var(--color-danger)] mt-1 animate-in fade-in slide-in-from-top-1">
                <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-3.5 w-3.5">
                  <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
                </svg>
                La contraseña es obligatoria.
              </p>
            </div>

            <!-- Global error -->
            <div *ngIf="errorMsg()" class="flex items-start gap-3 rounded-xl px-4 py-3 border border-[var(--color-danger)]/40 bg-[var(--color-danger)]/10 animate-in fade-in zoom-in-95">
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 flex-shrink-0 mt-0.5 text-[var(--color-danger)]">
                <path stroke-linecap="round" stroke-linejoin="round" d="M12 9v2m0 4h.01m-6.938 4h13.856c1.54 0 2.502-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L3.34 16c-.77 1.333.192 3 1.732 3z"/>
              </svg>
              <p class="text-sm font-medium text-[var(--color-danger)]">{{ errorMsg() }}</p>
            </div>

            <!-- Submit button -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full flex justify-center items-center gap-2 rounded-xl bg-[var(--color-primary)] px-6 py-3.5
                     text-sm font-bold text-white tracking-wide shadow-md shadow-[var(--color-primary)]/20
                     hover:bg-[var(--color-primary-600)] hover:shadow-lg hover:shadow-[var(--color-primary)]/30 hover:-translate-y-0.5
                     active:bg-[var(--color-primary-700)] active:translate-y-0
                     disabled:opacity-70 disabled:cursor-not-allowed disabled:transform-none disabled:shadow-none
                     focus:outline-none focus:ring-2 focus:ring-[var(--color-primary-400)] focus:ring-offset-2
                     transition-all duration-200"
            >
              <span *ngIf="!loading()">Acceder al panel</span>
              <ng-container *ngIf="loading()">
                <svg class="h-5 w-5 animate-spin text-white" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                <span>Verificando...</span>
              </ng-container>
            </button>
            
          </form>
          
          <p class="mt-8 text-center text-sm text-[var(--color-muted-foreground)]">
            ¿No tienes una cuenta? <a href="javascript:void(0)" class="font-semibold text-[var(--color-primary)] hover:underline hover:text-[var(--color-primary-600)] transition-colors">Contacta a soporte</a>
          </p>
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
