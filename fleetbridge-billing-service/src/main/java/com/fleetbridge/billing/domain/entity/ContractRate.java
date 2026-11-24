package com.fleetbridge.billing.domain.entity;

import jakarta.persistence.*;
import lombok.*;

import java.math.BigDecimal;
import java.time.LocalDateTime;
import java.util.UUID;

@Entity
@Table(name = "contract_rates")
@Getter
@Setter
@Builder
@NoArgsConstructor
@AllArgsConstructor
public class ContractRate {

    @Id
    @GeneratedValue(strategy = GenerationType.UUID)
    private UUID id;

    @Column(name = "organization_id", nullable = false)
    private UUID organizationId;

    @Column(name = "travel_company_id", nullable = false)
    private UUID travelCompanyId;

    @Column(name = "base_trip_rate", nullable = false)
    private BigDecimal baseTripRate;

    @Column(name = "rate_per_km", nullable = false)
    private BigDecimal ratePerKm;

    @Column(name = "overtime_rate_per_hour", nullable = false)
    private BigDecimal overtimeRatePerHour;

    @Column(name = "tax_percentage", nullable = false)
    private BigDecimal taxPercentage;

    @Column(name = "created_at")
    private LocalDateTime createdAt;

    @Column(name = "updated_at")
    private LocalDateTime updatedAt;

    @PrePersist
    public void prePersist() {
        if (createdAt == null) createdAt = LocalDateTime.now();
        if (updatedAt == null) updatedAt = LocalDateTime.now();
    }

    @PreUpdate
    public void preUpdate() {
        updatedAt = LocalDateTime.now();
    }
}
