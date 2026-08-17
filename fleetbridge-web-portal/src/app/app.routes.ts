import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: '',
    redirectTo: '/dashboard',
    pathMatch: 'full'
  },
  {
    path: 'auth',
    component: AuthLayoutComponent,
    canActivate: [guestGuard],
    children: [
      {
        path: 'login',
        loadComponent: () => import('./auth/login/login.component').then(m => m.LoginComponent)
      }
    ]
  },
  {
    path: '',
    component: MainLayoutComponent,
    canActivate: [authGuard],
    children: [
      {
        path: 'dashboard',
        loadComponent: () => import('./dashboard/dashboard.component').then(m => m.DashboardComponent)
      },
      // ── Fleet ──
      {
        path: 'fleet',
        redirectTo: '/vehicles',
        pathMatch: 'full'
      },
      {
        path: 'vehicles',
        loadComponent: () => import('./fleet/vehicles/vehicles.component').then(m => m.VehiclesComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./fleet/drivers/drivers.component').then(m => m.DriversComponent)
      },
      // ── Trips ──
      {
        path: 'trips',
        loadComponent: () => import('./trips/trips.component').then(m => m.TripsComponent)
      },
      {
        path: 'tracking',
        loadComponent: () => import('./trips/trips.component').then(m => m.TripsComponent)
      },
      // ── Organizations ──
      {
        path: 'organizations',
        loadComponent: () => import('./organizations/organizations.component').then(m => m.OrganizationsComponent)
      },
      // ── Employees ──
      {
        path: 'employees',
        loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent)
      }
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
