package com.fleetbridge.gps.infrastructure.repository;

import com.fleetbridge.gps.domain.entity.GpsLocation;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;
import java.util.UUID;

@Repository
public interface GpsLocationRepository extends JpaRepository<GpsLocation, UUID> {

    /**
     * Get the latest GPS ping for a given trip — used to show "current position" on the map.
     */
    @Query("SELECT g FROM GpsLocation g WHERE g.tripId = :tripId ORDER BY g.recordedAt DESC LIMIT 1")
    Optional<GpsLocation> findLatestByTripId(@Param("tripId") UUID tripId);

    /**
     * Get all location pings for a trip in chronological order — used to draw the route polyline.
     */
    List<GpsLocation> findByTripIdOrderByRecordedAtAsc(UUID tripId);

    /**
     * Get recent pings for a vehicle — useful for operational fleet overview.
     */
    @Query("SELECT g FROM GpsLocation g WHERE g.vehicleId = :vehicleId ORDER BY g.recordedAt DESC LIMIT 10")
    List<GpsLocation> findRecentByVehicleId(@Param("vehicleId") UUID vehicleId);
}
