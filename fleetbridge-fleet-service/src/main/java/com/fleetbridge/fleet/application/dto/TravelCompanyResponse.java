package com.fleetbridge.fleet.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class TravelCompanyResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private String registrationNumber;
}
