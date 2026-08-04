package com.fleetbridge.fleet.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class DriverResponse {
    private UUID id;
    private UUID travelCompanyId;
    private String firstName;
    private String lastName;
    private String licenseNumber;
    private String phoneNumber;
    private String status;
}
