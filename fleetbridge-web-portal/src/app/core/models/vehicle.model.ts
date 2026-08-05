export enum VehicleType {
  TRUCK = 'TRUCK',
  VAN = 'VAN',
  BUS = 'BUS',
  CAR = 'CAR'
}

export enum VehicleStatus {
  AVAILABLE = 'AVAILABLE',
  ON_TRIP = 'ON_TRIP',
  MAINTENANCE = 'MAINTENANCE',
  OUT_OF_SERVICE = 'OUT_OF_SERVICE'
}

export interface VehicleResponse {
  id: string;
  tenantId: string;
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  status: VehicleStatus;
  capacityPayload: number;
  createdAt: string;
  updatedAt: string;
}

export interface VehicleRequest {
  licensePlate: string;
  make: string;
  model: string;
  year: number;
  type: VehicleType;
  capacityPayload: number;
}
