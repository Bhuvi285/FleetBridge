import { Component, OnInit, OnDestroy, inject, ElementRef, ViewChild, AfterViewInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { CommonModule, DatePipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { MatTableModule } from '@angular/material/table';
import { MatButtonModule } from '@angular/material/button';
import { MatIconModule } from '@angular/material/icon';
import { MatProgressSpinnerModule } from '@angular/material/progress-spinner';
import { MatDialogModule, MatDialog } from '@angular/material/dialog';
import { MatTabsModule } from '@angular/material/tabs';
import { MatTooltipModule } from '@angular/material/tooltip';
import { MatChipsModule } from '@angular/material/chips';
import { MatSelectModule } from '@angular/material/select';
import { MatFormFieldModule } from '@angular/material/form-field';
import { forkJoin, Subscription } from 'rxjs';

import { TripService } from '../core/services/trip.service';
import { GpsService, GpsLocationResponse } from '../core/services/gps.service';
import { ToastService } from '../core/services/toast.service';
import { TripResponse, RouteResponse } from '../core/models/trip.model';
import { AddTripDialogComponent } from './components/add-trip-dialog/add-trip-dialog.component';
import { AddRouteDialogComponent } from './components/add-route-dialog/add-route-dialog.component';

@Component({
  selector: 'app-trips',
  standalone: true,
  imports: [
    CommonModule,
    DatePipe,
    FormsModule,
    MatTableModule,
    MatButtonModule,
    MatIconModule,
    MatProgressSpinnerModule,
    MatDialogModule,
    MatTabsModule,
    MatTooltipModule,
    MatChipsModule,
    MatSelectModule,
    MatFormFieldModule
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

      <mat-tab-group [(selectedIndex)]="selectedTabIndex" (selectedTabChange)="onTabChange($event.index)" animationDuration="200ms" class="trips-tabs">

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
                @if (row.status === 'SCHEDULED') {
                  <button mat-icon-button class="action-btn start"
                    matTooltip="Start Trip (ACTIVE)" (click)="changeTripStatus(row, 'ACTIVE')">
                    <mat-icon style="color: #34d399;">play_arrow</mat-icon>
                  </button>
                }
                @if (row.status === 'ACTIVE') {
                  <button mat-icon-button class="action-btn complete"
                    matTooltip="Complete Trip" (click)="changeTripStatus(row, 'COMPLETED')">
                    <mat-icon style="color: #60a5fa;">check_circle</mat-icon>
                  </button>
                }
                @if (row.status === 'SCHEDULED' || row.status === 'ACTIVE') {
                  <button mat-icon-button class="action-btn cancel"
                    matTooltip="Cancel Trip" (click)="changeTripStatus(row, 'CANCELLED')">
                    <mat-icon style="color: #f87171;">cancel</mat-icon>
                  </button>
                }
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

        <!-- ─── Live Tracking Tab ─── -->
        <mat-tab>
          <ng-template mat-tab-label>
            <mat-icon class="tab-icon" [class.pulse]="isTracking">my_location</mat-icon>
            <span>Live Tracking</span>
            @if (isTracking) { <span class="tab-badge live">LIVE</span> }
          </ng-template>

          <div class="tracking-panel">
            <!-- Trip selector -->
            <div class="tracking-controls">
              <div class="control-group">
                <label class="control-label">Select Trip to Track</label>
                <select class="trip-select" [(ngModel)]="selectedTripId" (change)="onTripSelectChange()">
                  <option value="">— Choose a trip —</option>
                  @for (t of trips; track t.id) {
                    <option [value]="t.id">
                      {{ getRouteName(t.routeId) }} · {{ t.status }} · {{ t.scheduledStartTime | date:'MMM d, h:mm a' }}
                    </option>
                  }
                </select>
              </div>
              <div class="tracking-actions">
                @if (!isTracking) {
                  <button class="btn-track" (click)="startTracking()" [disabled]="!selectedTripId">
                    <mat-icon>play_arrow</mat-icon> Start Tracking
                  </button>
                } @else {
                  <button class="btn-track stop" (click)="stopTracking()">
                    <mat-icon>stop</mat-icon> Stop
                  </button>
                  <button class="btn-simulate" (click)="simulatePing()" title="Send a simulated GPS ping">
                    <mat-icon>send</mat-icon> Simulate Ping
                  </button>
                }
              </div>
            </div>

            <!-- Map container -->
            <div class="map-wrapper">
              <div id="gps-map" class="leaflet-map"></div>
              @if (!isTracking) {
                <div class="map-overlay">
                  <div class="map-placeholder">
                    <span class="map-icon">📡</span>
                    <h3>No Active Tracking Session</h3>
                    <p>Select a trip and click <strong>Start Tracking</strong> to see real-time location updates.</p>
                  </div>
                </div>
              }
            </div>

            <!-- Live stats bar -->
            @if (isTracking && lastPing) {
              <div class="live-stats">
                <div class="live-stat">
                  <mat-icon>speed</mat-icon>
                  <span class="live-stat-value">{{ lastPing.speedKmh?.toFixed(1) ?? '—' }} km/h</span>
                  <span class="live-stat-label">Speed</span>
                </div>
                <div class="live-stat">
                  <mat-icon>explore</mat-icon>
                  <span class="live-stat-value">{{ lastPing.heading?.toFixed(0) ?? '—' }}°</span>
                  <span class="live-stat-label">Heading</span>
                </div>
                <div class="live-stat">
                  <mat-icon>location_on</mat-icon>
                  <span class="live-stat-value">{{ lastPing.latitude.toFixed(5) }}, {{ lastPing.longitude.toFixed(5) }}</span>
                  <span class="live-stat-label">Coordinates</span>
                </div>
                <div class="live-stat">
                  <mat-icon>schedule</mat-icon>
                  <span class="live-stat-value">{{ lastPing.recordedAt | date:'h:mm:ss a' }}</span>
                  <span class="live-stat-label">Last Update</span>
                </div>
                <div class="live-stat">
                  <mat-icon>pin_drop</mat-icon>
                  <span class="live-stat-value">{{ pingCount }}</span>
                  <span class="live-stat-label">Pings Received</span>
                </div>
              </div>
            }
          </div>
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
    /* ── Live Tracking Tab ── */
    .tracking-panel { padding: 1.25rem; display: flex; flex-direction: column; gap: 1rem; }

    .tracking-controls {
      display: flex;
      align-items: flex-end;
      gap: 1rem;
      flex-wrap: wrap;
    }
    .control-group { display: flex; flex-direction: column; gap: 0.4rem; flex: 1; min-width: 260px; }
    .control-label { font-size: 0.8rem; font-weight: 600; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; }
    .trip-select {
      background: rgba(255,255,255,0.06);
      border: 1px solid rgba(255,255,255,0.12);
      border-radius: 8px;
      color: var(--text-primary, #f1f5f9);
      padding: 0.6rem 0.9rem;
      font-size: 0.9rem;
      cursor: pointer;
      outline: none;
    }
    .trip-select:focus { border-color: #6366f1; }
    .trip-select option { background: #1e293b; }

    .tracking-actions { display: flex; gap: 0.75rem; align-items: center; }
    .btn-track {
      display: flex; align-items: center; gap: 0.4rem;
      background: linear-gradient(135deg, #10b981, #059669);
      color: white; border: none; border-radius: 10px;
      padding: 0.6rem 1.25rem; font-size: 0.9rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-track:hover { transform: translateY(-1px); box-shadow: 0 4px 20px rgba(16,185,129,0.4); }
    .btn-track:disabled { opacity: 0.5; cursor: not-allowed; transform: none; }
    .btn-track.stop { background: linear-gradient(135deg, #ef4444, #dc2626); }
    .btn-track.stop:hover { box-shadow: 0 4px 20px rgba(239,68,68,0.4); }
    .btn-simulate {
      display: flex; align-items: center; gap: 0.4rem;
      background: rgba(99,102,241,0.15); color: #818cf8;
      border: 1px solid rgba(99,102,241,0.3); border-radius: 10px;
      padding: 0.6rem 1rem; font-size: 0.85rem; font-weight: 600;
      cursor: pointer; transition: all 0.2s;
    }
    .btn-simulate:hover { background: rgba(99,102,241,0.25); }

    /* Pulsing icon for live status */
    .pulse { animation: pulse-anim 1.5s ease-in-out infinite; color: #10b981 !important; }
    @keyframes pulse-anim { 0%, 100% { opacity: 1; } 50% { opacity: 0.4; } }
    .tab-badge.live { background: #10b981; color: white; animation: pulse-anim 1.5s ease-in-out infinite; }

    /* Map */
    .map-wrapper { position: relative; border-radius: 12px; overflow: hidden; height: 420px; border: 1px solid rgba(255,255,255,0.08); }
    .leaflet-map { width: 100%; height: 100%; background: #0f172a; }
    .map-overlay {
      position: absolute; inset: 0;
      background: rgba(15,23,42,0.85);
      backdrop-filter: blur(4px);
      display: flex; align-items: center; justify-content: center;
      border-radius: 12px;
    }
    .map-placeholder { text-align: center; }
    .map-icon { font-size: 3rem; display: block; margin-bottom: 0.75rem; }
    .map-placeholder h3 { color: var(--text-primary, #f1f5f9); margin: 0 0 0.5rem; }
    .map-placeholder p { color: var(--text-secondary, #94a3b8); font-size: 0.9rem; margin: 0; }

    /* Live stats bar */
    .live-stats {
      display: flex; gap: 1rem; flex-wrap: wrap;
      background: rgba(16,185,129,0.08);
      border: 1px solid rgba(16,185,129,0.2);
      border-radius: 12px; padding: 1rem 1.25rem;
    }
    .live-stat { display: flex; flex-direction: column; align-items: center; gap: 0.2rem; flex: 1; min-width: 120px; }
    .live-stat mat-icon { color: #34d399; font-size: 1.1rem; width: 1.1rem; height: 1.1rem; }
    .live-stat-value { font-size: 1rem; font-weight: 700; color: var(--text-primary, #f1f5f9); }
    .live-stat-label { font-size: 0.75rem; color: var(--text-secondary, #94a3b8); text-transform: uppercase; letter-spacing: 0.05em; }

    /* ── Empty State ── */
    .empty-state { text-align: center !important; padding: 4rem 2rem !important; }
    .empty-content { display: flex; flex-direction: column; align-items: center; gap: 0.5rem; }
    .empty-icon { font-size: 3rem; }
    .empty-content h3 { margin: 0.5rem 0 0; font-size: 1.2rem; color: var(--text-primary, #f1f5f9); }
    .empty-content p { margin: 0; font-size: 0.9rem; color: var(--text-secondary, #94a3b8); }
  `]
})
export class TripsComponent implements OnInit, OnDestroy {
  private tripService = inject(TripService);
  private gpsService  = inject(GpsService);
  private dialog      = inject(MatDialog);
  private route       = inject(ActivatedRoute);
  private toast       = inject(ToastService);

  selectedTabIndex = 0;

  tripColumns  = ['status', 'scheduledTime', 'route', 'vehicleId', 'driverId', 'actions'];
  routeColumns = ['name', 'status', 'organizationId', 'tripCount', 'actions'];

  trips: TripResponse[]   = [];
  routes: RouteResponse[] = [];
  filteredTrips: TripResponse[] = [];
  isLoading       = true;
  activeTripFilter = 'ALL';

  /* ── Live Tracking State ── */
  selectedTripId = '';
  isTracking     = false;
  lastPing: GpsLocationResponse | null = null;
  pingCount      = 0;
  private gpsSub: Subscription | null = null;
  private leafletMap: any = null;
  private vehicleMarker: any = null;
  private trailPolyline: any = null;
  private trailCoords: [number, number][] = [];
  // Simulated location (starts at Bengaluru city centre)
  private simLat = 12.9716;
  private simLng = 77.5946;

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
    this.loadLeaflet();
    this.route.url.subscribe(segments => {
      if (segments.length > 0 && segments[0].path === 'tracking') {
        this.selectedTabIndex = 2;
        setTimeout(() => this.initMap(), 300);
      }
    });
  }

  ngOnDestroy(): void {
    this.stopTracking();
    if (this.leafletMap) { this.leafletMap.remove(); this.leafletMap = null; }
  }

  /* ── Load Leaflet from CDN ── */
  private loadLeaflet(): void {
    if ((window as any).L) return;
    const link = document.createElement('link');
    link.rel = 'stylesheet';
    link.href = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.css';
    document.head.appendChild(link);
    const script = document.createElement('script');
    script.src = 'https://unpkg.com/leaflet@1.9.4/dist/leaflet.js';
    document.head.appendChild(script);
  }

  private initMap(): void {
    const L = (window as any).L;
    if (!L || this.leafletMap) return;
    const el = document.getElementById('gps-map');
    if (!el) return;

    this.leafletMap = L.map('gps-map', { zoomControl: true }).setView([this.simLat, this.simLng], 14);
    L.tileLayer('https://{s}.basemaps.cartocdn.com/dark_all/{z}/{x}/{y}{r}.png', {
      attribution: '© OpenStreetMap © CARTO',
      maxZoom: 19
    }).addTo(this.leafletMap);

    const busIcon = L.divIcon({
      className: '',
      html: `<div style="font-size:2rem;filter:drop-shadow(0 2px 6px #10b981);">🚌</div>`,
      iconSize: [36, 36], iconAnchor: [18, 36]
    });
    this.vehicleMarker = L.marker([this.simLat, this.simLng], { icon: busIcon }).addTo(this.leafletMap);
    this.trailPolyline = L.polyline([], { color: '#10b981', weight: 3, opacity: 0.8 }).addTo(this.leafletMap);
  }

  private updateMarker(lat: number, lng: number): void {
    if (!this.leafletMap) return;
    this.vehicleMarker?.setLatLng([lat, lng]);
    this.trailCoords.push([lat, lng]);
    this.trailPolyline?.setLatLngs(this.trailCoords);
    this.leafletMap.panTo([lat, lng], { animate: true, duration: 0.5 });
  }

  onTripSelectChange(): void {
    if (this.isTracking) this.stopTracking();
  }

  startTracking(): void {
    if (!this.selectedTripId) return;
    this.isTracking    = true;
    this.pingCount     = 0;
    this.trailCoords   = [];
    this.lastPing      = null;

    // Init map after Angular renders the map div
    setTimeout(() => this.initMap(), 200);

    this.gpsSub = this.gpsService.subscribeToTrip(this.selectedTripId).subscribe({
      next: (ping: GpsLocationResponse) => {
        this.lastPing = ping;
        this.pingCount++;
        this.updateMarker(ping.latitude, ping.longitude);
      },
      error: (err: any) => console.error('WebSocket error', err)
    });

    // Also load historical trail
    this.gpsService.getTripTrail(this.selectedTripId).subscribe({
      next: (trail) => {
        if (trail?.length) {
          this.trailCoords = trail.map(p => [p.latitude, p.longitude] as [number, number]);
          const last = trail[trail.length - 1];
          this.lastPing = last;
          setTimeout(() => {
            this.trailPolyline?.setLatLngs(this.trailCoords);
            this.vehicleMarker?.setLatLng([last.latitude, last.longitude]);
            this.leafletMap?.panTo([last.latitude, last.longitude]);
          }, 300);
        }
      },
      error: () => {} // OK if no history yet
    });
  }

  stopTracking(): void {
    this.isTracking = false;
    this.gpsSub?.unsubscribe();
    this.gpsSub = null;
    this.gpsService.disconnect();
  }

  simulatePing(): void {
    if (!this.selectedTripId) return;
    // Walk in a small random direction
    this.simLat += (Math.random() - 0.5) * 0.001;
    this.simLng += (Math.random() - 0.4) * 0.001;

    const trip = this.trips.find(t => t.id === this.selectedTripId);
    this.gpsService.ingestLocation({
      tripId: this.selectedTripId,
      vehicleId: trip?.vehicleId ?? '00000000-0000-0000-0000-000000000001',
      latitude: this.simLat,
      longitude: this.simLng,
      speedKmh: 30 + Math.random() * 20,
      heading: Math.random() * 360,
      accuracy: 5.0
    }).subscribe({
      next: () => {},
      error: (err: any) => console.warn('Simulate ping error (is GPS service running?)', err)
    });
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

  onTabChange(index: number): void {
    this.selectedTabIndex = index;
    if (index === 2) {
      setTimeout(() => this.initMap(), 200);
    }
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
      next: () => { this.toast.success('Trip deleted.'); this.loadAll(); },
      error: () => this.toast.error('Failed to delete trip.')
    });
  }

  changeTripStatus(trip: TripResponse, newStatus: string): void {
    const actionLabel = newStatus === 'ACTIVE' ? 'start' : newStatus === 'COMPLETED' ? 'complete' : 'cancel';
    if (!confirm(`Are you sure you want to ${actionLabel} this trip?`)) return;

    this.tripService.updateTripStatus(trip.id, newStatus).subscribe({
      next: (updatedTrip) => {
        trip.status = newStatus;
        this.applyTripFilter();
        this.toast.success(`Trip status updated to ${newStatus}`);
      },
      error: (err: any) => {
        console.error('Failed to update trip status', err);
        this.toast.error(`Failed to update trip status to ${newStatus}`);
      }
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
      next: () => { this.toast.success('Route deleted.'); this.loadAll(); },
      error: () => this.toast.error('Failed to delete route.')
    });
  }
}
