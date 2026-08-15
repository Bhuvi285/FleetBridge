package com.fleetbridge.trip.infrastructure.repository;

import com.fleetbridge.trip.domain.entity.TripInstance;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.UUID;

@Repository
public interface TripInstanceRepository extends JpaRepository<TripInstance, UUID> {
    List<TripInstance> findByRoute_Id(UUID routeId);
}
