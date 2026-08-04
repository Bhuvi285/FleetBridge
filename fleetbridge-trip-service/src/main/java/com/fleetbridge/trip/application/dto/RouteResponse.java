package com.fleetbridge.trip.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class RouteResponse {
    private UUID id;
    private UUID organizationId;
    private String name;
    private String status;
}
