package com.fleetbridge.fleet.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class VehicleResponse {
    private UUID id;
    private UUID travelCompanyId;
    private String registrationPlate;
    private String make;
    private String model;
    private Integer year;
    private String type;
    private Integer seatingCapacity;
    private String status;
}
