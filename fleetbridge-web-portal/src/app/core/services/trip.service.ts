import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { RouteRequest, RouteResponse, TripRequest, TripResponse } from '../models/trip.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class TripService {
  private http = inject(HttpClient);
  // Using the API Gateway URL which routes /api/v1/trip to fleetbridge-trip-service
  private apiUrl = `${environment.apiBaseUrl}/api/v1/trip`;

  // --- Routes API ---
  getRoutes(): Observable<RouteResponse[]> {
    return this.http.get<ApiResponse<RouteResponse[]>>(`${this.apiUrl}/routes`).pipe(
      map(response => response.data || [])
    );
  }

  createRoute(route: RouteRequest): Observable<RouteResponse> {
    return this.http.post<ApiResponse<RouteResponse>>(`${this.apiUrl}/routes`, route).pipe(
      map(response => response.data)
    );
  }

  updateRoute(id: string, route: RouteRequest): Observable<RouteResponse> {
    return this.http.put<ApiResponse<RouteResponse>>(`${this.apiUrl}/routes/${id}`, route).pipe(
      map(response => response.data)
    );
  }

  deleteRoute(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/routes/${id}`);
  }

  // --- Trips API ---
  getAllTrips(): Observable<TripResponse[]> {
    return this.http.get<ApiResponse<TripResponse[]>>(`${this.apiUrl}/instances`).pipe(
      map(response => response.data || [])
    );
  }

  getTripsByRoute(routeId: string): Observable<TripResponse[]> {
    return this.http.get<ApiResponse<TripResponse[]>>(`${this.apiUrl}/routes/${routeId}/instances`).pipe(
      map(response => response.data || [])
    );
  }

  scheduleTrip(trip: TripRequest): Observable<TripResponse> {
    return this.http.post<ApiResponse<TripResponse>>(`${this.apiUrl}/instances`, trip).pipe(
      map(response => response.data)
    );
  }

  updateTrip(id: string, trip: TripRequest): Observable<TripResponse> {
    return this.http.put<ApiResponse<TripResponse>>(`${this.apiUrl}/instances/${id}`, trip).pipe(
      map(response => response.data)
    );
  }

  deleteTrip(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/instances/${id}`);
  }

  /** Convenience method used by Driver PWA to change only the status */
  updateTripStatus(id: string, status: string): Observable<TripResponse> {
    return this.http.patch<ApiResponse<TripResponse>>(`${this.apiUrl}/instances/${id}/status`, { status }).pipe(
      map(response => response.data)
    );
  }
}
