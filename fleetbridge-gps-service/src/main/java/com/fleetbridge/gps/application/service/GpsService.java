package com.fleetbridge.gps.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.gps.application.dto.GpsLocationRequest;
import com.fleetbridge.gps.application.dto.GpsLocationResponse;
import com.fleetbridge.gps.domain.entity.GpsLocation;
import com.fleetbridge.gps.infrastructure.repository.GpsLocationRepository;
import lombok.RequiredArgsConstructor;
import lombok.extern.slf4j.Slf4j;
import org.springframework.messaging.simp.SimpMessagingTemplate;
import org.springframework.stereotype.Service;

import java.time.LocalDateTime;
import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Slf4j
@Service
@RequiredArgsConstructor
public class GpsService {

    private final GpsLocationRepository gpsLocationRepository;
    private final SimpMessagingTemplate messagingTemplate;

    /**
     * Ingest a single GPS ping from a vehicle/driver app.
     * 1. Persists the location to the database.
     * 2. Broadcasts it in real-time to all WebSocket subscribers watching this trip.
     */
    public ApiResponse<GpsLocationResponse> ingestLocation(GpsLocationRequest request) {
        GpsLocation entity = GpsLocation.builder()
                .tripId(request.getTripId())
                .vehicleId(request.getVehicleId())
                .latitude(request.getLatitude())
                .longitude(request.getLongitude())
                .speedKmh(request.getSpeedKmh())
                .heading(request.getHeading())
                .accuracy(request.getAccuracy())
                .recordedAt(request.getRecordedAt() != null
                        ? request.getRecordedAt()
                        : LocalDateTime.now())
                .build();

        entity = gpsLocationRepository.save(entity);
        GpsLocationResponse response = toResponse(entity);

        // Broadcast to WebSocket subscribers on /topic/trip/{tripId}
        String destination = "/topic/trip/" + request.getTripId();
        messagingTemplate.convertAndSend(destination, response);
        log.debug("Broadcasted GPS ping for trip {} to {}", request.getTripId(), destination);

        return ApiResponse.success(response, "Location ingested successfully");
    }

    /**
     * Fetch the latest GPS ping for a given trip (current vehicle position).
     */
    public ApiResponse<GpsLocationResponse> getLatestLocation(UUID tripId) {
        return gpsLocationRepository.findLatestByTripId(tripId)
                .map(loc -> ApiResponse.success(toResponse(loc), "Latest location retrieved"))
                .orElse(ApiResponse.error("No location data found for this trip"));
    }

    /**
     * Fetch the full location trail for a trip (used to draw route polyline on map).
     */
    public ApiResponse<List<GpsLocationResponse>> getTripTrail(UUID tripId) {
        List<GpsLocationResponse> trail = gpsLocationRepository
                .findByTripIdOrderByRecordedAtAsc(tripId)
                .stream()
                .map(this::toResponse)
                .collect(Collectors.toList());

        return ApiResponse.success(trail, "Trip trail retrieved — " + trail.size() + " points");
    }

    // --- Private helpers ---

    private GpsLocationResponse toResponse(GpsLocation entity) {
        return GpsLocationResponse.builder()
                .id(entity.getId())
                .tripId(entity.getTripId())
                .vehicleId(entity.getVehicleId())
                .latitude(entity.getLatitude())
                .longitude(entity.getLongitude())
                .speedKmh(entity.getSpeedKmh())
                .heading(entity.getHeading())
                .accuracy(entity.getAccuracy())
                .recordedAt(entity.getRecordedAt())
                .build();
    }
}
