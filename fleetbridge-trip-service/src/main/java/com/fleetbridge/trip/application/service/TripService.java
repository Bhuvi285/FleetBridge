package com.fleetbridge.trip.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.trip.application.dto.*;
import com.fleetbridge.trip.application.mapper.TripMapper;
import com.fleetbridge.trip.domain.entity.Route;
import com.fleetbridge.trip.domain.entity.TripInstance;
import com.fleetbridge.trip.infrastructure.client.FleetServiceClient;
import com.fleetbridge.trip.infrastructure.repository.RouteRepository;
import com.fleetbridge.trip.infrastructure.repository.TripInstanceRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class TripService {

    private final RouteRepository routeRepository;
    private final TripInstanceRepository tripInstanceRepository;
    private final FleetServiceClient fleetServiceClient;
    private final TripMapper tripMapper;

    // --- Route Operations ---

    public ApiResponse<RouteResponse> createRoute(RouteRequest request) {
        Route route = tripMapper.toEntity(request);
        route.setStatus("ACTIVE");
        route = routeRepository.save(route);
        return ApiResponse.success(tripMapper.toResponse(route), "Route created successfully");
    }

    public ApiResponse<List<RouteResponse>> getAllRoutes() {
        List<RouteResponse> routes = routeRepository.findAll().stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(routes, "Routes retrieved successfully");
    }

    public ApiResponse<RouteResponse> updateRoute(UUID routeId, RouteRequest request) {
        return routeRepository.findById(routeId)
                .map(route -> {
                    route.setName(request.getName());
                    route = routeRepository.save(route);
                    return ApiResponse.success(tripMapper.toResponse(route), "Route updated successfully");
                })
                .orElse(ApiResponse.error("Route not found"));
    }

    public ApiResponse<Void> deleteRoute(UUID routeId) {
        if (!routeRepository.existsById(routeId)) {
            return ApiResponse.error("Route not found");
        }
        routeRepository.deleteById(routeId);
        return ApiResponse.success(null, "Route deleted successfully");
    }

    // --- Trip Operations ---

    public ApiResponse<TripResponse> scheduleTrip(TripRequest request) {
        Route route = routeRepository.findById(request.getRouteId())
                .orElse(null);
        if (route == null) {
            return ApiResponse.error("Route not found");
        }

        TripInstance trip = TripInstance.builder()
                .route(route)
                .vehicleId(request.getVehicleId())
                .driverId(request.getDriverId())
                .scheduledStartTime(request.getScheduledStartTime())
                .status("SCHEDULED")
                .build();

        trip = tripInstanceRepository.save(trip);
        return ApiResponse.success(tripMapper.toResponse(trip), "Trip scheduled successfully");
    }

    public ApiResponse<List<TripResponse>> getAllTrips() {
        List<TripResponse> trips = tripInstanceRepository.findAll().stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(trips, "All trips retrieved successfully");
    }

    public ApiResponse<List<TripResponse>> getTripsByRoute(UUID routeId) {
        List<TripResponse> trips = tripInstanceRepository.findByRoute_Id(routeId).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(trips, "Trips retrieved successfully");
    }

    public ApiResponse<TripResponse> updateTrip(UUID tripId, TripRequest request) {
        return tripInstanceRepository.findById(tripId)
                .map(trip -> {
                    // Note: Would validate vehicle/driver again if they changed.
                    trip.setVehicleId(request.getVehicleId());
                    trip.setDriverId(request.getDriverId());
                    trip.setScheduledStartTime(request.getScheduledStartTime());
                    trip.setStatus(request.getStatus() != null ? request.getStatus() : trip.getStatus());
                    trip = tripInstanceRepository.save(trip);
                    return ApiResponse.success(tripMapper.toResponse(trip), "Trip updated successfully");
                })
                .orElse(ApiResponse.error("Trip not found"));
    }

    public ApiResponse<Void> deleteTrip(UUID tripId) {
        if (!tripInstanceRepository.existsById(tripId)) {
            return ApiResponse.error("Trip not found");
        }
        tripInstanceRepository.deleteById(tripId);
        return ApiResponse.success(null, "Trip deleted successfully");
    }
}
