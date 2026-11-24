package com.fleetbridge.billing.application.dto;

import jakarta.validation.constraints.NotNull;
import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceRequest {

    @NotNull(message = "Trip ID is required")
    private UUID tripId;

    @NotNull(message = "Organization ID is required")
    private UUID organizationId;

    @NotNull(message = "Travel Company ID is required")
    private UUID travelCompanyId;

    private BigDecimal distanceKm;
}
