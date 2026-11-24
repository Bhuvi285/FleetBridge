import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
export interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

export interface BoardingScanRequest {
  tripId: string;
  qrPayload: string;
}

export interface BoardingScanResponse {
  status: 'SUCCESS' | 'INVALID_QR' | 'ALREADY_BOARDED' | 'ERROR';
  message: string;
}

import { environment } from '../../../environments/environment';

@Injectable({
  providedIn: 'root'
})
export class BoardingService {
  private http = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/v1/boarding`;

  scanQrCode(request: BoardingScanRequest): Observable<ApiResponse<BoardingScanResponse>> {
    return this.http.post<ApiResponse<BoardingScanResponse>>(`${this.apiUrl}/scan`, request);
  }

  getEmployeeQrCode(employeeId: string): Observable<ApiResponse<{qrCodeDataUrl: string}>> {
    return this.http.get<ApiResponse<{qrCodeDataUrl: string}>>(`${this.apiUrl}/qr/${employeeId}`);
  }
}
