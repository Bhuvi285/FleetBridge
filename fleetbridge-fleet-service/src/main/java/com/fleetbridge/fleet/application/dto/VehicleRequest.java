package com.fleetbridge.fleet.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import jakarta.validation.constraints.Positive;
import lombok.Data;

import java.util.UUID;

@Data
public class VehicleRequest {
    @NotNull(message = "Travel Company ID is required")
    private UUID travelCompanyId;

    @NotBlank(message = "Registration plate is required")
    private String registrationPlate;

    private String make;
    private String model;

    @NotNull(message = "Seating capacity is required")
    @Positive(message = "Capacity must be positive")
    private Integer seatingCapacity;
}
