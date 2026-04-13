import { Component, inject } from '@angular/core';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="sticky top-0 z-30 flex h-16 items-center justify-between border-b border-[var(--color-border)] bg-[var(--color-card)] px-4 lg:px-6">
      <!-- Left: page title slot via ng-content could go here -->
      <div class="flex items-center gap-4">
        <!-- Mobile menu button could go here -->
      </div>

      <!-- Right: user info + actions -->
      <div class="flex items-center gap-3">
        <!-- Dark mode toggle (mobile) -->
        <button
          (click)="toggleDark()"
          class="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)] transition-colors"
          title="Cambiar modo"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- User avatar and name -->
        <div class="flex items-center gap-2.5" *ngIf="auth.currentUser() as user">
          <div class="flex h-8 w-8 items-center justify-center rounded-full bg-[oklch(45%_0.2_260)] text-white text-sm font-semibold">
            {{ user.email.charAt(0).toUpperCase() }}
          </div>
          <div class="hidden sm:block">
            <p class="text-sm font-medium text-[var(--color-foreground)] leading-tight">{{ user.email }}</p>
            <p class="text-xs text-[var(--color-muted-foreground)] capitalize">{{ user.role }}</p>
          </div>
        </div>

        <!-- Logout -->
        <button
          (click)="auth.logout()"
          class="flex h-9 w-9 items-center justify-center rounded-md text-[var(--color-muted-foreground)] hover:bg-red-50 hover:text-red-600 transition-colors"
          title="Cerrar sesión"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
          </svg>
        </button>
      </div>
    </header>
  `
})
export class TopbarComponent {
  auth = inject(AuthService);

  toggleDark() {
    document.documentElement.classList.toggle('dark');
  }
}
