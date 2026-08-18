import { Component, OnInit, OnDestroy, inject, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { AuthService } from '../../core/services/auth.service';
import { TripService } from '../../core/services/trip.service';
import { GpsService } from '../../core/services/gps.service';
import { TripResponse } from '../../core/models/trip.model';
import { ToastService } from '../../core/services/toast.service';
import { ToastContainerComponent } from '../../shared/toast-container/toast-container.component';
import { forkJoin, Subscription, interval } from 'rxjs';
import { switchMap } from 'rxjs/operators';

@Component({
  selector: 'app-driver-dashboard',
  standalone: true,
  imports: [CommonModule, ToastContainerComponent],
  template: `
    <app-toast-container />

    <div class="driver-app">
      <!-- Header -->
      <div class="driver-header">
        <div class="header-left">
          <div class="app-logo">🚌</div>
          <div>
            <div class="app-name">FleetBridge Driver</div>
            <div class="driver-name">{{ authService.currentUser()?.name ?? 'Driver' }}</div>
          </div>
        </div>
        <button class="logout-btn" (click)="logout()">
          <span>⏻</span>
        </button>
      </div>

      <!-- GPS Status Banner -->
      @if (activeTrip()) {
        <div class="gps-banner" [class.gps-active]="isTracking()">
          <span class="gps-dot"></span>
          <span>{{ isTracking() ? 'GPS Broadcasting Live' : 'GPS Inactive' }}</span>
          @if (lastCoords()) {
            <span class="gps-coords">{{ lastCoords()!.lat.toFixed(4) }}, {{ lastCoords()!.lng.toFixed(4) }}</span>
          }
        </div>
      }

      <!-- Content -->
      <div class="driver-content">
        @if (isLoading()) {
          <div class="loading-state">
            <div class="spinner"></div>
            <p>Loading your trips...</p>
          </div>
        } @else {

          <!-- Active Trip Card -->
          @if (activeTrip(); as trip) {
            <div class="section-label">🟢 ACTIVE TRIP</div>
            <div class="trip-card active-card">
              <div class="trip-header">
                <div class="route-badge">{{ getRouteName(trip.routeId) }}</div>
                <div class="status-chip active">ACTIVE</div>
              </div>
              <div class="trip-meta">
                <div class="meta-item">
                  <span class="meta-label">Trip ID</span>
                  <span class="meta-value">{{ trip.id.slice(0, 8).toUpperCase() }}</span>
                </div>
                <div class="meta-item">
                  <span class="meta-label">Started</span>
                  <span class="meta-value">{{ trip.scheduledStartTime | date:'shortTime' }}</span>
                </div>
              </div>
              <div class="trip-actions">
                <button class="action-btn complete-btn" (click)="completeTrip(trip)">
                  ✅ Mark as Completed
                </button>
                <button class="action-btn cancel-btn" (click)="cancelTrip(trip)">
                  ❌ Cancel Trip
                </button>
              </div>
            </div>
          }

          <!-- Scheduled Trips -->
          @if (scheduledTrips().length > 0) {
            <div class="section-label">📅 UPCOMING TRIPS</div>
            @for (trip of scheduledTrips(); track trip.id) {
              <div class="trip-card scheduled-card">
                <div class="trip-header">
                  <div class="route-badge">{{ getRouteName(trip.routeId) }}</div>
                  <div class="status-chip scheduled">SCHEDULED</div>
                </div>
                <div class="trip-meta">
                  <div class="meta-item">
                    <span class="meta-label">Departure</span>
                    <span class="meta-value">{{ trip.scheduledStartTime | date:'h:mm a' }}</span>
                  </div>
                  <div class="meta-item">
                    <span class="meta-label">Date</span>
                    <span class="meta-value">{{ trip.scheduledStartTime | date:'MMM d' }}</span>
                  </div>
                </div>
                <button class="action-btn start-btn" (click)="startTrip(trip)">
                  🚀 Start Trip
                </button>
              </div>
            }
          }

          <!-- Empty State -->
          @if (!activeTrip() && scheduledTrips().length === 0) {
            <div class="empty-state">
              <div class="empty-icon">🏖️</div>
              <div class="empty-title">No trips today!</div>
              <div class="empty-sub">Check back later for new assignments.</div>
              <button class="refresh-btn" (click)="loadTrips()">Refresh</button>
            </div>
          }

          <!-- Completed Today -->
          @if (completedTrips().length > 0) {
            <div class="section-label">✅ COMPLETED TODAY ({{ completedTrips().length }})</div>
            @for (trip of completedTrips(); track trip.id) {
              <div class="trip-card completed-card">
                <div class="trip-header">
                  <div class="route-badge dim">{{ getRouteName(trip.routeId) }}</div>
                  <div class="status-chip completed">DONE</div>
                </div>
              </div>
            }
          }
        }
      </div>

      <!-- Bottom Nav -->
      <div class="bottom-nav">
        <div class="nav-item active-nav">
          <span>🏠</span><span>Home</span>
        </div>
        <div class="nav-item">
          <span>📍</span><span>Map</span>
        </div>
        <div class="nav-item">
          <span>📋</span><span>History</span>
        </div>
      </div>
    </div>
  `,
  styles: [`
    * { box-sizing: border-box; margin: 0; padding: 0; }

    .driver-app {
      min-height: 100vh;
      background: #0a0a14;
      display: flex;
      flex-direction: column;
      font-family: 'Inter', system-ui, sans-serif;
      color: #fff;
      max-width: 480px;
      margin: 0 auto;
      position: relative;
    }

    /* ── Header ── */
    .driver-header {
      display: flex;
      justify-content: space-between;
      align-items: center;
      padding: 1rem 1.25rem;
      background: rgba(255,255,255,0.03);
      border-bottom: 1px solid rgba(255,255,255,0.07);
      position: sticky;
      top: 0;
      z-index: 10;
    }
    .header-left { display: flex; align-items: center; gap: 0.75rem; }
    .app-logo { font-size: 1.75rem; }
    .app-name { font-size: 0.95rem; font-weight: 700; color: #818cf8; }
    .driver-name { font-size: 0.78rem; color: #6b7280; margin-top: 1px; }
    .logout-btn {
      background: rgba(239,68,68,0.1);
      border: 1px solid rgba(239,68,68,0.2);
      border-radius: 10px;
      color: #f87171;
      width: 38px; height: 38px;
      cursor: pointer;
      font-size: 1rem;
      display: flex; align-items: center; justify-content: center;
      transition: all 0.2s;
    }
    .logout-btn:hover { background: rgba(239,68,68,0.2); }

    /* ── GPS Banner ── */
    .gps-banner {
      display: flex;
      align-items: center;
      gap: 0.6rem;
      padding: 0.6rem 1.25rem;
      background: rgba(107,114,128,0.1);
      border-bottom: 1px solid rgba(255,255,255,0.05);
      font-size: 0.78rem;
      color: #9ca3af;
      transition: all 0.3s;
    }
    .gps-banner.gps-active {
      background: rgba(16,185,129,0.1);
      color: #34d399;
      border-bottom-color: rgba(16,185,129,0.2);
    }
    .gps-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #6b7280;
      flex-shrink: 0;
    }
    .gps-banner.gps-active .gps-dot {
      background: #34d399;
      box-shadow: 0 0 8px #34d399;
      animation: blink 1.5s infinite;
    }
    @keyframes blink { 0%,100% {opacity:1;} 50% {opacity:0.3;} }
    .gps-coords { margin-left: auto; font-size: 0.72rem; opacity: 0.7; }

    /* ── Content ── */
    .driver-content {
      flex: 1;
      padding: 1.25rem;
      padding-bottom: 5rem;
      display: flex;
      flex-direction: column;
      gap: 0.75rem;
      overflow-y: auto;
    }

    .section-label {
      font-size: 0.7rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      color: #6b7280;
      text-transform: uppercase;
      margin-top: 0.5rem;
    }

    /* ── Trip Cards ── */
    .trip-card {
      background: rgba(255,255,255,0.04);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 16px;
      padding: 1rem;
      display: flex;
      flex-direction: column;
      gap: 0.85rem;
    }
    .active-card {
      border-color: rgba(16,185,129,0.3);
      background: rgba(16,185,129,0.05);
      box-shadow: 0 0 20px rgba(16,185,129,0.08);
    }
    .scheduled-card { border-color: rgba(99,102,241,0.2); }
    .completed-card { opacity: 0.5; }

    .trip-header { display: flex; justify-content: space-between; align-items: center; }
    .route-badge {
      font-size: 0.95rem;
      font-weight: 700;
      color: #e5e7eb;
    }
    .route-badge.dim { color: #6b7280; font-size: 0.85rem; }

    .status-chip {
      font-size: 0.68rem;
      font-weight: 700;
      letter-spacing: 0.05em;
      padding: 0.2rem 0.6rem;
      border-radius: 20px;
    }
    .status-chip.active { background: rgba(16,185,129,0.15); color: #34d399; }
    .status-chip.scheduled { background: rgba(99,102,241,0.15); color: #818cf8; }
    .status-chip.completed { background: rgba(156,163,175,0.15); color: #9ca3af; }

    .trip-meta { display: grid; grid-template-columns: 1fr 1fr; gap: 0.5rem; }
    .meta-item { display: flex; flex-direction: column; gap: 2px; }
    .meta-label { font-size: 0.68rem; color: #6b7280; text-transform: uppercase; letter-spacing: 0.05em; }
    .meta-value { font-size: 0.88rem; font-weight: 600; color: #e5e7eb; }

    /* ── Action Buttons ── */
    .trip-actions { display: flex; flex-direction: column; gap: 0.5rem; }
    .action-btn {
      padding: 0.75rem 1rem;
      border-radius: 12px;
      border: none;
      font-size: 0.88rem;
      font-weight: 600;
      cursor: pointer;
      transition: all 0.2s;
      width: 100%;
    }
    .start-btn { background: rgba(99,102,241,0.2); color: #818cf8; border: 1px solid rgba(99,102,241,0.3); }
    .start-btn:hover { background: rgba(99,102,241,0.35); }
    .complete-btn { background: rgba(16,185,129,0.2); color: #34d399; border: 1px solid rgba(16,185,129,0.3); }
    .complete-btn:hover { background: rgba(16,185,129,0.35); }
    .cancel-btn { background: rgba(239,68,68,0.1); color: #f87171; border: 1px solid rgba(239,68,68,0.2); }
    .cancel-btn:hover { background: rgba(239,68,68,0.2); }

    /* ── Loading ── */
    .loading-state {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 1rem;
      color: #6b7280; font-size: 0.9rem;
      padding: 4rem 0;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(255,255,255,0.08);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Empty State ── */
    .empty-state {
      flex: 1; display: flex; flex-direction: column;
      align-items: center; justify-content: center; gap: 0.75rem;
      padding: 4rem 1rem; text-align: center;
    }
    .empty-icon { font-size: 3rem; }
    .empty-title { font-size: 1.1rem; font-weight: 700; color: #e5e7eb; }
    .empty-sub { font-size: 0.85rem; color: #6b7280; }
    .refresh-btn {
      margin-top: 0.5rem;
      padding: 0.6rem 1.5rem;
      border-radius: 10px;
      background: rgba(99,102,241,0.15);
      border: 1px solid rgba(99,102,241,0.3);
      color: #818cf8;
      font-size: 0.85rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .refresh-btn:hover { background: rgba(99,102,241,0.3); }

    /* ── Bottom Nav ── */
    .bottom-nav {
      position: fixed;
      bottom: 0;
      left: 50%;
      transform: translateX(-50%);
      width: 100%;
      max-width: 480px;
      display: grid;
      grid-template-columns: 1fr 1fr 1fr;
      background: rgba(10,10,20,0.95);
      border-top: 1px solid rgba(255,255,255,0.08);
      backdrop-filter: blur(12px);
      padding: 0.75rem 0 calc(0.75rem + env(safe-area-inset-bottom));
    }
    .nav-item {
      display: flex; flex-direction: column;
      align-items: center; gap: 3px;
      font-size: 0.65rem; color: #6b7280;
      cursor: pointer; transition: color 0.2s;
    }
    .nav-item span:first-child { font-size: 1.25rem; }
    .nav-item.active-nav { color: #818cf8; }
  `]
})
export class DriverDashboardComponent implements OnInit, OnDestroy {
  public authService = inject(AuthService);
  private tripService = inject(TripService);
  private gpsService = inject(GpsService);
  private toast = inject(ToastService);
  private router = inject(Router);

  isLoading = signal(true);
  isTracking = signal(false);
  lastCoords = signal<{ lat: number; lng: number } | null>(null);

  private allTrips: TripResponse[] = [];
  private routes: any[] = [];
  private geoWatchId: number | null = null;
  private refreshSub?: Subscription;

  activeTrip = signal<TripResponse | null>(null);
  scheduledTrips = signal<TripResponse[]>([]);
  completedTrips = signal<TripResponse[]>([]);

  ngOnInit(): void {
    this.loadTrips();
    // Auto-refresh every 30 seconds
    this.refreshSub = interval(30000).subscribe(() => this.loadTrips());
  }

  ngOnDestroy(): void {
    this.stopGps();
    this.refreshSub?.unsubscribe();
  }

  loadTrips(): void {
    this.isLoading.set(true);
    forkJoin({
      trips: this.tripService.getAllTrips(),
      routes: this.tripService.getRoutes()
    }).subscribe({
      next: ({ trips, routes }) => {
        this.routes = routes;
        // In a real app, filter by driverId from JWT token
        // For demo: show all trips
        this.activeTrip.set(trips.find(t => t.status === 'ACTIVE') ?? null);
        this.scheduledTrips.set(trips.filter(t => t.status === 'SCHEDULED'));
        this.completedTrips.set(trips.filter(t => t.status === 'COMPLETED'));
        this.isLoading.set(false);

        // If there's an active trip, start GPS
        if (this.activeTrip() && !this.isTracking()) {
          this.startGps();
        }
      },
      error: () => {
        this.toast.error('Failed to load trips. Check backend connection.');
        this.isLoading.set(false);
      }
    });
  }

  getRouteName(routeId: string): string {
    return this.routes.find(r => r.id === routeId)?.name ?? 'Unknown Route';
  }

  startTrip(trip: TripResponse): void {
    this.tripService.updateTripStatus(trip.id, 'ACTIVE').subscribe({
      next: () => {
        this.toast.success('Trip started! GPS is now broadcasting.');
        this.loadTrips();
        this.startGps();
      },
      error: () => this.toast.error('Failed to start trip.')
    });
  }

  completeTrip(trip: TripResponse): void {
    this.tripService.updateTripStatus(trip.id, 'COMPLETED').subscribe({
      next: () => {
        this.toast.success('Trip completed! Great work.');
        this.stopGps();
        this.loadTrips();
      },
      error: () => this.toast.error('Failed to complete trip.')
    });
  }

  cancelTrip(trip: TripResponse): void {
    if (!confirm('Are you sure you want to cancel this trip?')) return;
    this.tripService.updateTripStatus(trip.id, 'CANCELLED').subscribe({
      next: () => {
        this.toast.warning('Trip cancelled.');
        this.stopGps();
        this.loadTrips();
      },
      error: () => this.toast.error('Failed to cancel trip.')
    });
  }

  private startGps(): void {
    if (!navigator.geolocation) {
      this.toast.warning('GPS not available on this device.');
      return;
    }
    this.geoWatchId = navigator.geolocation.watchPosition(
      (pos) => {
        const { latitude, longitude, speed, heading } = pos.coords;
        this.isTracking.set(true);
        this.lastCoords.set({ lat: latitude, lng: longitude });

        const trip = this.activeTrip();
        if (trip) {
          this.gpsService.ingestLocation({
            tripId: trip.id,
            vehicleId: trip.vehicleId ?? '00000000-0000-0000-0000-000000000001',
            latitude,
            longitude,
            speedKmh: speed ? speed * 3.6 : 0,
            heading: heading ?? 0,
            accuracy: pos.coords.accuracy
          }).subscribe();
        }
      },
      (err) => {
        console.warn('GPS error:', err);
        this.isTracking.set(false);
      },
      { enableHighAccuracy: true, maximumAge: 5000, timeout: 10000 }
    );
  }

  private stopGps(): void {
    if (this.geoWatchId !== null) {
      navigator.geolocation.clearWatch(this.geoWatchId);
      this.geoWatchId = null;
    }
    this.isTracking.set(false);
    this.gpsService.disconnect();
  }

  logout(): void {
    this.stopGps();
    this.authService.logout();
  }
}
