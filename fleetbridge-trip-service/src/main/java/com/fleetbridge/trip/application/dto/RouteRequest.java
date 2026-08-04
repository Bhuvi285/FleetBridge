package com.fleetbridge.trip.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.util.UUID;

@Data
public class RouteRequest {
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;

    @NotBlank(message = "Route name is required")
    private String name;
}
