import { Component, OnInit, inject } from '@angular/core';
import { CommonModule, DatePipe } from '@angular/common';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { forkJoin } from 'rxjs';

import { TripService } from '../core/services/trip.service';
import { TripResponse, RouteResponse } from '../core/models/trip.model';
import { AddTripDialogComponent } from './components/add-trip-dialog/add-trip-dialog.component';
import { AddRouteDialogComponent } from './components/add-route-dialog/add-route-dialog.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    MatTooltipModule,
    MatChipsModule
  ],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Trip Management</h1>
        <p class="page-subtitle">Schedule, dispatch and track enterprise trips</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" (click)="openAddRouteDialog()">
          <span class="btn-icon">🗺️</span>
          New Route
        </button>
        <button class="btn-primary" (click)="openAddTripDialog()">
          <span class="btn-icon">🚌</span>
          Schedule Trip
        </button>
      </div>
    </div>

    <!-- Stats Cards -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(99,102,241,0.15); color: #818cf8;">📅</div>
        <div class="stat-body">
          <span class="stat-value">{{ scheduledCount }}</span>
          <span class="stat-label">Scheduled</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: #34d399;">🟢</div>
        <div class="stat-body">
          <span class="stat-value">{{ activeCount }}</span>
          <span class="stat-label">Active</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(107,114,128,0.15); color: #9ca3af;">✅</div>
        <div class="stat-body">
          <span class="stat-value">{{ completedCount }}</span>
          <span class="stat-label">Completed</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(59,130,246,0.15); color: #60a5fa;">🗺️</div>
        <div class="stat-body">
          <span class="stat-value">{{ routes.length }}</span>
          <span class="stat-label">Routes</span>
        </div>
      </div>
    </div>

    <!-- Tabs -->
    <div class="tab-panel glass-panel">
      @if (isLoading) {
        <div class="loading-shade">
          <mat-spinner diameter="42"></mat-spinner>
        </div>
      }

      <mat-tab-group (selectedTabChange)="onTabChange($event.index)" animationDuration="200ms" class="trips-tabs">

        <!-- ─── Trips Tab ─── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">directions_bus</mat-icon>
            <span>Trips</span>
            <span class="tab-badge">{{ trips.length }}</span>
          </ng-template>

          <!-- Filter chips -->
          <div class="filter-row">
            @for (f of tripFilters; track f.value) {
              <button class="filter-chip"
                [class.active]="activeTripFilter === f.value"
                (click)="setTripFilter(f.value)">
                {{ f.label }}
                <span class="chip-count">{{ getTripCount(f.value) }}</span>
              </button>
            }
          </div>

          <table mat-table [dataSource]="filteredTrips" class="data-table">

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="status-badge" [ngClass]="row.status?.toLowerCase()">
                  {{ row.status }}
                </span>
              </td>
            </ng-container>

            <!-- Scheduled Time -->
            <ng-container matColumnDef="scheduledTime">
              <th mat-header-cell *matHeaderCellDef>Scheduled Start</th>
              <td mat-cell *matCellDef="let row" class="time-cell">
                {{ row.scheduledStartTime | date:'MMM d, y, h:mm a' }}
              </td>
            </ng-container>

            <!-- Route -->
            <ng-container matColumnDef="route">
              <th mat-header-cell *matHeaderCellDef>Route</th>
              <td mat-cell *matCellDef="let row">
                <span class="route-name">{{ getRouteName(row.routeId) }}</span>
                <span class="route-id-small">{{ row.routeId | slice:0:8 }}…</span>
              </td>
            </ng-container>

            <!-- Vehicle -->
            <ng-container matColumnDef="vehicleId">
              <th mat-header-cell *matHeaderCellDef>Vehicle ID</th>
              <td mat-cell *matCellDef="let row" class="mono-cell">
                {{ row.vehicleId | slice:0:8 }}…
              </td>
            </ng-container>

            <!-- Driver -->
            <ng-container matColumnDef="driverId">
              <th mat-header-cell *matHeaderCellDef>Driver ID</th>
              <td mat-cell *matCellDef="let row" class="mono-cell">
                {{ row.driverId | slice:0:8 }}…
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
              <td mat-cell *matCellDef="let row" class="text-right">
                <button mat-icon-button class="action-btn edit"
                  matTooltip="Edit Trip" (click)="openEditTripDialog(row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete"
                  matTooltip="Delete Trip" (click)="deleteTrip(row.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="tripColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: tripColumns;" class="table-row"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="tripColumns.length" class="empty-state">
                @if (!isLoading) {
                  <div class="empty-content">
                    <span class="empty-icon">🚌</span>
                    <h3>No trips found</h3>
                    <p>{{ activeTripFilter === 'ALL' ? 'Schedule your first trip to get started.' : 'No trips with this status.' }}</p>
                    @if (activeTripFilter === 'ALL') {
                      <button class="btn-primary mt-2" (click)="openAddTripDialog()">Schedule Trip</button>
                    }
                  </div>
                }
              </td>
            </tr>
          </table>
        </mat-tab>

        <!-- ─── Routes Tab ─── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon">route</mat-icon>
            <span>Routes</span>
            <span class="tab-badge">{{ routes.length }}</span>
          </ng-template>

          <table mat-table [dataSource]="routes" class="data-table">

            <!-- Name -->
            <ng-container matColumnDef="name">
              <th mat-header-cell *matHeaderCellDef>Route Name</th>
              <td mat-cell *matCellDef="let row" class="route-name-cell">
                <mat-icon class="route-icon">route</mat-icon>
                {{ row.name }}
              </td>
            </ng-container>

            <!-- Status -->
            <ng-container matColumnDef="status">
              <th mat-header-cell *matHeaderCellDef>Status</th>
              <td mat-cell *matCellDef="let row">
                <span class="status-badge" [ngClass]="(row.status || 'active').toLowerCase()">
                  {{ row.status || 'ACTIVE' }}
                </span>
              </td>
            </ng-container>

            <!-- Org ID -->
            <ng-container matColumnDef="organizationId">
              <th mat-header-cell *matHeaderCellDef>Organization ID</th>
              <td mat-cell *matCellDef="let row" class="mono-cell">
                {{ row.organizationId | slice:0:8 }}…
              </td>
            </ng-container>

            <!-- Trip Count -->
            <ng-container matColumnDef="tripCount">
              <th mat-header-cell *matHeaderCellDef>Trips</th>
              <td mat-cell *matCellDef="let row">
                <span class="trip-count-badge">{{ getTripsByRoute(row.id) }}</span>
              </td>
            </ng-container>

            <!-- Actions -->
            <ng-container matColumnDef="actions">
              <th mat-header-cell *matHeaderCellDef class="text-right">Actions</th>
              <td mat-cell *matCellDef="let row" class="text-right">
                <button mat-icon-button class="action-btn edit"
                  matTooltip="Edit Route" (click)="openEditRouteDialog(row)">
                  <mat-icon>edit</mat-icon>
                </button>
                <button mat-icon-button class="action-btn delete"
                  matTooltip="Delete Route" (click)="deleteRoute(row.id)">
                  <mat-icon>delete</mat-icon>
                </button>
              </td>
            </ng-container>

            <tr mat-header-row *matHeaderRowDef="routeColumns"></tr>
            <tr mat-row *matRowDef="let row; columns: routeColumns;" class="table-row"></tr>

            <tr class="mat-row" *matNoDataRow>
              <td [attr.colspan]="routeColumns.length" class="empty-state">
                @if (!isLoading) {
                  <div class="empty-content">
                    <span class="empty-icon">🗺️</span>
                    <h3>No routes defined</h3>
                    <p>Create a route to organize your trips.</p>
                    <button class="btn-primary mt-2" (click)="openAddRouteDialog()">Create Route</button>
                  </div>
                }
              </td>
            </tr>
          </table>
        </mat-tab>

      </mat-tab-group>
    </div>
  `,
  styles: [`
    /* ── Page Header ── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      margin-bottom: 1.5rem;
    }
    .page-title {
      margin: 0;
      font-size: 1.75rem;
      font-weight: 700;
      color: var(--text-primary, #f1f5f9);
    }
    .page-subtitle {
      margin: 0.25rem 0 0;
      color: var(--text-secondary, #94a3b8);
      font-size: 0.9rem;
    }
    .header-actions {
      display: flex;
      gap: 0.75rem;
    }
    .btn-primary {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: linear-gradient(135deg, #6366f1, #8b5cf6);
      color: white;
      border: none;
      border-radius: 10px;
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-primary:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(99,102,241,0.4); }
    .btn-secondary {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      background: rgba(255,255,255,0.06);
      color: var(--text-primary, #f1f5f9);
      border: 1px solid rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 0.6rem 1.25rem;
      font-size: 0.9rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s ease;
    }
    .btn-secondary:hover { background: rgba(255,255,255,0.1); }
    .btn-icon { font-size: 1rem; }
    .mt-2 { margin-top: 0.75rem; }

    /* ── Stats ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(4, 1fr);
      gap: 1rem;
      margin-bottom: 1.5rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      padding: 1.25rem 1.5rem;
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 14px;
      backdrop-filter: blur(12px);
      transition: border-color 0.2s;
    }
    .stat-card:hover { border-color: rgba(99,102,241,0.3); }
    .stat-icon {
      width: 48px; height: 48px;
      border-radius: 12px;
      display: flex; align-items: center; justify-content: center;
      font-size: 1.5rem;
      flex-shrink: 0;
    }
    .stat-body { display: flex; flex-direction: column; }
    .stat-value { font-size: 2rem; font-weight: 700; color: var(--text-primary, #f1f5f9); line-height: 1; }
    .stat-label { font-size: 0.78rem; color: var(--text-secondary, #94a3b8); margin-top: 0.25rem; text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Tab Panel ── */
    .glass-panel {
      background: rgba(255,255,255,0.04);
      backdrop-filter: blur(20px);
      -webkit-backdrop-filter: blur(20px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      overflow: hidden;
      position: relative;
      min-height: 400px;
    }
    .loading-shade {
      position: absolute; inset: 0; z-index: 10;
      background: rgba(15,23,42,0.6);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
    }

    /* ── Tabs ── */
    .trips-tabs { background: transparent; }
    ::ng-deep .trips-tabs .mat-mdc-tab-header {
      border-bottom: 1px solid rgba(255,255,255,0.08);
      background: rgba(255,255,255,0.02);
    }
    ::ng-deep .trips-tabs .mat-mdc-tab .mdc-tab__text-label {
      color: var(--text-secondary, #94a3b8);
    }
    ::ng-deep .trips-tabs .mat-mdc-tab.mdc-tab--active .mdc-tab__text-label {
      color: #818cf8;
    }
    ::ng-deep .trips-tabs .mdc-tab-indicator__content--underline {
      border-color: #818cf8 !important;
    }
    .tab-icon { font-size: 1.1rem; margin-right: 0.4rem; }
    .tab-badge {
      margin-left: 0.5rem;
      background: rgba(99,102,241,0.25);
      color: #a5b4fc;
      padding: 1px 8px;
      border-radius: 12px;
      font-size: 0.75rem;
      font-weight: 700;
    }

    /* ── Filter Chips ── */
    .filter-row {
      display: flex;
      gap: 0.5rem;
      padding: 1rem 1.5rem 0;
      flex-wrap: wrap;
    }
    .filter-chip {
      display: flex;
      align-items: center;
      gap: 0.4rem;
      padding: 0.35rem 0.9rem;
      border-radius: 20px;
      border: 1px solid rgba(255,255,255,0.1);
      background: rgba(255,255,255,0.04);
      color: var(--text-secondary, #94a3b8);
      font-size: 0.8rem;
      font-weight: 500;
      cursor: pointer;
      transition: all 0.2s;
    }
    .filter-chip:hover { border-color: rgba(99,102,241,0.4); color: #a5b4fc; }
    .filter-chip.active {
      background: rgba(99,102,241,0.15);
      border-color: rgba(99,102,241,0.4);
      color: #a5b4fc;
    }
    .chip-count {
      background: rgba(255,255,255,0.1);
      border-radius: 10px;
      padding: 0 6px;
      font-size: 0.7rem;
      font-weight: 700;
    }

    /* ── Table ── */
    .data-table {
      width: 100%;
      background: transparent !important;
    }
    ::ng-deep .data-table .mat-mdc-header-row {
      background: rgba(255,255,255,0.03) !important;
    }
    ::ng-deep .data-table .mat-mdc-header-cell {
      color: var(--text-secondary, #94a3b8) !important;
      font-size: 0.78rem;
      font-weight: 600;
      text-transform: uppercase;
      letter-spacing: 0.06em;
      border-bottom: 1px solid rgba(255,255,255,0.08) !important;
    }
    ::ng-deep .data-table .mat-mdc-cell {
      color: var(--text-primary, #f1f5f9) !important;
      border-bottom: 1px solid rgba(255,255,255,0.04) !important;
      font-size: 0.9rem;
    }
    .table-row { transition: background 0.15s; }
    ::ng-deep .data-table .table-row:hover .mat-mdc-cell {
      background: rgba(99,102,241,0.05) !important;
    }

    /* ── Status Badges ── */
    .status-badge {
      display: inline-block;
      padding: 0.25rem 0.7rem;
      border-radius: 20px;
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.04em;
      text-transform: uppercase;
    }
    .status-badge.scheduled, .status-badge.scheduled { background: rgba(99,102,241,0.15); color: #a5b4fc; border: 1px solid rgba(99,102,241,0.25); }
    .status-badge.active   { background: rgba(16,185,129,0.15); color: #34d399; border: 1px solid rgba(16,185,129,0.25); }
    .status-badge.completed { background: rgba(107,114,128,0.15); color: #9ca3af; border: 1px solid rgba(107,114,128,0.25); }
    .status-badge.cancelled { background: rgba(239,68,68,0.15); color: #f87171; border: 1px solid rgba(239,68,68,0.25); }

    /* ── Cell styles ── */
    .time-cell { font-size: 0.875rem; }
    .route-name { display: block; font-weight: 600; color: var(--text-primary, #f1f5f9); }
    .route-id-small { display: block; font-size: 0.7rem; color: var(--text-secondary, #94a3b8); font-family: monospace; }
    .mono-cell { font-family: monospace; font-size: 0.8rem; color: var(--text-secondary, #94a3b8); }
    .route-name-cell { display: flex; align-items: center; gap: 0.5rem; font-weight: 600; }
    .route-icon { font-size: 1rem; color: #34d399; }
    .trip-count-badge {
      display: inline-block;
      padding: 0.2rem 0.6rem;
      border-radius: 12px;
      background: rgba(59,130,246,0.15);
      color: #60a5fa;
      font-size: 0.78rem;
      font-weight: 700;
    }
    .text-right { text-align: right !important; }

    /* ── Action buttons ── */
    .action-btn { transition: all 0.2s; }
    .action-btn.edit { color: #6366f1 !important; }
    .action-btn.edit:hover { background: rgba(99,102,241,0.15) !important; }
    .action-btn.delete { color: #ef4444 !important; }
    .action-btn.delete:hover { background: rgba(239,68,68,0.15) !important; }

    /* ── Empty State ── */
    .empty-state { text-align: center !important; padding: 4rem 2rem !important; }
    .empty-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; }
    .empty-content h3 { margin: 0.5rem 0 0; font-size: 1.2rem; color: var(--text-primary, #f1f5f9); }
    .empty-content p { margin: 0; font-size: 0.9rem; color: var(--text-secondary, #94a3b8); }
  `]
})
export class TripsComponent implements OnInit {
  private tripService = inject(TripService);
  private dialog = inject(MatDialog);

  tripColumns = ['status', 'scheduledTime', 'route', 'vehicleId', 'driverId', 'actions'];
  routeColumns = ['name', 'status', 'organizationId', 'tripCount', 'actions'];

  trips: TripResponse[] = [];
  routes: RouteResponse[] = [];
  filteredTrips: TripResponse[] = [];
  isLoading = true;
  activeTripFilter = 'ALL';

  tripFilters = [
    { label: 'All',       value: 'ALL'       },
    { label: 'Scheduled', value: 'SCHEDULED' },
    { label: 'Active',    value: 'ACTIVE'    },
    { label: 'Completed', value: 'COMPLETED' },
    { label: 'Cancelled', value: 'CANCELLED' }
  ];

  /* ── Computed Stats ── */
  get scheduledCount() { return this.trips.filter(t => t.status === 'SCHEDULED').length; }
  get activeCount()    { return this.trips.filter(t => t.status === 'ACTIVE').length; }
  get completedCount() { return this.trips.filter(t => t.status === 'COMPLETED').length; }

  ngOnInit(): void {
    this.loadAll();
  }

  loadAll(): void {
    this.isLoading = true;
    forkJoin({
      trips:  this.tripService.getAllTrips(),
      routes: this.tripService.getRoutes()
    }).subscribe({
      next: ({ trips, routes }) => {
        this.trips  = trips;
        this.routes = routes;
        this.applyTripFilter();
        this.isLoading = false;
      },
      error: (err: any) => {
        console.error('Error loading trip data', err);
        this.isLoading = false;
      }
    });
  }

  onTabChange(_index: number): void {
    // Keep state in sync if needed
  }

  /* ── Filters ── */
  setTripFilter(value: string): void {
    this.activeTripFilter = value;
    this.applyTripFilter();
  }

  applyTripFilter(): void {
    this.filteredTrips = this.activeTripFilter === 'ALL'
      ? [...this.trips]
      : this.trips.filter(t => t.status === this.activeTripFilter);
  }

  getTripCount(status: string): number {
    return status === 'ALL' ? this.trips.length : this.trips.filter(t => t.status === status).length;
  }

  /* ── Helpers ── */
  getRouteName(routeId: string): string {
    return this.routes.find(r => r.id === routeId)?.name || '—';
  }

  getTripsByRoute(routeId: string): number {
    return this.trips.filter(t => t.routeId === routeId).length;
  }

  /* ── Trip Dialogs ── */
  openAddTripDialog(): void {
    this.dialog.open(AddTripDialogComponent, {
      width: '580px',
      disableClose: true,
      panelClass: 'glass-dialog',
      data: null
    }).afterClosed().subscribe(result => { if (result) this.loadAll(); });
  }

  openEditTripDialog(trip: TripResponse): void {
    this.dialog.open(AddTripDialogComponent, {
      width: '580px',
      disableClose: true,
      panelClass: 'glass-dialog',
      data: { trip }
    }).afterClosed().subscribe(result => { if (result) this.loadAll(); });
  }

  deleteTrip(id: string): void {
    if (!confirm('Delete this trip permanently?')) return;
    this.tripService.deleteTrip(id).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => console.error('Delete trip failed', err)
    });
  }

  /* ── Route Dialogs ── */
  openAddRouteDialog(): void {
    this.dialog.open(AddRouteDialogComponent, {
      width: '520px',
      disableClose: true,
      panelClass: 'glass-dialog',
      data: null
    }).afterClosed().subscribe(result => { if (result) this.loadAll(); });
  }

  openEditRouteDialog(route: RouteResponse): void {
    this.dialog.open(AddRouteDialogComponent, {
      width: '520px',
      disableClose: true,
      panelClass: 'glass-dialog',
      data: { route }
    }).afterClosed().subscribe(result => { if (result) this.loadAll(); });
  }

  deleteRoute(id: string): void {
    const tripCount = this.getTripsByRoute(id);
    const msg = tripCount > 0
      ? `This route has ${tripCount} trip(s). Deleting it may cause issues. Continue?`
      : 'Delete this route permanently?';
    if (!confirm(msg)) return;
    this.tripService.deleteRoute(id).subscribe({
      next: () => this.loadAll(),
      error: (err: any) => console.error('Delete route failed', err)
    });
  }
}
