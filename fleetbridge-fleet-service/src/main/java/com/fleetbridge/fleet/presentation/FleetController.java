package com.fleetbridge.fleet.presentation;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.fleet.application.dto.*;
import com.fleetbridge.fleet.application.service.FleetService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/fleet")
@RequiredArgsConstructor
public class FleetController {

    private final FleetService fleetService;

    // --- Travel Company Endpoints ---

    @PostMapping("/companies")
    public ResponseEntity<ApiResponse<TravelCompanyResponse>> createCompany(@Valid @RequestBody TravelCompanyRequest request) {
        ApiResponse<TravelCompanyResponse> response = fleetService.createTravelCompany(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/companies")
    public ResponseEntity<ApiResponse<List<TravelCompanyResponse>>> getAllCompanies() {
        return ResponseEntity.ok(fleetService.getAllTravelCompanies());
    }

    // --- Vehicle Endpoints ---

    @GetMapping("/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getAllVehicles() {
        return ResponseEntity.ok(fleetService.getAllVehicles());
    }

    @PostMapping("/vehicles")
    public ResponseEntity<ApiResponse<VehicleResponse>> registerVehicle(@Valid @RequestBody VehicleRequest request) {
        ApiResponse<VehicleResponse> response = fleetService.registerVehicle(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PutMapping("/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<VehicleResponse>> updateVehicle(
            @PathVariable UUID vehicleId,
            @Valid @RequestBody VehicleRequest request) {
        ApiResponse<VehicleResponse> response = fleetService.updateVehicle(vehicleId, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/vehicles/{vehicleId}")
    public ResponseEntity<ApiResponse<Void>> deleteVehicle(@PathVariable UUID vehicleId) {
        ApiResponse<Void> response = fleetService.deleteVehicle(vehicleId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/companies/{companyId}/vehicles")
    public ResponseEntity<ApiResponse<List<VehicleResponse>>> getVehiclesByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(fleetService.getVehiclesByCompany(companyId));
    }

    // --- Driver Endpoints ---

    @GetMapping("/drivers")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getAllDrivers() {
        return ResponseEntity.ok(fleetService.getAllDrivers());
    }

    @PostMapping("/drivers")
    public ResponseEntity<ApiResponse<DriverResponse>> onboardDriver(@Valid @RequestBody DriverRequest request) {
        ApiResponse<DriverResponse> response = fleetService.onboardDriver(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @PutMapping("/drivers/{driverId}")
    public ResponseEntity<ApiResponse<DriverResponse>> updateDriver(
            @PathVariable UUID driverId,
            @Valid @RequestBody DriverRequest request) {
        ApiResponse<DriverResponse> response = fleetService.updateDriver(driverId, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/drivers/{driverId}")
    public ResponseEntity<ApiResponse<Void>> deleteDriver(@PathVariable UUID driverId) {
        ApiResponse<Void> response = fleetService.deleteDriver(driverId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/companies/{companyId}/drivers")
    public ResponseEntity<ApiResponse<List<DriverResponse>>> getDriversByCompany(@PathVariable UUID companyId) {
        return ResponseEntity.ok(fleetService.getDriversByCompany(companyId));
    }
}
