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
      {
        path: 'vehicles',
        loadComponent: () => import('./fleet/vehicles/vehicles.component').then(m => m.VehiclesComponent)
      },
      {
        path: 'drivers',
        loadComponent: () => import('./fleet/drivers/drivers.component').then(m => m.DriversComponent)
      },
      {
        path: 'trips',
        loadComponent: () => import('./trips/trips.component').then(m => m.TripsComponent)
      }
      // Future lazy loaded modules:
      // { path: 'tenants', loadChildren: () => import('./tenants/tenants.module').then(m => m.TenantsModule) },
    ]
  },
  {
    path: '**',
    redirectTo: '/dashboard'
  }
];
