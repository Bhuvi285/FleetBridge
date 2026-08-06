export enum DriverStatus {
  ACTIVE = 'ACTIVE',
  ON_TRIP = 'ON_TRIP',
  INACTIVE = 'INACTIVE',
  SUSPENDED = 'SUSPENDED'
}

export interface DriverResponse {
  id: string;
  travelCompanyId: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber: string;
  status: DriverStatus | string;
}

export interface DriverRequest {
  travelCompanyId?: string;
  firstName: string;
  lastName: string;
  licenseNumber: string;
  phoneNumber?: string;
}
