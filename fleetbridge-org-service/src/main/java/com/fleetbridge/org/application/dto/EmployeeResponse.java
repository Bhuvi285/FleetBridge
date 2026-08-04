package com.fleetbridge.org.application.dto;

import lombok.Builder;
import lombok.Data;

import java.util.UUID;

@Data
@Builder
public class EmployeeResponse {
    private UUID id;
    private UUID organizationId;
    private String firstName;
    private String lastName;
    private String email;
    private String phoneNumber;
    private String department;
}
