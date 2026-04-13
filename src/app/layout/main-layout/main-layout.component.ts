import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
import { NgStyle } from '@angular/common';

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, NgStyle],
  template: `
    <div class="flex min-h-screen bg-[var(--color-background)]">

      <!-- Sidebar receives mobileOpen, emits collapse changes -->
      <app-sidebar
        [mobileOpen]="mobileOpen()"
        (mobileOpenChange)="mobileOpen.set($event)"
        (collapsedChange)="sidebarCollapsed.set($event)"
      />

      <!-- Content area offsets left by sidebar width -->
      <div
        class="flex flex-1 flex-col min-w-0 transition-[padding] duration-300 ease-in-out"
        [ngStyle]="{ 'padding-left': sidebarCollapsed() ? 'var(--sidebar-w-collapsed)' : 'var(--sidebar-w)' }"
      >
        <app-topbar (menuToggle)="mobileOpen.set(!mobileOpen())" />

        <main class="flex-1 p-4 lg:p-6">
          <router-outlet />
        </main>
      </div>
    </div>
  `
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  mobileOpen = signal(false);
}
