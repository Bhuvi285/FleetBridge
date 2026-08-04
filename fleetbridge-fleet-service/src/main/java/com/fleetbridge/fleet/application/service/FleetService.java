package com.fleetbridge.fleet.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.fleet.application.dto.*;
import com.fleetbridge.fleet.application.mapper.FleetMapper;
import com.fleetbridge.fleet.domain.entity.Driver;
import com.fleetbridge.fleet.domain.entity.TravelCompany;
import com.fleetbridge.fleet.domain.entity.Vehicle;
import com.fleetbridge.fleet.infrastructure.repository.DriverRepository;
import com.fleetbridge.fleet.infrastructure.repository.TravelCompanyRepository;
import com.fleetbridge.fleet.infrastructure.repository.VehicleRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class FleetService {

    private final TravelCompanyRepository travelCompanyRepository;
    private final VehicleRepository vehicleRepository;
    private final DriverRepository driverRepository;
    private final FleetMapper fleetMapper;

    // --- Travel Company Operations ---

    public ApiResponse<TravelCompanyResponse> createTravelCompany(TravelCompanyRequest request) {
        TravelCompany company = fleetMapper.toEntity(request);
        company = travelCompanyRepository.save(company);
        return ApiResponse.success(fleetMapper.toResponse(company), "Travel Company created successfully");
    }

    public ApiResponse<List<TravelCompanyResponse>> getAllTravelCompanies() {
        List<TravelCompanyResponse> companies = travelCompanyRepository.findAll().stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(companies, "Travel Companies retrieved successfully");
    }

    // --- Vehicle Operations ---

    public ApiResponse<VehicleResponse> registerVehicle(VehicleRequest request) {
        if (!travelCompanyRepository.existsById(request.getTravelCompanyId())) {
            return ApiResponse.error("Travel Company not found");
        }
        if (vehicleRepository.existsByRegistrationPlate(request.getRegistrationPlate())) {
            return ApiResponse.error("Registration plate already exists");
        }
        Vehicle vehicle = fleetMapper.toEntity(request);
        vehicle.setStatus("ACTIVE");
        vehicle = vehicleRepository.save(vehicle);
        return ApiResponse.success(fleetMapper.toResponse(vehicle), "Vehicle registered successfully");
    }

    public ApiResponse<List<VehicleResponse>> getVehiclesByCompany(UUID companyId) {
        List<VehicleResponse> vehicles = vehicleRepository.findByTravelCompanyId(companyId).stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles, "Vehicles retrieved successfully");
    }

    // --- Driver Operations ---

    public ApiResponse<DriverResponse> onboardDriver(DriverRequest request) {
        if (!travelCompanyRepository.existsById(request.getTravelCompanyId())) {
            return ApiResponse.error("Travel Company not found");
        }
        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            return ApiResponse.error("License number already exists");
        }
        Driver driver = fleetMapper.toEntity(request);
        driver.setStatus("ACTIVE");
        driver = driverRepository.save(driver);
        return ApiResponse.success(fleetMapper.toResponse(driver), "Driver onboarded successfully");
    }

    public ApiResponse<List<DriverResponse>> getDriversByCompany(UUID companyId) {
        List<DriverResponse> drivers = driverRepository.findByTravelCompanyId(companyId).stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(drivers, "Drivers retrieved successfully");
    }
}
