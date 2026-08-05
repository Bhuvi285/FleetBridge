import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { VehicleResponse, VehicleRequest } from '../models/vehicle.model';
import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class VehicleService {
  private http = inject(HttpClient);
  // Using the API Gateway URL which routes /api/v1/fleet to fleetbridge-fleet-service
  private apiUrl = `${environment.apiBaseUrl}/api/v1/fleet/vehicles`;

  getVehicles(): Observable<VehicleResponse[]> {
    return this.http.get<VehicleResponse[]>(this.apiUrl);
  }

  getVehicleById(id: string): Observable<VehicleResponse> {
    return this.http.get<VehicleResponse>(`${this.apiUrl}/${id}`);
  }

  createVehicle(vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.post<VehicleResponse>(this.apiUrl, vehicle);
  }

  updateVehicle(id: string, vehicle: VehicleRequest): Observable<VehicleResponse> {
    return this.http.put<VehicleResponse>(`${this.apiUrl}/${id}`, vehicle);
  }

  deleteVehicle(id: string): Observable<void> {
    return this.http.delete<void>(`${this.apiUrl}/${id}`);
  }
}
