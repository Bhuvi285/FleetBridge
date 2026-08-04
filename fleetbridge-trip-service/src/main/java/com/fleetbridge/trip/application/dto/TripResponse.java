package com.fleetbridge.trip.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class TripResponse {
    private UUID id;
    private UUID routeId;
    private UUID vehicleId;
    private UUID driverId;
    private LocalDateTime scheduledStartTime;
    private LocalDateTime actualStartTime;
    private LocalDateTime actualEndTime;
    private String status;
}
