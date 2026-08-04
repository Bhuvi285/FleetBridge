package com.fleetbridge.trip.presentation;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.trip.application.dto.*;
import com.fleetbridge.trip.application.service.TripService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/trip")
@RequiredArgsConstructor
public class TripController {

    private final TripService tripService;

    // --- Route Endpoints ---

    @PostMapping("/routes")
    public ResponseEntity<ApiResponse<RouteResponse>> createRoute(@Valid @RequestBody RouteRequest request) {
        ApiResponse<RouteResponse> response = tripService.createRoute(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/routes")
    public ResponseEntity<ApiResponse<List<RouteResponse>>> getAllRoutes() {
        return ResponseEntity.ok(tripService.getAllRoutes());
    }

    // --- Trip Endpoints ---

    @PostMapping("/instances")
    public ResponseEntity<ApiResponse<TripResponse>> scheduleTrip(@Valid @RequestBody TripRequest request) {
        ApiResponse<TripResponse> response = tripService.scheduleTrip(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/routes/{routeId}/instances")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getTripsByRoute(@PathVariable UUID routeId) {
        return ResponseEntity.ok(tripService.getTripsByRoute(routeId));
    }
}
