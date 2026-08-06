import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { VehicleResponse, VehicleRequest } from '../models/vehicle.model';
import { environment } from '../../../environments/environment';

interface ApiResponse<T> {
  success: boolean;
  data: T;
  message: string;
}

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  // Using the API Gateway URL which routes /api/v1/fleet to fleetbridge-fleet-service
  private apiUrl = `${environment.apiBaseUrl}/api/v1/fleet/vehicles`;

  getVehicles(): Observable<VehicleResponse[]> {
    return this.http.get<ApiResponse<VehicleResponse[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  getVehicleById(id: string): Observable<VehicleResponse> {
    return this.http.get<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`).pipe(
      map(response => response.data)
    );
  }

  createVehicle(vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<ApiResponse<VehicleResponse>>(this.apiUrl, vehicle).pipe(
      map(response => response.data)
    );
  }

  updateVehicle(id: string, vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.put<ApiResponse<VehicleResponse>>(`${this.apiUrl}/${id}`, vehicle).pipe(
      map(response => response.data)
    );
  }

  deleteVehicle(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/${id}`);
  }
}

