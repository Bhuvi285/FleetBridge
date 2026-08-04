package com.fleetbridge.fleet.application.dto;

import jakarta.validation.constraints.NotBlank;
import lombok.Data;

@Data
public class TravelCompanyRequest {
    @NotBlank(message = "Tenant ID is required")
    private String tenantId;

    @NotBlank(message = "Company name is required")
    private String name;

    private String registrationNumber;
}
