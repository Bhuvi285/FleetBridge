import {
  Component, OnInit, OnDestroy, AfterViewInit, inject, signal
} from '@angular/core';
import { CommonModule } from '@angular/common';
import { Subscription } from 'rxjs';
import * as L from 'leaflet';

import { TripService } from '../core/services/trip.service';
import { GpsService, GpsLocationResponse } from '../core/services/gps.service';
import { TripResponse, RouteResponse } from '../core/models/trip.model';
import { ToastService } from '../core/services/toast.service';

// Fix Leaflet default icon path (webpack breaks it)
delete (L.Icon.Default.prototype as any)._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: 'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon-2x.png',
  iconUrl:       'https://unpkg.com/leaflet@1.9.4/dist/images/marker-icon.png',
  shadowUrl:     'https://unpkg.com/leaflet@1.9.4/dist/images/marker-shadow.png',
});

interface TripMarker {
  trip: TripResponse;
  routeName: string;
  marker: L.Marker;
  trail: L.Polyline;
  trailCoords: L.LatLng[];
  sub?: Subscription;
}

@Component({
  selector: 'app-live-map',
  standalone: true,
  imports: [CommonModule],
  template: `
    <!-- Page Header -->
    <div class="page-header">
      <div>
        <h1 class="page-title">Live Tracking</h1>
        <p class="page-subtitle">Real-time GPS tracking of all active fleet vehicles</p>
      </div>
      <div class="header-actions">
        <button class="btn-secondary" (click)="refreshTrips()">
          <span class="btn-icon">🔄</span>
          Refresh
        </button>
      </div>
    </div>

    <!-- Stats Bar -->
    <div class="stats-grid">
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(16,185,129,0.15); color: #34d399;">📡</div>
        <div class="stat-body">
          <span class="stat-value">{{ activeTrips().length }}</span>
          <span class="stat-label">Active Trips</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(99,102,241,0.15); color: #818cf8;">🚌</div>
        <div class="stat-body">
          <span class="stat-value">{{ connectedCount() }}</span>
          <span class="stat-label">Connected</span>
        </div>
      </div>
      <div class="stat-card">
        <div class="stat-icon" style="background: rgba(245,158,11,0.15); color: #fbbf24;">🛰️</div>
        <div class="stat-body">
          <span class="stat-value">{{ totalPings() }}</span>
          <span class="stat-label">GPS Pings</span>
        </div>
      </div>
    </div>

    <!-- Map Container -->
    <div class="map-wrapper glass-panel">
      <!-- Legend -->
      <div class="map-legend">
        <div class="legend-item">
          <span class="legend-dot" style="background: #34d399;"></span>
          <span>Active &amp; broadcasting</span>
        </div>
        <div class="legend-item">
          <span class="legend-dot" style="background: #818cf8;"></span>
          <span>Trail path</span>
        </div>
        <div class="legend-item ws-status" [class.connected]="wsConnected()">
          <span class="ws-dot"></span>
          <span>{{ wsConnected() ? 'WebSocket Connected' : 'Connecting...' }}</span>
        </div>
      </div>

      @if (isLoading()) {
        <div class="map-loading">
          <div class="spinner"></div>
          <p>Loading active trips...</p>
        </div>
      }

      <div id="live-map" class="live-map"></div>

      <!-- Trip Sidebar -->
      @if (tripMarkers.size > 0) {
        <div class="trip-sidebar">
          <div class="sidebar-title">Active Vehicles</div>
          @for (entry of tripMarkersArray(); track entry.trip.id) {
            <div class="vehicle-card" (click)="flyToTrip(entry)">
              <div class="vehicle-header">
                <span class="vehicle-icon">🚌</span>
                <span class="vehicle-route">{{ entry.routeName }}</span>
              </div>
              <div class="vehicle-meta">
                <span class="meta-small">{{ entry.trip.id.slice(0, 8).toUpperCase() }}</span>
                @if (entry.trailCoords.length > 0) {
                  <span class="meta-coord">
                    {{ entry.trailCoords[entry.trailCoords.length - 1].lat.toFixed(4) }},
                    {{ entry.trailCoords[entry.trailCoords.length - 1].lng.toFixed(4) }}
                  </span>
                }
              </div>
            </div>
          }
        </div>
      }
    </div>
  `,
  styles: [`
    /* ── Page Header ── */
    .page-header {
      display: flex;
      justify-content: space-between;
      align-items: flex-end;
      margin-bottom: 2rem;
    }
    .page-title {
      font-size: 1.8rem;
      font-weight: 700;
      color: var(--text-primary);
      margin: 0;
    }
    .page-subtitle {
      color: var(--text-secondary);
      font-size: 0.95rem;
      margin: 0.2rem 0 0;
    }
    .header-actions {
      display: flex;
      gap: 1rem;
    }
    .btn-secondary {
      background: rgba(255, 255, 255, 0.05);
      border: 1px solid rgba(255, 255, 255, 0.1);
      color: var(--text-primary);
      padding: 0.6rem 1.2rem;
      border-radius: 8px;
      cursor: pointer;
      display: flex;
      align-items: center;
      gap: 0.5rem;
      transition: background 0.2s;
    }
    .btn-secondary:hover {
      background: rgba(255, 255, 255, 0.1);
    }
    
    /* ── Stats Grid ── */
    .stats-grid {
      display: grid;
      grid-template-columns: repeat(3, 1fr);
      gap: 1rem;
      margin-bottom: 2rem;
    }
    .stat-card {
      display: flex;
      align-items: center;
      gap: 1rem;
      background: rgba(255, 255, 255, 0.03);
      border: 1px solid rgba(255, 255, 255, 0.08);
      padding: 1.25rem;
      border-radius: 12px;
    }
    .stat-icon {
      width: 48px;
      height: 48px;
      border-radius: 12px;
      display: flex;
      align-items: center;
      justify-content: center;
      font-size: 1.4rem;
    }
    .stat-body {
      display: flex;
      flex-direction: column;
    }
    .stat-value {
      font-size: 1.6rem;
      font-weight: 700;
      color: var(--text-primary);
      line-height: 1;
    }
    .stat-label {
      font-size: 0.8rem;
      color: var(--text-secondary);
      margin-top: 4px;
      text-transform: uppercase;
      letter-spacing: 0.05em;
    }

    /* ── Glass Panel ── */
    .glass-panel {
      background: rgba(30, 41, 59, 0.6);
      border: 1px solid rgba(255, 255, 255, 0.08);
      backdrop-filter: blur(12px);
      border-radius: 16px;
    }

    /* ── Map Wrapper ── */
    .map-wrapper {
      position: relative;
      border-radius: 16px;
      overflow: hidden;
      height: calc(100vh - 340px);
      min-height: 400px;
    }

    .live-map {
      width: 100%;
      height: 100%;
      z-index: 1;
    }

    /* ── Map Loading ── */
    .map-loading {
      position: absolute;
      inset: 0;
      display: flex;
      flex-direction: column;
      align-items: center;
      justify-content: center;
      gap: 1rem;
      background: rgba(10, 10, 20, 0.85);
      z-index: 10;
      color: var(--text-muted);
      font-size: 0.9rem;
    }
    .spinner {
      width: 36px; height: 36px;
      border: 3px solid rgba(255,255,255,0.08);
      border-top-color: #818cf8;
      border-radius: 50%;
      animation: spin 0.8s linear infinite;
    }
    @keyframes spin { to { transform: rotate(360deg); } }

    /* ── Legend ── */
    .map-legend {
      position: absolute;
      top: 12px;
      left: 12px;
      z-index: 5;
      display: flex;
      gap: 1rem;
      background: rgba(10, 10, 20, 0.85);
      backdrop-filter: blur(10px);
      padding: 0.5rem 1rem;
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
      font-size: 0.75rem;
      color: var(--text-secondary);
    }
    .legend-item {
      display: flex;
      align-items: center;
      gap: 6px;
    }
    .legend-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      flex-shrink: 0;
    }
    .ws-status .ws-dot {
      width: 8px; height: 8px;
      border-radius: 50%;
      background: #ef4444;
      flex-shrink: 0;
    }
    .ws-status.connected .ws-dot {
      background: #34d399;
      box-shadow: 0 0 8px rgba(52, 211, 153, 0.5);
      animation: blink 2s infinite;
    }
    @keyframes blink {
      0%, 100% { opacity: 1; }
      50% { opacity: 0.4; }
    }

    /* ── Trip Sidebar ── */
    .trip-sidebar {
      position: absolute;
      top: 56px;
      right: 12px;
      z-index: 5;
      width: 220px;
      max-height: calc(100% - 72px);
      overflow-y: auto;
      display: flex;
      flex-direction: column;
      gap: 0.5rem;
    }
    .sidebar-title {
      font-size: 0.72rem;
      font-weight: 700;
      letter-spacing: 0.08em;
      text-transform: uppercase;
      color: var(--text-muted);
      padding: 0.5rem 0.75rem;
      background: rgba(10, 10, 20, 0.85);
      backdrop-filter: blur(10px);
      border-radius: 10px;
      border: 1px solid rgba(255,255,255,0.08);
    }
    .vehicle-card {
      background: rgba(10, 10, 20, 0.85);
      backdrop-filter: blur(10px);
      border: 1px solid rgba(255,255,255,0.08);
      border-radius: 10px;
      padding: 0.65rem 0.75rem;
      cursor: pointer;
      transition: all 0.2s;
    }
    .vehicle-card:hover {
      border-color: rgba(99,102,241,0.4);
      background: rgba(99,102,241,0.08);
    }
    .vehicle-header {
      display: flex;
      align-items: center;
      gap: 0.5rem;
    }
    .vehicle-icon { font-size: 1.1rem; }
    .vehicle-route {
      font-size: 0.82rem;
      font-weight: 600;
      color: var(--text-primary);
      white-space: nowrap;
      overflow: hidden;
      text-overflow: ellipsis;
    }
    .vehicle-meta {
      display: flex;
      justify-content: space-between;
      margin-top: 4px;
    }
    .meta-small {
      font-size: 0.68rem;
      color: var(--text-muted);
      font-family: 'SF Mono', 'Fira Code', monospace;
    }
    .meta-coord {
      font-size: 0.65rem;
      color: #34d399;
      font-family: 'SF Mono', 'Fira Code', monospace;
    }

    /* ── Responsive ── */
    @media (max-width: 768px) {
      .trip-sidebar { display: none; }
      .map-legend { font-size: 0.65rem; gap: 0.5rem; padding: 0.4rem 0.75rem; }
    }
  `]
})
export class LiveMapComponent implements OnInit, AfterViewInit, OnDestroy {
  private tripService = inject(TripService);
  private gpsService = inject(GpsService);
  private toast = inject(ToastService);

  isLoading = signal(true);
  activeTrips = signal<TripResponse[]>([]);
  connectedCount = signal(0);
  totalPings = signal(0);
  wsConnected = signal(false);

  private map!: L.Map;
  private routes: RouteResponse[] = [];
  tripMarkers = new Map<string, TripMarker>();

  // Expose as array for template iteration
  tripMarkersArray = signal<TripMarker[]>([]);

  ngOnInit(): void {}

  ngAfterViewInit(): void {
    this.initMap();
    this.refreshTrips();
  }

  ngOnDestroy(): void {
    this.gpsService.disconnect();
    this.tripMarkers.forEach(tm => tm.sub?.unsubscribe());
    this.tripMarkers.clear();
  }

  private initMap(): void {
    // OpenStreetMap tiles — reliable and colorful
    const tiles = L.tileLayer(
      'https://tile.openstreetmap.org/{z}/{x}/{y}.png',
      {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>',
        maxZoom: 19
      }
    );

    this.map = L.map('live-map', {
      center: [20.5937, 78.9629], // Center of India
      zoom: 5,
      layers: [tiles],
      zoomControl: true
    });

    // Leaflet needs a size recalc after Angular renders the container
    setTimeout(() => {
      this.map.invalidateSize();
    }, 200);
  }

  async refreshTrips(): Promise<void> {
    this.isLoading.set(true);

    // Fetch routes + trips in parallel
    this.tripService.getRoutes().subscribe({
      next: (routes) => { this.routes = routes; },
      error: () => {}
    });

    this.tripService.getAllTrips().subscribe({
      next: async (trips) => {
        const active = trips.filter(t => t.status === 'ACTIVE');
        this.activeTrips.set(active);
        this.isLoading.set(false);

        if (active.length === 0) {
          this.toast.info('No active trips right now. Start a trip from the Driver PWA to see it here!');
          return;
        }

        // For each active trip, place a marker and subscribe to live GPS
        for (const trip of active) {
          await this.addTripToMap(trip);
        }

        this.connectedCount.set(this.tripMarkers.size);
        this.wsConnected.set(true);
        this.tripMarkersArray.set(Array.from(this.tripMarkers.values()));

        // Fit map to show all markers
        if (this.tripMarkers.size > 0) {
          const group = L.featureGroup(
            Array.from(this.tripMarkers.values()).map(tm => tm.marker)
          );
          this.map.fitBounds(group.getBounds().pad(0.3));
        }
      },
      error: () => {
        this.toast.error('Failed to load trips. Is the Trip Service running?');
        this.isLoading.set(false);
      }
    });
  }

  private async addTripToMap(trip: TripResponse): Promise<void> {
    if (this.tripMarkers.has(trip.id)) return;

    const routeName = this.getRouteName(trip.routeId);

    // Custom bus marker icon
    const busIcon = L.divIcon({
      className: 'bus-marker',
      html: `<div class="bus-marker-inner">🚌</div>`,
      iconSize: [36, 36],
      iconAnchor: [18, 18],
      popupAnchor: [0, -20]
    });

    // Start with a default position — will be updated by latest GPS or WS
    const marker = L.marker([0, 0], { icon: busIcon })
      .addTo(this.map)
      .bindPopup(this.buildPopup(trip, routeName, null));

    const trail = L.polyline([], {
      color: '#818cf8',
      weight: 3,
      opacity: 0.7,
      dashArray: '8 6'
    }).addTo(this.map);

    const tm: TripMarker = {
      trip, routeName, marker, trail,
      trailCoords: []
    };

    this.tripMarkers.set(trip.id, tm);

    // Try to fetch the latest known position
    this.gpsService.getLatestLocation(trip.id).subscribe({
      next: (loc) => {
        if (loc) {
          this.updateMarker(tm, loc);
        }
      },
      error: () => {} // no GPS yet — fine
    });

    // Fetch existing trail
    this.gpsService.getTripTrail(trip.id).subscribe({
      next: (points) => {
        if (points && points.length > 0) {
          const coords = points.map(p => L.latLng(p.latitude, p.longitude));
          tm.trailCoords = coords;
          tm.trail.setLatLngs(coords);
          // Fly to the latest
          const last = coords[coords.length - 1];
          tm.marker.setLatLng(last);
          tm.marker.setPopupContent(this.buildPopup(trip, routeName, points[points.length - 1]));
          this.map.flyTo(last, 14, { duration: 1.5 });
        }
      },
      error: () => {}
    });

    // Subscribe to live WebSocket updates
    try {
      const obs = await this.gpsService.watchTrip(trip.id);
      tm.sub = obs.subscribe({
        next: (loc) => {
          this.updateMarker(tm, loc);
          this.totalPings.update(n => n + 1);
        }
      });
    } catch (e) {
      console.warn('WebSocket connection failed for trip', trip.id, e);
    }
  }

  private updateMarker(tm: TripMarker, loc: GpsLocationResponse): void {
    const latlng = L.latLng(loc.latitude, loc.longitude);
    tm.marker.setLatLng(latlng);
    tm.trailCoords.push(latlng);
    tm.trail.addLatLng(latlng);
    tm.marker.setPopupContent(this.buildPopup(tm.trip, tm.routeName, loc));
    this.tripMarkersArray.set(Array.from(this.tripMarkers.values()));
  }

  private buildPopup(trip: TripResponse, routeName: string, loc: GpsLocationResponse | null): string {
    const coordStr = loc
      ? `${loc.latitude.toFixed(5)}, ${loc.longitude.toFixed(5)}`
      : 'Waiting for GPS...';
    const speedStr = loc?.speedKmh != null ? `${loc.speedKmh.toFixed(1)} km/h` : '—';
    const timeStr = loc?.recordedAt
      ? new Date(loc.recordedAt).toLocaleTimeString()
      : '—';

    return `
      <div style="font-family:'Inter',sans-serif; min-width: 180px;">
        <div style="font-weight:700; font-size:14px; margin-bottom:6px; color: #1e1b4b;">
          🚌 ${routeName}
        </div>
        <div style="font-size:11px; color:#6b7280; margin-bottom:8px;">
          Trip ${trip.id.slice(0, 8).toUpperCase()}
        </div>
        <table style="font-size:12px; width:100%; border-collapse:collapse;">
          <tr>
            <td style="color:#6b7280; padding:2px 8px 2px 0;">📍 Coords</td>
            <td style="font-weight:600;">${coordStr}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:2px 8px 2px 0;">🏎️ Speed</td>
            <td style="font-weight:600;">${speedStr}</td>
          </tr>
          <tr>
            <td style="color:#6b7280; padding:2px 8px 2px 0;">🕐 Updated</td>
            <td style="font-weight:600;">${timeStr}</td>
          </tr>
        </table>
      </div>
    `;
  }

  flyToTrip(tm: TripMarker): void {
    const pos = tm.marker.getLatLng();
    if (pos.lat !== 0 || pos.lng !== 0) {
      this.map.flyTo(pos, 16, { duration: 1 });
      tm.marker.openPopup();
    }
  }

  private getRouteName(routeId: string): string {
    return this.routes.find(r => r.id === routeId)?.name ?? `Route ${routeId.slice(0, 6)}`;
  }
}
