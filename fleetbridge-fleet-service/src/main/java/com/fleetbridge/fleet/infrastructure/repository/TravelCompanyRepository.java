package com.fleetbridge.fleet.infrastructure.repository;

import com.fleetbridge.fleet.domain.entity.TravelCompany;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;

@Repository
public interface TravelCompanyRepository extends JpaRepository<TravelCompany, UUID> {
}
