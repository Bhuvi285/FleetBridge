package com.fleetbridge.billing.infrastructure.repository;

import com.fleetbridge.billing.domain.entity.ContractRate;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.Optional;
import java.util.UUID;

@Repository
public interface ContractRateRepository extends JpaRepository<ContractRate, UUID> {
    Optional<ContractRate> findByOrganizationIdAndTravelCompanyId(UUID organizationId, UUID travelCompanyId);
}
