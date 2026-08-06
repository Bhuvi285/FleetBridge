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

    public ApiResponse<List<VehicleResponse>> getAllVehicles() {
        List<VehicleResponse> vehicles = vehicleRepository.findAll().stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles, "Vehicles retrieved successfully");
    }

    public ApiResponse<VehicleResponse> registerVehicle(VehicleRequest request) {
        TravelCompany company;
        if (request.getTravelCompanyId() != null && travelCompanyRepository.existsById(request.getTravelCompanyId())) {
            company = travelCompanyRepository.findById(request.getTravelCompanyId()).orElseThrow();
        } else {
            company = travelCompanyRepository.findAll().stream().findFirst().orElseGet(() -> {
                TravelCompany newCompany = TravelCompany.builder()
                        .tenantId("default-tenant")
                        .name("Default Fleet Company")
                        .registrationNumber("REG-001")
                        .build();
                return travelCompanyRepository.save(newCompany);
            });
            request.setTravelCompanyId(company.getId());
        }

        if (vehicleRepository.existsByRegistrationPlate(request.getRegistrationPlate())) {
            return ApiResponse.error("Registration plate already exists");
        }
        Vehicle vehicle = fleetMapper.toEntity(request);
        vehicle.setTravelCompany(company);
        if (vehicle.getStatus() == null) {
            vehicle.setStatus("AVAILABLE");
        }
        vehicle = vehicleRepository.save(vehicle);
        return ApiResponse.success(fleetMapper.toResponse(vehicle), "Vehicle registered successfully");
    }

    public ApiResponse<VehicleResponse> updateVehicle(UUID vehicleId, VehicleRequest request) {
        Vehicle vehicle = vehicleRepository.findById(vehicleId).orElse(null);
        if (vehicle == null) {
            return ApiResponse.error("Vehicle not found with id: " + vehicleId);
        }
        // Check plate uniqueness only if it changed
        if (!vehicle.getRegistrationPlate().equals(request.getRegistrationPlate())
                && vehicleRepository.existsByRegistrationPlate(request.getRegistrationPlate())) {
            return ApiResponse.error("Registration plate already exists");
        }
        vehicle.setRegistrationPlate(request.getRegistrationPlate());
        vehicle.setMake(request.getMake());
        vehicle.setModel(request.getModel());
        vehicle.setYear(request.getYear());
        vehicle.setType(request.getType());
        vehicle.setSeatingCapacity(request.getSeatingCapacity());
        vehicle = vehicleRepository.save(vehicle);
        return ApiResponse.success(fleetMapper.toResponse(vehicle), "Vehicle updated successfully");
    }

    public ApiResponse<Void> deleteVehicle(UUID vehicleId) {
        if (!vehicleRepository.existsById(vehicleId)) {
            return ApiResponse.error("Vehicle not found with id: " + vehicleId);
        }
        vehicleRepository.deleteById(vehicleId);
        return ApiResponse.success(null, "Vehicle deleted successfully");
    }

    public ApiResponse<List<VehicleResponse>> getVehiclesByCompany(UUID companyId) {
        List<VehicleResponse> vehicles = vehicleRepository.findByTravelCompanyId(companyId).stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(vehicles, "Vehicles retrieved successfully");
    }

    // --- Driver Operations ---

    public ApiResponse<DriverResponse> onboardDriver(DriverRequest request) {
        TravelCompany company;
        if (request.getTravelCompanyId() != null && travelCompanyRepository.existsById(request.getTravelCompanyId())) {
            company = travelCompanyRepository.findById(request.getTravelCompanyId()).get();
        } else {
            company = travelCompanyRepository.findAll().stream().findFirst().orElseGet(() -> {
                TravelCompany newCompany = TravelCompany.builder()
                        .tenantId("DEFAULT")
                        .name("Default Fleet Company")
                        .registrationNumber("REG-001")
                        .build();
                return travelCompanyRepository.save(newCompany);
            });
            request.setTravelCompanyId(company.getId());
        }

        if (driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            return ApiResponse.error("License number already exists");
        }
        Driver driver = fleetMapper.toEntity(request);
        driver.setTravelCompany(company);
        if (driver.getStatus() == null) {
            driver.setStatus("ACTIVE");
        }
        driver = driverRepository.save(driver);
        return ApiResponse.success(fleetMapper.toResponse(driver), "Driver onboarded successfully");
    }

    public ApiResponse<List<DriverResponse>> getAllDrivers() {
        List<DriverResponse> drivers = driverRepository.findAll().stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(drivers, "Drivers retrieved successfully");
    }

    public ApiResponse<List<DriverResponse>> getDriversByCompany(UUID companyId) {
        List<DriverResponse> drivers = driverRepository.findByTravelCompanyId(companyId).stream()
                .map(fleetMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(drivers, "Drivers retrieved successfully");
    }

    public ApiResponse<DriverResponse> updateDriver(UUID driverId, DriverRequest request) {
        Driver driver = driverRepository.findById(driverId).orElse(null);
        if (driver == null) {
            return ApiResponse.error("Driver not found with id: " + driverId);
        }
        // Check license uniqueness only if it changed
        if (!driver.getLicenseNumber().equals(request.getLicenseNumber())
                && driverRepository.existsByLicenseNumber(request.getLicenseNumber())) {
            return ApiResponse.error("License number already exists");
        }
        driver.setFirstName(request.getFirstName());
        driver.setLastName(request.getLastName());
        driver.setLicenseNumber(request.getLicenseNumber());
        driver.setPhoneNumber(request.getPhoneNumber());
        driver = driverRepository.save(driver);
        return ApiResponse.success(fleetMapper.toResponse(driver), "Driver updated successfully");
    }

    public ApiResponse<Void> deleteDriver(UUID driverId) {
        if (!driverRepository.existsById(driverId)) {
            return ApiResponse.error("Driver not found with id: " + driverId);
        }
        driverRepository.deleteById(driverId);
        return ApiResponse.success(null, "Driver deleted successfully");
    }
}
