package com.fleetbridge.trip.application.mapper;

import com.fleetbridge.trip.application.dto.RouteRequest;
import com.fleetbridge.trip.application.dto.RouteResponse;
import com.fleetbridge.trip.application.dto.TripRequest;
import com.fleetbridge.trip.application.dto.TripResponse;
import com.fleetbridge.trip.domain.entity.Route;
import com.fleetbridge.trip.domain.entity.TripInstance;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface TripMapper {
    Route toEntity(RouteRequest request);
    RouteResponse toResponse(Route route);

    @Mapping(target = "route.id", source = "routeId")
    TripInstance toEntity(TripRequest request);
    
    @Mapping(target = "routeId", source = "route.id")
    TripResponse toResponse(TripInstance tripInstance);
}
