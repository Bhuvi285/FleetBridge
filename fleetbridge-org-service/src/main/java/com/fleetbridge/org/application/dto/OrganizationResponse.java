package com.fleetbridge.org.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class OrganizationResponse {
    private UUID id;
    private String tenantId;
    private String name;
    private String industry;
}
