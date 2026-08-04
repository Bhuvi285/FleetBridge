package com.fleetbridge.trip.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class TripRequest {
    @NotNull(message = "Route ID is required")
    private UUID routeId;

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Driver ID is required")
    private UUID driverId;

    @NotNull(message = "Scheduled start time is required")
    private LocalDateTime scheduledStartTime;
}
