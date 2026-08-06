import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import { DriverRequest, DriverResponse } from '../models/driver.model';

export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
  timestamp: string;
}

@Injectable({
  providedIn: 'root'
})
export class DriverService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiUrl}/api/v1/fleet/drivers`;

  getDrivers(): Observable<DriverResponse[]> {
    return this.http.get<ApiResponse<DriverResponse[]>>(this.apiUrl).pipe(
      map(response => response.data || [])
    );
  }

  onboardDriver(driver: DriverRequest): Observable<DriverResponse> {
    return this.http.post<ApiResponse<DriverResponse>>(this.apiUrl, driver).pipe(
      map(response => response.data)
    );
  }
}
