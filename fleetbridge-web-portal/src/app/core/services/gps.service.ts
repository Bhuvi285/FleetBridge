import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, IMessage, StompSubscription } from '@stomp/stompjs';
import SockJS from 'sockjs-client';
import { environment } from '../../../environments/environment';

export interface GpsLocationResponse {
  id: string;
  tripId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  heading?: number;
  accuracy?: number;
  recordedAt: string;
}

export interface GpsLocationRequest {
  tripId: string;
  vehicleId: string;
  latitude: number;
  longitude: number;
  speedKmh?: number;
  heading?: number;
  accuracy?: number;
  recordedAt?: string;
}

@Injectable({ providedIn: 'root' })
export class GpsService {
  private readonly baseUrl = `${environment.apiBaseUrl}/api/v1/gps`;
  private readonly wsUrl = `http://localhost:8084/ws/telemetry`;

  private stompClient: Client | null = null;
  private isConnected = false;

  /** Single subject for single-trip use (driver PWA) */
  private locationSubject = new Subject<GpsLocationResponse>();

  /** Multi-trip subjects for the Live Map */
  private tripSubjects = new Map<string, Subject<GpsLocationResponse>>();
  private tripSubs = new Map<string, StompSubscription>();

  constructor(private http: HttpClient) {}

  // ── REST Endpoints ──

  ingestLocation(request: GpsLocationRequest): Observable<GpsLocationResponse> {
    return this.http.post<any>(`${this.baseUrl}/ingest`, request).pipe(
      map(r => r.data)
    );
  }

  getLatestLocation(tripId: string): Observable<GpsLocationResponse> {
    return this.http.get<any>(`${this.baseUrl}/trips/${tripId}/latest`).pipe(
      map(r => r.data)
    );
  }

  getTripTrail(tripId: string): Observable<GpsLocationResponse[]> {
    return this.http.get<any>(`${this.baseUrl}/trips/${tripId}/trail`).pipe(
      map(r => r.data)
    );
  }

  // ── Single-Trip WebSocket (used by Driver PWA) ──

  subscribeToTrip(tripId: string): Observable<GpsLocationResponse> {
    this.disconnect();

    this.stompClient = new Client({
      webSocketFactory: () => new SockJS(this.wsUrl),
      reconnectDelay: 5000,
      onConnect: () => {
        this.stompClient!.subscribe(`/topic/trip/${tripId}`, (msg: IMessage) => {
          const location: GpsLocationResponse = JSON.parse(msg.body);
          this.locationSubject.next(location);
        });
      },
      onStompError: (frame) => {
        console.error('STOMP error', frame);
      }
    });

    this.stompClient.activate();
    return this.locationSubject.asObservable();
  }

  // ── Multi-Trip WebSocket (used by Admin Live Map) ──

  /** Ensure the shared STOMP connection is alive */
  private ensureConnected(): Promise<void> {
    if (this.isConnected && this.stompClient?.connected) {
      return Promise.resolve();
    }

    return new Promise((resolve) => {
      this.stompClient = new Client({
        webSocketFactory: () => new SockJS(this.wsUrl),
        reconnectDelay: 5000,
        onConnect: () => {
          this.isConnected = true;
          resolve();
        },
        onStompError: (frame) => {
          console.error('STOMP error', frame);
        },
        onDisconnect: () => {
          this.isConnected = false;
        }
      });
      this.stompClient.activate();
    });
  }

  /** Subscribe to live GPS pings for a specific trip (additive, does not kill other subs) */
  async watchTrip(tripId: string): Promise<Observable<GpsLocationResponse>> {
    await this.ensureConnected();

    // Already watching this trip
    if (this.tripSubjects.has(tripId)) {
      return this.tripSubjects.get(tripId)!.asObservable();
    }

    const subject = new Subject<GpsLocationResponse>();
    this.tripSubjects.set(tripId, subject);

    const sub = this.stompClient!.subscribe(`/topic/trip/${tripId}`, (msg: IMessage) => {
      const location: GpsLocationResponse = JSON.parse(msg.body);
      subject.next(location);
    });
    this.tripSubs.set(tripId, sub);

    return subject.asObservable();
  }

  /** Stop watching a specific trip */
  unwatchTrip(tripId: string): void {
    this.tripSubs.get(tripId)?.unsubscribe();
    this.tripSubs.delete(tripId);
    this.tripSubjects.get(tripId)?.complete();
    this.tripSubjects.delete(tripId);
  }

  /** Disconnect everything */
  disconnect(): void {
    // Clean up multi-trip subs
    this.tripSubs.forEach(sub => sub.unsubscribe());
    this.tripSubs.clear();
    this.tripSubjects.forEach(sub => sub.complete());
    this.tripSubjects.clear();

    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
    }
    this.stompClient = null;
    this.isConnected = false;
  }
}

