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
        children: [
          { path: '', redirectTo: 'categories', pathMatch: 'full' },
          {
            path: 'categories',
            loadComponent: () =>
              import('./features/catalog/categories/categories.component').then(m => m.CategoriesComponent)
          },
          {
            path: 'subcategories',
            loadComponent: () =>
              import('./features/catalog/subcategories/subcategories.component').then(m => m.SubcategoriesComponent)
          },
          {
            path: 'courses',
            loadComponent: () =>
              import('./features/catalog/courses/courses.component').then(m => m.CoursesComponent)
          }
        ]
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
        path: 'purchases',
        loadComponent: () =>
          import('./features/purchases/purchases.component').then(m => m.PurchasesComponent)
      },
      {
        path: 'users',
        canActivate: [roleGuard('admin')],
        loadComponent: () =>
          import('./features/users/users.component').then(m => m.UsersComponent)
      }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
