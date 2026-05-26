import {
  ChangeDetectionStrategy,
  Component,
  computed,
  inject,
  signal,
  Input,
  Output,
  EventEmitter,
} from '@angular/core';
import { RouterLink, RouterLinkActive } from '@angular/router';
import { NgClass, NgIf, NgFor } from '@angular/common';
import { AuthService } from '../../core/services/auth.service';
import { SafeHtmlPipe } from '../../shared/pipes/safe-html.pipe';

interface NavItem {
  label: string;
  icon: string;
  route: string;
  exact?: boolean;
  adminOnly?: boolean;
}

interface NavGroup {
  label: string;
  items: NavItem[];
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  changeDetection: ChangeDetectionStrategy.OnPush,
  imports: [RouterLink, RouterLinkActive, NgClass, NgIf, NgFor, SafeHtmlPipe],
  template: `
    <!-- ── Mobile overlay ───────────────────────────────────── -->
    <div
      *ngIf="mobileOpen"
      (click)="mobileOpenChange.emit(false)"
      class="fixed inset-0 z-40 bg-black/50 lg:hidden"
    ></div>

    <!-- ── Sidebar panel ────────────────────────────────────── -->
    <aside
      class="fixed inset-y-0 left-0 z-50 flex flex-col overflow-hidden
             transition-[width,transform] duration-300 ease-in-out
             border-r border-[var(--color-sidebar-divider)]
             bg-[var(--color-sidebar-bg)]"
      [ngClass]="{
        'translate-x-0':                      mobileOpen,
        '-translate-x-full lg:translate-x-0': !mobileOpen
      }"
      [style.width]="collapsed() ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)'"
    >

      <!-- ── Logo ─────────────────────────────────────────── -->
      <div
        class="flex h-[var(--topbar-h)] flex-shrink-0 items-center gap-3
               border-b border-[var(--color-sidebar-divider)] px-4"
        [ngClass]="collapsed() ? 'justify-center' : 'justify-between'"
      >
        <a routerLink="/dashboard" class="flex min-w-0 items-center gap-2.5">
          <span class="flex h-8 w-8 flex-shrink-0 items-center justify-center
                       rounded-lg bg-[var(--color-primary)] text-white
                       font-bold text-xs tracking-tight select-none">
            AS
          </span>
          <span *ngIf="!collapsed()"
                class="text-[15px] font-bold tracking-tight truncate
                       text-[var(--color-sidebar-text)]">
            Agent<span class="text-[var(--color-primary)]">Sapienxa</span>
          </span>
        </a>

        <button
          *ngIf="!collapsed()"
          (click)="doToggleCollapsed()"
          title="Minimizar"
          class="hidden lg:flex h-7 w-7 flex-shrink-0 items-center justify-center
                 rounded-md transition-colors
                 text-[var(--color-sidebar-section-label)]
                 hover:bg-[var(--color-sidebar-hover-bg)]
                 hover:text-[var(--color-sidebar-text)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M11 19l-7-7 7-7m8 14l-7-7 7-7"/>
          </svg>
        </button>
        <button
          *ngIf="collapsed()"
          (click)="doToggleCollapsed()"
          title="Expandir"
          class="hidden lg:flex h-7 w-7 flex-shrink-0 items-center justify-center
                 rounded-md transition-colors
                 text-[var(--color-sidebar-section-label)]
                 hover:bg-[var(--color-sidebar-hover-bg)]
                 hover:text-[var(--color-sidebar-text)]"
        >
          <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" class="h-4 w-4">
            <path stroke-linecap="round" stroke-linejoin="round" d="M13 5l7 7-7 7M5 5l7 7-7 7"/>
          </svg>
        </button>
      </div>

      <!-- ── Navigation ────────────────────────────────────── -->
      <nav class="flex-1 overflow-y-auto overflow-x-hidden py-4">
        <ng-container *ngFor="let group of visibleGroups(); let first = first">

          <p *ngIf="!collapsed()"
             class="px-5 pb-2 text-[10px] font-semibold uppercase tracking-widest
                    text-[var(--color-sidebar-section-label)]"
             [ngClass]="first ? 'pt-0' : 'pt-5'">
            {{ group.label }}
          </p>
          <div *ngIf="collapsed() && !first"
               class="my-3 mx-3 border-t border-[var(--color-sidebar-divider)]"></div>

          <ul class="space-y-0.5 px-2.5">
            <li *ngFor="let item of group.items">
              <!--
                routerLinkActive adds the CSS class "sidebar-link-active" (defined in styles.css)
                when the route is active. No template reference (#rla) needed — avoids the
                NG0100/NG0103 infinite change-detection loop caused by reading rla.isActive
                inside a [ngClass] binding in Angular 21.
              -->
              <a
                [routerLink]="item.route"
                routerLinkActive="sidebar-link-active"
                [routerLinkActiveOptions]="{ exact: !!item.exact }"
                [title]="collapsed() ? item.label : ''"
                class="group relative flex items-center gap-3 rounded-md py-2.5
                       text-sm font-medium transition-all duration-150
                       border-l-[3px] border-transparent pl-2.5
                       text-[var(--color-sidebar-text)]
                       hover:bg-[var(--color-sidebar-hover-bg)]"
              >
                <!-- Icon inherits text color via currentColor → changes automatically on active -->
                <span
                  class="icon-wrap h-[18px] w-[18px] flex-shrink-0 opacity-70
                         group-hover:opacity-100 transition-opacity"
                  [innerHTML]="item.icon | safeHtml"
                ></span>

                <span *ngIf="!collapsed()" class="truncate leading-none">
                  {{ item.label }}
                </span>

                <!-- Tooltip when collapsed -->
                <span
                  *ngIf="collapsed()"
                  class="pointer-events-none absolute left-[calc(100%+8px)] z-[60]
                         whitespace-nowrap rounded-md shadow-lg px-2.5 py-1.5
                         text-xs font-medium text-white
                         bg-[var(--color-foreground)]
                         opacity-0 group-hover:opacity-100 transition-opacity duration-150"
                >
                  {{ item.label }}
                </span>
              </a>
            </li>
          </ul>
        </ng-container>
      </nav>

      <!-- ── Bottom: dark mode toggle ─────────────────────── -->
      <div class="flex-shrink-0 border-t border-[var(--color-sidebar-divider)] p-2.5">
        <button
          (click)="toggleDark()"
          [title]="collapsed() ? 'Modo oscuro' : ''"
          class="group flex w-full items-center gap-3 rounded-md px-2.5 py-2.5
                 text-sm transition-all
                 text-[var(--color-sidebar-section-label)]
                 hover:bg-[var(--color-sidebar-hover-bg)]
                 hover:text-[var(--color-sidebar-text)]"
        >
          <svg class="h-[18px] w-[18px] flex-shrink-0 hidden dark:block"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <circle cx="12" cy="12" r="4"/>
            <path stroke-linecap="round"
                  d="M12 2v2m0 16v2M4.93 4.93l1.41 1.41m11.32 11.32 1.41 1.41M2 12h2m16 0h2M4.93 19.07l1.41-1.41M18.66 5.34l1.41-1.41"/>
          </svg>
          <svg class="h-[18px] w-[18px] flex-shrink-0 dark:hidden"
               viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2">
            <path stroke-linecap="round" stroke-linejoin="round"
                  d="M20.354 15.354A9 9 0 018.646 3.646 9.003 9.003 0 0012 21a9.003 9.003 0 008.354-5.646z"/>
          </svg>
          <span *ngIf="!collapsed()" class="truncate">Modo oscuro</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent {
  @Input() mobileOpen = false;
  @Output() mobileOpenChange = new EventEmitter<boolean>();
  @Output() collapsedChange  = new EventEmitter<boolean>();

  private auth = inject(AuthService);
  collapsed = signal(false);

  private readonly navGroups: NavGroup[] = [
    {
      label: 'Menú',
      items: [
        {
          label: 'Dashboard',
          route: '/dashboard',
          exact: true,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <rect x="3" y="3" width="7" height="7" rx="1.5"/>
                   <rect x="14" y="3" width="7" height="7" rx="1.5"/>
                   <rect x="3" y="14" width="7" height="7" rx="1.5"/>
                   <rect x="14" y="14" width="7" height="7" rx="1.5"/>
                 </svg>`
        }
      ]
    },
    {
      label: 'Catálogo',
      items: [
        {
          label: 'Cursos',
          route: '/catalog',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M12 6.253v13m0-13C10.832 5.477 9.246 5 7.5 5S4.168 5.477 3 6.253v13C4.168 18.477 5.754 18 7.5 18s3.332.477 4.5 1.253m0-13C13.168 5.477 14.754 5 16.5 5c1.747 0 3.332.477 4.5 1.253v13C19.832 18.477 18.247 18 16.5 18c-1.746 0-3.332.477-4.5 1.253"/>
                 </svg>`
        },
        {
          label: 'Instructores',
          route: '/instructors',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M16 7a4 4 0 11-8 0 4 4 0 018 0zM12 14a7 7 0 00-7 7h14a7 7 0 00-7-7z"/>
                 </svg>`
        }
      ]
    },
    {
      label: 'CRM',
      items: [
        {
          label: 'Leads',
          route: '/leads',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0z"/>
                 </svg>`
        },
        {
          label: 'Inscripciones',
          route: '/enrollments',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M9 5H7a2 2 0 00-2 2v12a2 2 0 002 2h10a2 2 0 002-2V7a2 2 0 00-2-2h-2M9 5a2 2 0 002 2h2a2 2 0 002-2M9 5a2 2 0 012-2h2a2 2 0 012 2m-6 9l2 2 4-4"/>
                 </svg>`
        },
        {
          label: 'Pagos',
          route: '/payments',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M3 10h18M7 15h1m4 0h1m-7 4h12a3 3 0 003-3V8a3 3 0 00-3-3H6a3 3 0 00-3 3v8a3 3 0 003 3z"/>
                 </svg>`
        }
      ]
    },
    {
      label: 'Sistema',
      items: [
        {
          label: 'Agentes IA',
          route: '/agents',
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M9.75 17L9 20l-1 1h8l-1-1-.75-3M3 13h18M5 17H4a2 2 0 01-2-2V5a2 2 0 012-2h16a2 2 0 012 2v10a2 2 0 01-2 2h-1"/>
                 </svg>`
        },
        {
          label: 'Usuarios',
          route: '/users',
          adminOnly: true,
          icon: `<svg viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="1.75">
                   <path stroke-linecap="round" stroke-linejoin="round"
                     d="M12 4.354a4 4 0 110 5.292M15 21H3v-1a6 6 0 0112 0v1zm0 0h6v-1a6 6 0 00-9-5.197M13 7a4 4 0 11-8 0 4 4 0 018 0z"/>
                 </svg>`
        }
      ]
    }
  ];

  // computed() so OnPush correctly tracks auth signal changes
  visibleGroups = computed(() =>
    this.navGroups
      .map(g => ({
        ...g,
        items: g.items.filter(i => !i.adminOnly || this.auth.hasRole('admin'))
      }))
      .filter(g => g.items.length > 0)
  );

  doToggleCollapsed(): void {
    this.collapsed.update(v => !v);
    this.collapsedChange.emit(this.collapsed());
  }

  toggleDark(): void {
    document.documentElement.classList.toggle('dark');
  }
}
