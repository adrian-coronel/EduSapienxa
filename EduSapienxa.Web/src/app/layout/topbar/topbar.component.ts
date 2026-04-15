import { Component, inject, signal, Output, EventEmitter } from '@angular/core';
import { Router, NavigationEnd } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { NgIf } from '@angular/common';
import { filter } from 'rxjs/operators';

const PAGE_TITLES: Record<string, string> = {
  '/dashboard':           'Dashboard',
  '/catalog/categories':  'Categorías',
  '/catalog/subcategories': 'Subcategorías',
  '/catalog/courses':     'Cursos',
  '/leads':               'Leads',
  '/purchases':           'Compras',
  '/users':               'Usuarios',
};

@Component({
  selector: 'app-topbar',
  standalone: true,
  imports: [NgIf],
  template: `
    <header class="sticky top-0 z-30 flex h-[var(--topbar-h)] flex-shrink-0 items-center
                   border-b border-[var(--color-border)]
                   bg-[var(--color-topbar-bg)]
                   px-4 lg:px-6 transition-colors duration-200">

      <!-- ── Left: hamburger + page title ──────────────────── -->
      <div class="flex items-center gap-3">
        <!-- Mobile hamburger -->
        <button
          (click)="menuToggle.emit()"
          class="lg:hidden flex h-9 w-9 items-center justify-center rounded-md
                 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]
                 hover:text-[var(--color-foreground)] transition-colors"
          title="Abrir menú"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M4 6h16M4 12h16M4 18h16"/>
          </svg>
        </button>

        <!-- Page title -->
        <div>
          <h2 class="text-base font-semibold text-[var(--color-foreground)] leading-tight">
            {{ pageTitle() }}
          </h2>
        </div>
      </div>

      <!-- ── Right: actions ─────────────────────────────────── -->
      <div class="ml-auto flex items-center gap-1">

        <!-- Dark mode toggle -->
        <button
          (click)="toggleDark()"
          title="Cambiar tema"
          class="flex h-9 w-9 items-center justify-center rounded-md
                 text-[var(--color-muted-foreground)] hover:bg-[var(--color-muted)]
                 hover:text-[var(--color-foreground)] transition-colors"
        >
          <!-- Sun (shown when dark mode is active) -->
          <svg class="h-5 w-5 hidden dark:block"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path stroke-linecap="round"
                  d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.66 5.34l1.41-1.41"/>
          </svg>
          <!-- Moon (shown when light mode is active) -->
          <svg class="h-5 w-5 dark:hidden"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
        </button>

        <!-- Divider -->
        <div class="mx-2 h-6 w-px bg-[var(--color-border)]"></div>

        <!-- User area -->
        <div class="relative" *ngIf="auth.currentUser() as user">
          <button
            (click)="dropdownOpen.set(!dropdownOpen())"
            class="flex items-center gap-2.5 rounded-md px-2 py-1.5
                   hover:bg-[var(--color-muted)] transition-colors"
          >
            <!-- Avatar -->
            <span class="flex h-8 w-8 items-center justify-center rounded-full
                         bg-[var(--color-primary)] text-white text-sm font-semibold
                         flex-shrink-0 select-none">
              {{ user.email.charAt(0).toUpperCase() }}
            </span>
            <!-- Name + role -->
            <span class="hidden sm:flex sm:flex-col sm:text-left">
              <span class="text-sm font-medium text-[var(--color-foreground)] leading-tight max-w-[160px] truncate">
                {{ user.email }}
              </span>
              <span class="text-xs capitalize text-[var(--color-muted-foreground)] leading-tight">
                {{ user.role }}
              </span>
            </span>
            <!-- Chevron -->
            <svg class="hidden sm:block h-4 w-4 text-[var(--color-muted-foreground)] transition-transform duration-150"
                 [style.transform]="dropdownOpen() ? 'rotate(180deg)' : ''"
                 viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
              <path stroke-linecap="round" stroke-linejoin="round" d="M19 9l-7 7-7-7"/>
            </svg>
          </button>

          <!-- Dropdown menu -->
          <div
            *ngIf="dropdownOpen()"
            class="absolute right-0 top-[calc(100%+8px)] z-50 w-52
                   rounded-[var(--radius-lg)] border border-[var(--color-border)]
                   bg-[var(--color-card)] shadow-[var(--shadow-lg)] py-1"
          >
            <!-- User info row -->
            <div class="px-4 py-3 border-b border-[var(--color-border)]">
              <p class="text-xs font-medium text-[var(--color-foreground)] truncate">{{ user.email }}</p>
              <p class="text-xs capitalize text-[var(--color-muted-foreground)] mt-0.5">{{ user.role }}</p>
            </div>

            <!-- Logout -->
            <button
              (click)="doLogout()"
              class="flex w-full items-center gap-2.5 px-4 py-2.5 text-sm
                     text-[var(--color-danger)] hover:bg-[var(--color-danger-light)]
                     transition-colors"
            >
              <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4 flex-shrink-0">
                <path stroke-linecap="round" stroke-linejoin="round"
                      d="M17 16l4-4m0 0l-4-4m4 4H7m6 4v1a3 3 0 01-3 3H6a3 3 0 01-3-3V7a3 3 0 013-3h4a3 3 0 013 3v1"/>
              </svg>
              Cerrar sesión
            </button>
          </div>
        </div>
      </div>
    </header>

    <!-- Click-outside overlay for dropdown -->
    <div
      *ngIf="dropdownOpen()"
      (click)="dropdownOpen.set(false)"
      class="fixed inset-0 z-20"
    ></div>
  `
})
export class TopbarComponent {
  @Output() menuToggle = new EventEmitter<void>();

  auth = inject(AuthService);
  private router = inject(Router);

  dropdownOpen = signal(false);
  pageTitle = signal('Dashboard');

  constructor() {
    this.router.events.pipe(
      filter(e => e instanceof NavigationEnd)
    ).subscribe((e: any) => {
      this.pageTitle.set(PAGE_TITLES[e.urlAfterRedirects] ?? 'Dashboard');
    });
    // Set initial title
    this.pageTitle.set(PAGE_TITLES[this.router.url] ?? 'Dashboard');
  }

  toggleDark(): void {
    document.documentElement.classList.toggle('dark');
  }

  doLogout(): void {
    this.dropdownOpen.set(false);
    this.auth.logout();
  }
}
