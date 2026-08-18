import { Routes } from '@angular/router';
import { AuthLayoutComponent } from './layout/auth-layout/auth-layout.component';
import { MainLayoutComponent } from './layout/main-layout/main-layout.component';
import { authGuard, guestGuard, roleGuard } from './core/guards/auth.guard';

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
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN'] },
        loadComponent: () => import('./fleet/vehicles/vehicles.component').then(m => m.VehiclesComponent)
      },
      {
        path: 'drivers',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN'] },
        loadComponent: () => import('./fleet/drivers/drivers.component').then(m => m.DriversComponent)
      },
      // ── Trips ──
      {
        path: 'trips',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN', 'ORG_ADMIN'] },
        loadComponent: () => import('./trips/trips.component').then(m => m.TripsComponent)
      },
      {
        path: 'tracking',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN', 'ORG_ADMIN'] },
        loadComponent: () => import('./trips/trips.component').then(m => m.TripsComponent)
      },
      // ── Organizations ──
      {
        path: 'organizations',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
        loadComponent: () => import('./organizations/organizations.component').then(m => m.OrganizationsComponent)
      },
      // ── Employees ──
      {
        path: 'employees',
        canActivate: [roleGuard],
        data: { roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
        loadComponent: () => import('./employees/employees.component').then(m => m.EmployeesComponent)
      }
    ]
  },
  // ── Driver PWA Portal (standalone, no admin sidebar) ──
  {
    path: 'driver',
    canActivate: [roleGuard],
    data: { roles: ['DRIVER', 'SUPER_ADMIN'] },
    loadComponent: () => import('./driver/driver-dashboard/driver-dashboard.component').then(m => m.DriverDashboardComponent)
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
