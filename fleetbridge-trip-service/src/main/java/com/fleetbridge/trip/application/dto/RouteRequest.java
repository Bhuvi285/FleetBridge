package com.fleetbridge.trip.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class RouteRequest {
    @NotNull(message = "Organization ID is required")
    private UUID organizationId;

    @NotBlank(message = "Route name is required")
    private String name;
}
