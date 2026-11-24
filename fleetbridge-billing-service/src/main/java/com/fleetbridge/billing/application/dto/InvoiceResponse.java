package com.fleetbridge.billing.application.dto;

import lombok.AllArgsConstructor;
import lombok.Builder;
import lombok.Data;
import lombok.NoArgsConstructor;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Data
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class InvoiceResponse {
    private UUID id;
    private String invoiceNumber;
    private UUID tripId;
    private UUID organizationId;
    private UUID travelCompanyId;
    private BigDecimal distanceKm;
    private BigDecimal baseAmount;
    private BigDecimal distanceAmount;
    private BigDecimal taxAmount;
    private BigDecimal totalAmount;
    private String status;
    private LocalDateTime issuedAt;
    private LocalDateTime paidAt;
}
