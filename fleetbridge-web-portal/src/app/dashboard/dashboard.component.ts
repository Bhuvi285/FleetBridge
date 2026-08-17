import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { forkJoin } from 'rxjs';
import { VehicleService } from '../core/services/vehicle.service';
import { DriverService } from '../core/services/driver.service';
import { TripService } from '../core/services/trip.service';

interface MetricCard {
  title: string;
  value: number | string;
  icon: string;
  color: string;
  bg: string;
  route: string;
  loading: boolean;
}

interface ActivityItem {
  icon: string;
  text: string;
  time: string;
  color: string;
}

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [CommonModule, RouterLink],
  template: `
    <div class="dashboard-container">

      <!-- Greeting -->
      <div class="greeting-row">
        <div>
          <h1 class="greeting-title">Fleet Operations Center</h1>
          <p class="greeting-sub">{{ todayDate | date:'EEEE, MMMM d, y' }} · Live Platform Overview</p>
        </div>
        <div class="status-pill">
          <span class="status-dot"></span>
          <span>All Systems Operational</span>
        </div>
      </div>

      <!-- Metric Cards -->
      <div class="metrics-grid">
        @for (card of metrics; track card.title) {
          <a [routerLink]="card.route" class="metric-card">
            <div class="metric-icon" [style.background]="card.bg" [style.color]="card.color">
              {{ card.icon }}
            </div>
            <div class="metric-body">
              @if (card.loading) {
                <div class="skeleton-val"></div>
              } @else {
                <span class="metric-value">{{ card.value }}</span>
              }
              <span class="metric-title">{{ card.title }}</span>
            </div>
            <div class="metric-arrow">›</div>
          </a>
        }
      </div>

      <!-- Second Row: Trip Stats + Activity -->
      <div class="grid-two-col">

        <!-- Trip Status Breakdown -->
        <div class="glass-card">
          <h3 class="card-title">
            <span class="card-title-icon">📊</span>
            Trip Status Breakdown
          </h3>
          @if (tripsLoading) {
            <div class="skeleton-bars">
              <div class="skeleton-bar" style="width: 80%"></div>
              <div class="skeleton-bar" style="width: 55%"></div>
              <div class="skeleton-bar" style="width: 35%"></div>
              <div class="skeleton-bar" style="width: 15%"></div>
            </div>
          } @else {
            <div class="bar-chart">
              @for (stat of tripStats; track stat.label) {
                <div class="bar-row">
                  <span class="bar-label">{{ stat.label }}</span>
                  <div class="bar-track">
                    <div class="bar-fill" [style.width.%]="stat.pct" [style.background]="stat.color"></div>
                  </div>
                  <span class="bar-count" [style.color]="stat.color">{{ stat.count }}</span>
                </div>
              }
              @if (totalTrips === 0) {
                <p class="empty-hint">No trips scheduled yet. <a routerLink="/trips">Schedule one →</a></p>
              }
            </div>
          }
        </div>

        <!-- Quick Actions -->
        <div class="glass-card">
          <h3 class="card-title">
            <span class="card-title-icon">⚡</span>
            Quick Actions
          </h3>
          <div class="quick-actions">
            <a routerLink="/vehicles" class="quick-action-btn vehicles">
              <span class="qa-icon">🚌</span>
              <div>
                <div class="qa-label">Add Vehicle</div>
                <div class="qa-sub">Register a new bus or van</div>
              </div>
            </a>
            <a routerLink="/drivers" class="quick-action-btn drivers">
              <span class="qa-icon">👨‍✈️</span>
              <div>
                <div class="qa-label">Onboard Driver</div>
                <div class="qa-sub">Add a new fleet driver</div>
              </div>
            </a>
            <a routerLink="/trips" class="quick-action-btn trips">
              <span class="qa-icon">🗺️</span>
              <div>
                <div class="qa-label">Schedule Trip</div>
                <div class="qa-sub">Dispatch a new route</div>
              </div>
            </a>
            <a routerLink="/organizations" class="quick-action-btn orgs">
              <span class="qa-icon">🏢</span>
              <div>
                <div class="qa-label">Add Organization</div>
                <div class="qa-sub">Onboard a corporate client</div>
              </div>
            </a>
          </div>
        </div>

      </div>

    </div>
  `,
  styles: [`
    .dashboard-container {
      display: flex;
      flex-direction: column;
      gap: 1.75rem;
    }

    /* ── Greeting ── */
    .greeting-row {
      display: flex;
      justify-content: space-between;
      align-items: center;
    }
    .greeting-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary);
    }
    .greeting-sub {
      margin: 0.25rem 0 0;
      color: var(--text-secondary);
      font-size: 0.9rem;
    }
    .status-pill {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      padding: 0.45rem 1rem;
      border-radius: 20px;
      background: rgba(16, 185, 129, 0.1);
      border: 1px solid rgba(16, 185, 129, 0.25);
      color: #34d399;
      font-size: 0.82rem;
      font-weight: 600;
    }
    .status-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
      animation: pulse 2s infinite;
    }
    @keyframes pulse { 0%,100% { opacity: 1; } 50% { opacity: 0.4; } }

    /* ── Metric Cards ── */
    .metrics-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
    }
    .metric-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      text-decoration: none;
      transition: transform 0.2s, border-color 0.2s, box-shadow 0.2s;
      cursor: pointer;
      position: relative;
      overflow: hidden;
    }
    .metric-card::before {
      content: '';
      position: absolute;
      inset: 0;
      background: linear-gradient(135deg, transparent, rgba(255,255,255,0.01));
      border-radius: inherit;
    }
    .metric-card:hover {
      transform: translateY(-3px);
      border-color: rgba(99,102,241,0.3);
      box-shadow: 0 12px 30px rgba(0,0,0,0.2);
    }
    .metric-icon {
      width: 52px; height: 52px;
      border-radius: 14px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .metric-body {
      display: flex;
      flex-direction: column;
      flex: 1;
    }
    .metric-value {
      font-size: 2rem;
      font-weight: 800;
      color: var(--text-primary);
      line-height: 1;
    }
    .metric-title {
      font-size: 0.78rem;
      color: var(--text-secondary);
      margin-top: 0.25rem;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }
    .metric-arrow {
      font-size: 1.4rem;
      color: var(--text-muted);
      margin-left: auto;
    }
    .skeleton-val {
      height: 2rem;
      width: 3rem;
      background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
      border-radius: 6px;
    }
    @keyframes shimmer { to { background-position: -200% 0; } }

    /* ── Two column grid ── */
    .grid-two-col {
      display: grid;
      grid-template-columns: 1fr 1fr;
      gap: 1rem;
    }

    /* ── Glass Card ── */
    .glass-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 1.5rem;
    }
    .card-title {
      display: flex;
      align-items: center;
      gap: 0.5rem;
      margin: 0 0 1.5rem;
      font-size: 1rem;
      font-weight: 600;
      color: var(--text-primary);
    }
    .card-title-icon { font-size: 1.1rem; }

    /* ── Bar Chart ── */
    .bar-chart { display: flex; flex-direction: column; gap: 1rem; }
    .bar-row { display: flex; align-items: center; gap: 0.75rem; }
    .bar-label { width: 90px; font-size: 0.82rem; color: var(--text-secondary); flex-shrink: 0; }
    .bar-track {
      flex: 1;
      height: 8px;
      background: rgba(255,255,255,0.07);
      border-radius: 4px;
      overflow: hidden;
    }
    .bar-fill {
      height: 100%;
      border-radius: 4px;
      transition: width 0.8s cubic-bezier(0.34, 1.56, 0.64, 1);
    }
    .bar-count { font-size: 0.85rem; font-weight: 700; min-width: 24px; text-align: right; }
    .empty-hint { color: var(--text-muted); font-size: 0.85rem; text-align: center; padding: 1rem; }
    .empty-hint a { color: #818cf8; text-decoration: none; }
    .skeleton-bars { display: flex; flex-direction: column; gap: 1rem; }
    .skeleton-bar {
      height: 8px; border-radius: 4px;
      background: linear-gradient(90deg, rgba(255,255,255,0.05), rgba(255,255,255,0.1), rgba(255,255,255,0.05));
      background-size: 200% 100%;
      animation: shimmer 1.5s infinite;
    }

    /* ── Quick Actions ── */
    .quick-actions { display: flex; flex-direction: column; gap: 0.75rem; }
    .quick-action-btn {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 0.85rem 1rem;
      border-radius: 12px;
      border: 1px solid rgba(255,255,255,0.08);
      text-decoration: none;
      transition: all 0.2s;
      cursor: pointer;
    }
    .quick-action-btn:hover { transform: translateX(4px); border-color: rgba(255,255,255,0.2); }
    .quick-action-btn.vehicles { background: rgba(99,102,241,0.08); }
    .quick-action-btn.vehicles:hover { background: rgba(99,102,241,0.15); }
    .quick-action-btn.drivers  { background: rgba(16,185,129,0.08); }
    .quick-action-btn.drivers:hover  { background: rgba(16,185,129,0.15); }
    .quick-action-btn.trips    { background: rgba(59,130,246,0.08); }
    .quick-action-btn.trips:hover    { background: rgba(59,130,246,0.15); }
    .quick-action-btn.orgs     { background: rgba(245,158,11,0.08); }
    .quick-action-btn.orgs:hover     { background: rgba(245,158,11,0.15); }
    .qa-icon { font-size: 1.5rem; flex-shrink: 0; }
    .qa-label { font-size: 0.9rem; font-weight: 600; color: var(--text-primary); }
    .qa-sub   { font-size: 0.78rem; color: var(--text-secondary); margin-top: 2px; }

    @media (max-width: 1100px) {
      .metrics-grid { grid-template-columns: repeat(2, 1fr); }
      .grid-two-col { grid-template-columns: 1fr; }
    }
  `]
})
export class DashboardComponent implements OnInit {
  private vehicleService = inject(VehicleService);
  private driverService  = inject(DriverService);
  private tripService    = inject(TripService);

  todayDate = new Date();
  tripsLoading = true;
  totalTrips = 0;

  metrics: MetricCard[] = [
    { title: 'Total Vehicles', value: '—', icon: '🚌', color: '#818cf8', bg: 'rgba(99,102,241,0.15)',  route: '/vehicles',      loading: true },
    { title: 'Active Drivers',  value: '—', icon: '👨‍✈️', color: '#34d399', bg: 'rgba(16,185,129,0.15)', route: '/drivers',       loading: true },
    { title: 'Scheduled Trips', value: '—', icon: '📅', color: '#60a5fa', bg: 'rgba(59,130,246,0.15)',  route: '/trips',         loading: true },
    { title: 'Active Trips',    value: '—', icon: '🟢', color: '#a78bfa', bg: 'rgba(139,92,246,0.15)', route: '/tracking',      loading: true },
  ];

  tripStats: { label: string; count: number; pct: number; color: string }[] = [];

  ngOnInit(): void {
    forkJoin({
      vehicles: this.vehicleService.getVehicles(),
      drivers:  this.driverService.getDrivers(),
      trips:    this.tripService.getAllTrips(),
    }).subscribe({
      next: ({ vehicles, drivers, trips }) => {
        // Vehicles card
        this.metrics[0].value   = vehicles.length;
        this.metrics[0].loading = false;

        // Drivers card
        const activeDrivers = drivers.filter(d => d.status === 'ACTIVE' || !d.status).length;
        this.metrics[1].value   = activeDrivers;
        this.metrics[1].loading = false;

        // Trip counts
        const scheduled = trips.filter(t => t.status === 'SCHEDULED').length;
        const active    = trips.filter(t => t.status === 'ACTIVE').length;
        const completed = trips.filter(t => t.status === 'COMPLETED').length;
        const cancelled = trips.filter(t => t.status === 'CANCELLED').length;
        this.totalTrips = trips.length;

        this.metrics[2].value   = scheduled;
        this.metrics[2].loading = false;
        this.metrics[3].value   = active;
        this.metrics[3].loading = false;

        const max = Math.max(scheduled, active, completed, cancelled, 1);
        this.tripStats = [
          { label: 'Scheduled', count: scheduled, pct: (scheduled / max) * 100, color: '#818cf8' },
          { label: 'Active',    count: active,    pct: (active    / max) * 100, color: '#34d399' },
          { label: 'Completed', count: completed, pct: (completed / max) * 100, color: '#9ca3af' },
          { label: 'Cancelled', count: cancelled, pct: (cancelled / max) * 100, color: '#f87171' },
        ];
        this.tripsLoading = false;
      },
      error: () => {
        this.metrics.forEach(m => { m.value = 'N/A'; m.loading = false; });
        this.tripsLoading = false;
      }
    });
  }
}
