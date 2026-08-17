import { Component, signal, computed, inject } from '@angular/core';
import { RouterOutlet, RouterLink, RouterLinkActive } from '@angular/router';
import { CommonModule } from '@angular/common';
import { ToastContainerComponent } from '../../shared/toast-container/toast-container.component';
import { AuthService } from '../../core/services/auth.service';

interface NavItem {
  label: string;
  icon: string;
  route: string;
}

@Component({
  selector: 'app-main-layout',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, RouterLinkActive, ToastContainerComponent],
  template: `
    <app-toast-container />
    <div class="main-layout" [class.sidebar-collapsed]="sidebarCollapsed()">
      <!-- Sidebar -->
      <aside class="sidebar">
        <div class="sidebar-header">
          <div class="logo">
            <span class="logo-icon">🚌</span>
            <span class="logo-text" *ngIf="!sidebarCollapsed()">FleetBridge</span>
          </div>
          <button class="toggle-btn" (click)="toggleSidebar()">
            <span class="toggle-icon">{{ sidebarCollapsed() ? '→' : '←' }}</span>
          </button>
        </div>

        <nav class="sidebar-nav">
          @for (item of navItems(); track item.route) {
            <a class="nav-item"
               [routerLink]="item.route"
               routerLinkActive="active">
              <span class="nav-icon">{{ item.icon }}</span>
              <span class="nav-label" *ngIf="!sidebarCollapsed()">{{ item.label }}</span>
            </a>
          }
        </nav>

        <div class="sidebar-footer">
          <button class="nav-item logout-btn" (click)="logout()">
            <span class="nav-icon">🚪</span>
            <span class="nav-label" *ngIf="!sidebarCollapsed()">Logout</span>
          </button>
        </div>
      </aside>

      <!-- Main Content -->
      <div class="main-content">
        <!-- Top Header Bar -->
        <header class="top-bar">
          <div class="top-bar-left">
            <h2 class="page-title">FleetBridge Portal</h2>
          </div>
          <div class="top-bar-right">
            <div class="user-info">
              <span class="user-avatar">👤</span>
              <span class="user-name">{{ authService.currentUser()?.name ?? 'User' }}</span>
            </div>
          </div>
        </header>

        <!-- Page Content -->
        <main class="page-content">
          <router-outlet />
        </main>
      </div>
    </div>
  `,
  styles: [`
    .main-layout {
      display: flex;
      min-height: 100vh;
      background: var(--bg-primary);
    }

    /* Sidebar */
    .sidebar {
      width: 260px;
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-right: 1px solid var(--border-glass);
      display: flex;
      flex-direction: column;
      transition: width 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      position: fixed;
      top: 0;
      left: 0;
      bottom: 0;
      z-index: 100;
    }

    .sidebar-collapsed .sidebar {
      width: 72px;
    }

    .sidebar-header {
      padding: 1.25rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      border-bottom: 1px solid var(--border-glass);
    }

    .logo {
      display: flex;
      align-items: center;
      gap: 0.75rem;
    }

    .logo-icon {
      font-size: 1.75rem;
    }

    .logo-text {
      font-size: 1.25rem;
      font-weight: 700;
      background: linear-gradient(135deg, var(--accent-primary), var(--accent-secondary));
      -webkit-background-clip: text;
      -webkit-text-fill-color: transparent;
      white-space: nowrap;
    }

    .toggle-btn {
      background: none;
      border: none;
      cursor: pointer;
      color: var(--text-secondary);
      font-size: 1.25rem;
      padding: 0.25rem;
      border-radius: 6px;
      transition: background 0.2s;
    }

    .toggle-btn:hover {
      background: var(--hover-glass);
    }

    /* Navigation */
    .sidebar-nav {
      flex: 1;
      padding: 1rem 0.75rem;
      display: flex;
      flex-direction: column;
      gap: 0.25rem;
      overflow-y: auto;
    }

    .nav-item {
      display: flex;
      align-items: center;
      gap: 0.75rem;
      padding: 0.75rem 1rem;
      border-radius: 10px;
      color: var(--text-secondary);
      text-decoration: none;
      font-weight: 500;
      font-size: 0.9rem;
      transition: all 0.2s ease;
      cursor: pointer;
      border: none;
      background: none;
      width: 100%;
      text-align: left;
    }

    .nav-item:hover {
      background: var(--hover-glass);
      color: var(--text-primary);
    }

    .nav-item.active {
      background: linear-gradient(135deg, var(--accent-primary-alpha), var(--accent-secondary-alpha));
      color: var(--accent-primary);
      font-weight: 600;
    }

    .nav-icon {
      font-size: 1.25rem;
      flex-shrink: 0;
    }

    .nav-label {
      white-space: nowrap;
      overflow: hidden;
    }

    /* Sidebar Footer */
    .sidebar-footer {
      padding: 0.75rem;
      border-top: 1px solid var(--border-glass);
    }

    .logout-btn {
      color: var(--danger) !important;
    }

    .logout-btn:hover {
      background: rgba(239, 68, 68, 0.1) !important;
    }

    /* Main Content */
    .main-content {
      flex: 1;
      margin-left: 260px;
      transition: margin-left 0.3s cubic-bezier(0.4, 0, 0.2, 1);
      display: flex;
      flex-direction: column;
    }

    .sidebar-collapsed .main-content {
      margin-left: 72px;
    }

    /* Top Bar */
    .top-bar {
      height: 64px;
      padding: 0 2rem;
      display: flex;
      align-items: center;
      justify-content: space-between;
      background: var(--surface-glass);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border-bottom: 1px solid var(--border-glass);
      position: sticky;
      top: 0;
      z-index: 50;
    }

    .page-title {
      font-size: 1.15rem;
      font-weight: 600;
      color: var(--text-primary);
    }

    .user-info {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.5rem 1rem;
      border-radius: 10px;
      background: var(--hover-glass);
    }

    .user-avatar {
      font-size: 1.25rem;
    }

    .user-name {
      font-size: 0.9rem;
      font-weight: 500;
      color: var(--text-primary);
    }

    /* Page Content */
    .page-content {
      flex: 1;
      padding: 2rem;
    }
  `],
})
export class MainLayoutComponent {
  sidebarCollapsed = signal(false);
  public authService = inject(AuthService);

  // Navigation items per role
  private allNavItems: (NavItem & { roles?: string[] })[] = [
    { label: 'Dashboard',     icon: '📊', route: '/dashboard' },
    { label: 'Organizations', icon: '🏢', route: '/organizations', roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
    { label: 'Employees',     icon: '👥', route: '/employees',     roles: ['SUPER_ADMIN', 'ORG_ADMIN'] },
    { label: 'Vehicles',      icon: '🚌', route: '/vehicles',      roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN'] },
    { label: 'Drivers',       icon: '👨‍✈️', route: '/drivers',       roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN'] },
    { label: 'Trips',         icon: '🗺️', route: '/trips',         roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN', 'ORG_ADMIN'] },
    { label: 'Live Tracking', icon: '📍', route: '/tracking',      roles: ['SUPER_ADMIN', 'TRAVEL_ADMIN', 'ORG_ADMIN'] },
  ];

  readonly navItems = computed(() => {
    const roles = this.authService.userRoles();
    // If no roles resolved yet (e.g. demo mode), show all items
    if (!roles || roles.length === 0) return this.allNavItems;
    return this.allNavItems.filter(item =>
      !item.roles || item.roles.some(r => roles.includes(r))
    );
  });

  toggleSidebar(): void {
    this.sidebarCollapsed.update(v => !v);
  }

  logout(): void {
    this.authService.logout();
  }
}
