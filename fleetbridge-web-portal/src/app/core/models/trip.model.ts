export interface RouteRequest {
  organizationId: string;
  name: string;
}

export interface RouteResponse {
  id: string;
  organizationId: string;
  name: string;
  status: string;
  createdAt: string;
  updatedAt: string;
}

export interface TripRequest {
  routeId: string;
  vehicleId: string;
  driverId: string;
  scheduledStartTime: string;
  status?: string;
}

export interface TripResponse {
  id: string;
  routeId: string;
  vehicleId: string;
  driverId: string;
  status: string;
  scheduledStartTime: string;
  actualStartTime?: string;
  actualEndTime?: string;
  createdAt: string;
  updatedAt: string;
}
