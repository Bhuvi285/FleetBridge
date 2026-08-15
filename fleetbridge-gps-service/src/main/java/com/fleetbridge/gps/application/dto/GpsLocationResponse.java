package com.fleetbridge.gps.application.dto;

import lombok.Builder;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
public class GpsLocationResponse {
    private UUID id;
    private UUID tripId;
    private UUID vehicleId;
    private Double latitude;
    private Double longitude;
    private Double speedKmh;
    private Double heading;
    private Double accuracy;
    private LocalDateTime recordedAt;
}
