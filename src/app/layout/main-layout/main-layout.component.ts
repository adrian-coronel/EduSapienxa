import { Component, signal } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from '../sidebar/sidebar.component';
import { TopbarComponent } from '../topbar/topbar.component';
@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent],
  template: `
    <div class="flex min-h-screen bg-[var(--color-background)]">

      <!-- Sidebar recibe mobileOpen, emite cambios de colapso -->
      <app-sidebar
        [mobileOpen]="mobileOpen()"
        (mobileOpenChange)="mobileOpen.set($event)"
        (collapsedChange)="sidebarCollapsed.set($event)"
      />

      <!-- En móvil: sidebar es overlay, sin padding. En lg+: deja espacio al sidebar fijo. -->
      <div
        class="layout-content flex flex-1 flex-col min-w-0 transition-[padding] duration-300 ease-in-out"
        [class.sidebar-collapsed]="sidebarCollapsed()"
      >
        <app-topbar (menuToggle)="mobileOpen.set(!mobileOpen())" />

        <main class="flex-1 p-4 lg:p-6 max-w-full overflow-x-hidden">
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
