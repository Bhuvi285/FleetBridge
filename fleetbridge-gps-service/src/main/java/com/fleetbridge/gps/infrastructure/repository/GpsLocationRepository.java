package com.fleetbridge.gps.infrastructure.repository;

import com.fleetbridge.gps.domain.entity.GpsLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GpsLocationRepository extends JpaRepository<GpsLocation, UUID> {

    /**
     * Get the latest GPS ping for a given trip — used to show "current position" on the map.
     */
    Optional<GpsLocation> findFirstByTripIdOrderByRecordedAtDesc(UUID tripId);

    /**
     * Get all location pings for a trip in chronological order — used to draw the route polyline.
     */
    List<GpsLocation> findByTripIdOrderByRecordedAtAsc(UUID tripId);

    /**
     * Get recent pings for a vehicle — useful for operational fleet overview.
     */
    List<GpsLocation> findTop10ByVehicleIdOrderByRecordedAtDesc(UUID vehicleId);
}

