export enum OrganizationStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface OrganizationResponse {
  id: string;
  name: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
  status: OrganizationStatus | string;
  employeeCount?: number;
  createdAt?: string;
}

export interface OrganizationRequest {
  name: string;
  domain: string;
  contactEmail: string;
  contactPhone?: string;
}

export enum EmployeeStatus {
  ACTIVE   = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  ON_LEAVE = 'ON_LEAVE'
}

export interface EmployeeResponse {
  id: string;
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
  rfidTag?: string;
  status: EmployeeStatus | string;
}

export interface EmployeeRequest {
  organizationId: string;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber?: string;
  department?: string;
}
