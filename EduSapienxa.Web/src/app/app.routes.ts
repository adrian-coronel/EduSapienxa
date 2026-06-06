import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';
import { roleGuard } from './core/guards/role.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () =>
      import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: '',
    loadComponent: () =>
      import('./layout/main-layout/main-layout.component').then(m => m.MainLayoutComponent),
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('./features/dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      {
        path: 'catalog',
        loadComponent: () =>
          import('./features/catalog/catalog.component').then(m => m.CatalogComponent)
      },
      {
        path: 'instructors',
        loadComponent: () =>
          import('./features/instructors/instructors.component').then(m => m.InstructorsComponent)
      },
      {
        path: 'leads',
        children: [
          {
            path: '',
            loadComponent: () =>
              import('./features/leads/lead-list/lead-list.component').then(m => m.LeadListComponent)
          },
          {
            path: ':id',
            loadComponent: () =>
              import('./features/leads/lead-detail/lead-detail.component').then(m => m.LeadDetailComponent)
          }
        ]
      },
      {
        path: 'enrollments',
        loadComponent: () =>
          import('./features/enrollments/enrollments.component').then(m => m.EnrollmentsComponent)
      },
      {
        path: 'payments',
        loadComponent: () =>
          import('./features/payments/payments.component').then(m => m.PaymentsComponent)
      },
      {
        path: 'agents',
        loadComponent: () =>
          import('./features/agents/agents.component').then(m => m.AgentsComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard('admin', 'superadmin')],
        loadComponent: () =>
          import('./features/users/users.component').then(m => m.UsersComponent)
      },
      {
        path: 'documents',
        loadComponent: () =>
          import('./features/documents/documents.component').then(m => m.DocumentsComponent)
      },
      {
        path: 'companies',
        canActivate: [roleGuard('superadmin')],
        loadComponent: () =>
          import('./features/companies/companies.component').then(m => m.CompaniesComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
