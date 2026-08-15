package com.fleetbridge.gps.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.Data;

import java.time.LocalDateTime;
import java.util.UUID;

@Data
public class GpsLocationRequest {

    @NotNull(message = "Trip ID is required")
    private UUID tripId;

    @NotNull(message = "Vehicle ID is required")
    private UUID vehicleId;

    @NotNull(message = "Latitude is required")
    private Double latitude;

    @NotNull(message = "Longitude is required")
    private Double longitude;

    /** Speed in km/h — optional */
    private Double speedKmh;

    /** Compass heading in degrees (0–360) — optional */
    private Double heading;

    /** GPS accuracy in metres — optional */
    private Double accuracy;

    /**
     * Timestamp of when the location was recorded on the device.
     * If null, the server will use the current time.
     */
    private LocalDateTime recordedAt;
}
