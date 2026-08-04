package com.fleetbridge.trip.infrastructure.client;

import com.fleetbridge.common.dto.ApiResponse;
import org.springframework.cloud.openfeign.FeignClient;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.PathVariable;

import java.util.UUID;

// We will map a generic object here or create a specific DTO if needed.
// For now, we just need to verify existence and get basic info.
// We use a wildcard/generic return type or define a minimal local DTO.

@FeignClient(name = "fleet-service", url = "${fleetbridge.services.fleet-service-url}")
public interface FleetServiceClient {

    @GetMapping("/api/v1/fleet/companies/{companyId}/vehicles")
    ApiResponse<?> getVehiclesByCompany(@PathVariable("companyId") UUID companyId);

    @GetMapping("/api/v1/fleet/companies/{companyId}/drivers")
    ApiResponse<?> getDriversByCompany(@PathVariable("companyId") UUID companyId);
}
