package com.fleetbridge.gps.presentation.controller;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.gps.application.dto.GpsLocationRequest;
import com.fleetbridge.gps.application.dto.GpsLocationResponse;
import com.fleetbridge.gps.application.service.GpsService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/gps")
@RequiredArgsConstructor
public class GpsController {

    private final GpsService gpsService;

    /**
     * POST /api/v1/gps/ingest
     * Called by the Driver Android app to push a location ping.
     * Persists the ping and broadcasts to all WebSocket subscribers.
     */
    @PostMapping("/ingest")
    public ResponseEntity<ApiResponse<GpsLocationResponse>> ingestLocation(
            @Valid @RequestBody GpsLocationRequest request) {
        return ResponseEntity.ok(gpsService.ingestLocation(request));
    }

    /**
     * GET /api/v1/gps/trips/{tripId}/latest
     * Returns the most recent GPS ping for a trip (i.e., current vehicle position).
     * Used to initialise the map marker position when the web portal loads.
     */
    @GetMapping("/trips/{tripId}/latest")
    public ResponseEntity<ApiResponse<GpsLocationResponse>> getLatestLocation(
            @PathVariable UUID tripId) {
        return ResponseEntity.ok(gpsService.getLatestLocation(tripId));
    }

    /**
     * GET /api/v1/gps/trips/{tripId}/trail
     * Returns all GPS pings for a trip in chronological order.
     * Used to draw the full route polyline on the map.
     */
    @GetMapping("/trips/{tripId}/trail")
    public ResponseEntity<ApiResponse<List<GpsLocationResponse>>> getTripTrail(
            @PathVariable UUID tripId) {
        return ResponseEntity.ok(gpsService.getTripTrail(tripId));
    }
}
