import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, Subject } from 'rxjs';
import { map } from 'rxjs/operators';
import { Client, IMessage } from '@stomp/stompjs';
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
  private locationSubject = new Subject<GpsLocationResponse>();

  constructor(private http: HttpClient) {}

  /** Ingest a GPS ping (called by driver app / simulation) */
  ingestLocation(request: GpsLocationRequest): Observable<GpsLocationResponse> {
    return this.http.post<any>(`${this.baseUrl}/ingest`, request).pipe(
      map(r => r.data)
    );
  }

  /** Get the latest (current) GPS ping for a trip */
  getLatestLocation(tripId: string): Observable<GpsLocationResponse> {
    return this.http.get<any>(`${this.baseUrl}/trips/${tripId}/latest`).pipe(
      map(r => r.data)
    );
  }

  /** Get the full trail (all pings) for a trip — used for polyline */
  getTripTrail(tripId: string): Observable<GpsLocationResponse[]> {
    return this.http.get<any>(`${this.baseUrl}/trips/${tripId}/trail`).pipe(
      map(r => r.data)
    );
  }

  /** Connect to WebSocket and subscribe to live updates for a trip */
  subscribeToTrip(tripId: string): Observable<GpsLocationResponse> {
    this.disconnect(); // clean up any previous connection

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

  /** Disconnect WebSocket */
  disconnect(): void {
    if (this.stompClient?.connected) {
      this.stompClient.deactivate();
    }
    this.stompClient = null;
  }
}
