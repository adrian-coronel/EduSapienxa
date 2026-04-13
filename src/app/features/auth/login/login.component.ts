import { Component, inject, signal } from '@angular/core';
import { FormBuilder, Validators, ReactiveFormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { NgIf } from '@angular/common';
import { AuthService } from '../../../core/services/auth.service';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [ReactiveFormsModule, NgIf],
  template: `
    <div class="flex min-h-screen items-center justify-center bg-gradient-to-br from-[oklch(14.5%_0.025_264)] via-[oklch(20%_0.03_264)] to-[oklch(14.5%_0.025_264)] px-4">
      <div class="w-full max-w-md">
        <!-- Logo / Brand -->
        <div class="mb-8 text-center">
          <h1 class="text-3xl font-bold text-white">
            Edu<span class="text-[oklch(65%_0.2_260)]">Sapienxa</span>
          </h1>
          <p class="mt-2 text-sm text-white/50">Panel de administración</p>
        </div>

        <!-- Card -->
        <div class="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-sm p-8 shadow-2xl">
          <h2 class="mb-6 text-xl font-semibold text-white">Iniciar sesión</h2>

          <form [formGroup]="form" (ngSubmit)="onSubmit()" class="space-y-5">
            <!-- Email -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-white/70">
                Correo electrónico
              </label>
              <input
                formControlName="email"
                type="email"
                autocomplete="email"
                placeholder="usuario@empresa.com"
                class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-white placeholder:text-white/30 focus:border-[oklch(65%_0.2_260)] focus:outline-none focus:ring-1 focus:ring-[oklch(65%_0.2_260)] transition-colors"
                [class.border-red-500]="isInvalid('email')"
              />
              <p *ngIf="isInvalid('email')" class="mt-1 text-xs text-red-400">
                Ingresa un correo válido.
              </p>
            </div>

            <!-- Password -->
            <div>
              <label class="mb-1.5 block text-sm font-medium text-white/70">
                Contraseña
              </label>
              <div class="relative">
                <input
                  formControlName="password"
                  [type]="showPassword() ? 'text' : 'password'"
                  autocomplete="current-password"
                  placeholder="••••••••"
                  class="w-full rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 pr-10 text-sm text-white placeholder:text-white/30 focus:border-[oklch(65%_0.2_260)] focus:outline-none focus:ring-1 focus:ring-[oklch(65%_0.2_260)] transition-colors"
                  [class.border-red-500]="isInvalid('password')"
                />
                <button
                  type="button"
                  (click)="showPassword.set(!showPassword())"
                  class="absolute right-3 top-1/2 -translate-y-1/2 text-white/40 hover:text-white/70"
                >
                  <svg *ngIf="!showPassword()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M15 12a3 3 0 11-6 0 3 3 0 016 0z"/>
                    <path stroke-linecap="round" stroke-linejoin="round" d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z"/>
                  </svg>
                  <svg *ngIf="showPassword()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
                    <path stroke-linecap="round" stroke-linejoin="round" d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21"/>
                  </svg>
                </button>
              </div>
              <p *ngIf="isInvalid('password')" class="mt-1 text-xs text-red-400">
                La contraseña es requerida.
              </p>
            </div>

            <!-- Error global -->
            <div *ngIf="errorMsg()" class="rounded-lg border border-red-500/30 bg-red-500/10 px-4 py-3 text-sm text-red-400">
              {{ errorMsg() }}
            </div>

            <!-- Submit -->
            <button
              type="submit"
              [disabled]="loading()"
              class="w-full rounded-lg bg-[oklch(45%_0.2_260)] px-4 py-2.5 text-sm font-semibold text-white hover:bg-[oklch(40%_0.2_260)] disabled:opacity-60 disabled:cursor-not-allowed transition-all focus:outline-none focus:ring-2 focus:ring-[oklch(65%_0.2_260)] focus:ring-offset-2 focus:ring-offset-transparent"
            >
              <span *ngIf="!loading()">Ingresar</span>
              <span *ngIf="loading()" class="flex items-center justify-center gap-2">
                <svg class="h-4 w-4 animate-spin" viewBox="0 0 24 24" fill="none">
                  <circle class="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" stroke-width="4"/>
                  <path class="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4z"/>
                </svg>
                Ingresando...
              </span>
            </button>
          </form>
        </div>
      </div>
    </div>
  `
})
export class LoginComponent {
  private fb = inject(FormBuilder);
  private auth = inject(AuthService);
  private router = inject(Router);

  form = this.fb.group({
    email: ['', [Validators.required, Validators.email]],
    password: ['', Validators.required]
  });

  loading = signal(false);
  errorMsg = signal<string | null>(null);
  showPassword = signal(false);

  isInvalid(field: string) {
    const ctrl = this.form.get(field);
    return ctrl?.invalid && ctrl?.touched;
  }

  onSubmit() {
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
