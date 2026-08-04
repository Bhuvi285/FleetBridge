package com.fleetbridge.fleet.infrastructure.repository;

import com.fleetbridge.fleet.domain.entity.Driver;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface DriverRepository extends JpaRepository<Driver, UUID> {
    List<Driver> findByTravelCompanyId(UUID travelCompanyId);
    boolean existsByLicenseNumber(String licenseNumber);
}
