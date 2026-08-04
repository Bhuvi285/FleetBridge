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

    // --- Trip Operations ---

    public ApiResponse<TripResponse> scheduleTrip(TripRequest request) {
        if (!routeRepository.existsById(request.getRouteId())) {
            return ApiResponse.error("Route not found");
        }

        // Ideally, we verify vehicle/driver existence here via fleetServiceClient.
        // For MVP, we assume the IDs provided by the client are valid or we could add robust error handling.
        
        TripInstance trip = tripMapper.toEntity(request);
        trip.setStatus("SCHEDULED");
        trip = tripInstanceRepository.save(trip);
        return ApiResponse.success(tripMapper.toResponse(trip), "Trip scheduled successfully");
    }

    public ApiResponse<List<TripResponse>> getTripsByRoute(UUID routeId) {
        List<TripResponse> trips = tripInstanceRepository.findByRouteId(routeId).stream()
                .map(tripMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(trips, "Trips retrieved successfully");
    }
}
