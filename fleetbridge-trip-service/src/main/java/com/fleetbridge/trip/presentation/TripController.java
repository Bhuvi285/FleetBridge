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

    @PutMapping("/routes/{routeId}")
    public ResponseEntity<ApiResponse<RouteResponse>> updateRoute(
            @PathVariable("routeId") UUID routeId,
            @Valid @RequestBody RouteRequest request) {
        ApiResponse<RouteResponse> response = tripService.updateRoute(routeId, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/routes/{routeId}")
    public ResponseEntity<ApiResponse<Void>> deleteRoute(@PathVariable("routeId") UUID routeId) {
        ApiResponse<Void> response = tripService.deleteRoute(routeId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    // --- Trip Endpoints ---

    @PostMapping("/instances")
    public ResponseEntity<ApiResponse<TripResponse>> scheduleTrip(@Valid @RequestBody TripRequest request) {
        ApiResponse<TripResponse> response = tripService.scheduleTrip(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/instances")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getAllTrips() {
        return ResponseEntity.ok(tripService.getAllTrips());
    }

    @GetMapping("/routes/{routeId}/instances")
    public ResponseEntity<ApiResponse<List<TripResponse>>> getTripsByRoute(@PathVariable("routeId") UUID routeId) {
        return ResponseEntity.ok(tripService.getTripsByRoute(routeId));
    }

    @PutMapping("/instances/{tripId}")
    public ResponseEntity<ApiResponse<TripResponse>> updateTrip(
            @PathVariable("tripId") UUID tripId,
            @Valid @RequestBody TripRequest request) {
        ApiResponse<TripResponse> response = tripService.updateTrip(tripId, request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @DeleteMapping("/instances/{tripId}")
    public ResponseEntity<ApiResponse<Void>> deleteTrip(@PathVariable("tripId") UUID tripId) {
        ApiResponse<Void> response = tripService.deleteTrip(tripId);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    /** Driver PWA endpoint — change only the status of a trip */
    @PatchMapping("/instances/{tripId}/status")
    public ResponseEntity<ApiResponse<TripResponse>> updateTripStatus(
            @PathVariable("tripId") UUID tripId,
            @RequestBody java.util.Map<String, String> body) {
        String newStatus = body.get("status");
        if (newStatus == null || newStatus.isBlank()) {
            return ResponseEntity.badRequest().body(ApiResponse.error("status field is required"));
        }
        ApiResponse<TripResponse> response = tripService.updateTripStatus(tripId, newStatus);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }
}
