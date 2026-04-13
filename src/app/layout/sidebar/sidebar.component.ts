import { Component, inject, signal, Input } from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  adminOnly?: boolean;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf, NgFor],
  template: `
    <aside
      [ngClass]="[
        'fixed inset-y-0 left-0 z-50 flex flex-col bg-[oklch(14.5%_0.025_264)] text-white transition-all duration-300',
        collapsed() ? 'w-16' : 'w-64'
      ]"
    >
      <!-- Logo -->
      <div class="flex h-16 items-center justify-between px-4 border-b border-white/10">
        <span *ngIf="!collapsed()" class="text-lg font-bold tracking-tight text-white">
          Edu<span class="text-[oklch(65%_0.2_260)]">Sapienxa</span>
        </span>
        <button
          (click)="collapsed.set(!collapsed())"
          class="ml-auto flex h-8 w-8 items-center justify-center rounded-md text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          aria-label="Toggle sidebar"
        >
          <svg *ngIf="!collapsed()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7" />
          </svg>
          <svg *ngIf="collapsed()" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7" />
          </svg>
        </button>
      </div>

      <!-- Nav -->
      <nav class="flex-1 overflow-y-auto py-4">
        <ul class="space-y-1 px-2">
          <li *ngFor="let item of visibleNavItems()">
            <a
              [routerLink]="item.route"
              routerLinkActive="bg-[oklch(45%_0.2_260)] text-white"
              [routerLinkActiveOptions]="{exact: item.route === '/dashboard'}"
              class="flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium text-white/70 hover:bg-white/10 hover:text-white transition-all"
              [title]="collapsed() ? item.label : ''"
            >
              <span class="flex-shrink-0 h-5 w-5" [innerHTML]="item.icon"></span>
              <span *ngIf="!collapsed()" class="truncate">{{ item.label }}</span>
            </a>
          </li>
        </ul>
      </nav>

      <!-- Dark mode toggle -->
      <div class="border-t border-white/10 p-3">
        <button
          (click)="toggleDark()"
          class="flex w-full items-center gap-3 rounded-md px-3 py-2 text-sm text-white/60 hover:bg-white/10 hover:text-white transition-colors"
          [title]="collapsed() ? 'Toggle dark mode' : ''"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-5 w-5 flex-shrink-0">
            <path stroke-linecap="round" stroke-linejoin="round" d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z" />
          </svg>
          <span *ngIf="!collapsed()">Modo oscuro</span>
        </button>
      </div>
    </aside>

    <!-- Mobile overlay -->
    <div
      *ngIf="mobileOpen()"
      (click)="mobileOpen.set(false)"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    ></div>
  `
})
export class SidebarComponent {
  auth = inject(AuthService);
  collapsed = signal(false);
  mobileOpen = signal(false);

  private navItems: NavItem[] = [
    {
      label: 'Dashboard',
      route: '/dashboard',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><rect x="3" y="3" width="7" height="7" rx="1"/><rect x="14" y="3" width="7" height="7" rx="1"/><rect x="3" y="14" width="7" height="7" rx="1"/><rect x="14" y="14" width="7" height="7" rx="1"/></svg>`
    },
    {
      label: 'Catálogo',
      route: '/catalog/categories',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/></svg>`
    },
    {
      label: 'Leads',
      route: '/leads',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/></svg>`
    },
    {
      label: 'Compras',
      route: '/purchases',
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M3 3h2l.4 2M7 13h10l4-8H5.4M7 13L5.4 5M7 13l-2.293 2.293c-.63.63-.184 1.707.707 1.707H17m0 0a2 2 0 100 4 2 2 0 000-4zm-8 2a2 2 0 11-4 0 2 2 0 014 0z"/></svg>`
    },
    {
      label: 'Usuarios',
      route: '/users',
      adminOnly: true,
      icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path stroke-linecap="round" stroke-linejoin="round" d="M10.325 4.317c.426-1.756 2.924-1.756 3.35 0a1.724 1.724 0 002.573 1.066c1.543-.94 3.31.826 2.37 2.37a1.724 1.724 0 001.065 2.572c1.756.426 1.756 2.924 0 3.35a1.724 1.724 0 00-1.066 2.573c.94 1.543-.826 3.31-2.37 2.37a1.724 1.724 0 00-2.572 1.065c-.426 1.756-2.924 1.756-3.35 0a1.724 1.724 0 00-2.573-1.066c-1.543.94-3.31-.826-2.37-2.37a1.724 1.724 0 00-1.065-2.572c-1.756-.426-1.756-2.924 0-3.35a1.724 1.724 0 001.066-2.573c-.94-1.543.826-3.31 2.37-2.37.996.608 2.296.07 2.572-1.065z"/><circle cx="12" cy="12" r="3"/></svg>`
    }
  ];

  visibleNavItems() {
    return this.navItems.filter(item => !item.adminOnly || this.auth.hasRole('admin'));
  }

  toggleDark() {
    document.documentElement.classList.toggle('dark');
  }
}
