package com.fleetbridge.common.events;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.time.LocalDateTime;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class TripStatusChangedEvent {
    private String tripId;
    private String routeId;
    private String vehicleId;
    private String driverId;
    private String oldStatus;
    private String newStatus;
    private LocalDateTime timestamp;
}
