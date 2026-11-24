package com.fleetbridge.boarding.application.dto;

import jakarta.validation.constraints.NotBlank;
import jakarta.validation.constraints.NotNull;
import lombok.Data;
import java.util.UUID;

@Data
public class BoardingScanRequest {
    @NotNull
    private UUID tripId;
    
    @NotBlank
    private String qrPayload;
}
