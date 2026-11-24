package com.fleetbridge.billing.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "invoices")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class Invoice {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "invoice_number", unique = true, nullable = false)
    private String invoiceNumber;

    @Column(name = "trip_id", nullable = false)
    private UUID tripId;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "travel_company_id", nullable = false)
    private UUID travelCompanyId;

    @Column(name = "distance_km", nullable = false)
    private BigDecimal distanceKm;

    @Column(name = "base_amount", nullable = false)
    private BigDecimal baseAmount;

    @Column(name = "distance_amount", nullable = false)
    private BigDecimal distanceAmount;

    @Column(name = "tax_amount", nullable = false)
    private BigDecimal taxAmount;

    @Column(name = "total_amount", nullable = false)
    private BigDecimal totalAmount;

    @Column(name = "status", nullable = false)
    private String status;

    @Column(name = "issued_at")
    private LocalDateTime issuedAt;

    @Column(name = "paid_at")
    private LocalDateTime paidAt;

    @PrePersist
    public void prePersist() {
        if (issuedAt == null) {
            issuedAt = LocalDateTime.now();
        }
        if (status == null) {
            status = "ISSUED";
        }
    }
}
