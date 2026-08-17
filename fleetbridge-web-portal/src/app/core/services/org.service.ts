import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, map } from 'rxjs';
import { environment } from '../../../environments/environment';
import {
  OrganizationRequest,
  OrganizationResponse,
  EmployeeRequest,
  EmployeeResponse
} from '../models/organization.model';

interface ApiResponse<T> {
  success: boolean;
  message: string;
  data: T;
}

@Injectable({ providedIn: 'root' })
export class OrgService {
  private http   = inject(HttpClient);
  private apiUrl = `${environment.apiBaseUrl}/api/v1/org`;

  // ── Organizations ──
  getOrganizations(): Observable<OrganizationResponse[]> {
    return this.http.get<ApiResponse<OrganizationResponse[]>>(`${this.apiUrl}/organizations`).pipe(
      map(r => r.data || [])
    );
  }

  createOrganization(req: OrganizationRequest): Observable<OrganizationResponse> {
    return this.http.post<ApiResponse<OrganizationResponse>>(`${this.apiUrl}/organizations`, req).pipe(
      map(r => r.data)
    );
  }

  updateOrganization(id: string, req: OrganizationRequest): Observable<OrganizationResponse> {
    return this.http.put<ApiResponse<OrganizationResponse>>(`${this.apiUrl}/organizations/${id}`, req).pipe(
      map(r => r.data)
    );
  }

  deleteOrganization(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/organizations/${id}`);
  }

  // ── Employees ──
  getEmployees(organizationId?: string): Observable<EmployeeResponse[]> {
    const url = organizationId
      ? `${this.apiUrl}/organizations/${organizationId}/employees`
      : `${this.apiUrl}/employees`;
    return this.http.get<ApiResponse<EmployeeResponse[]>>(url).pipe(
      map(r => r.data || [])
    );
  }

  createEmployee(req: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.post<ApiResponse<EmployeeResponse>>(`${this.apiUrl}/employees`, req).pipe(
      map(r => r.data)
    );
  }

  updateEmployee(id: string, req: EmployeeRequest): Observable<EmployeeResponse> {
    return this.http.put<ApiResponse<EmployeeResponse>>(`${this.apiUrl}/employees/${id}`, req).pipe(
      map(r => r.data)
    );
  }

  deleteEmployee(id: string): Observable<ApiResponse<void>> {
    return this.http.delete<ApiResponse<void>>(`${this.apiUrl}/employees/${id}`);
  }
}
