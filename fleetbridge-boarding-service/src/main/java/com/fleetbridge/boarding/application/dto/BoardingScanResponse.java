package com.fleetbridge.boarding.application.dto;

import lombok.Builder;
import lombok.Data;

@Data
@Builder
public class BoardingScanResponse {
    private String status; // SUCCESS, INVALID_QR, ALREADY_BOARDED
    private String message;
}
