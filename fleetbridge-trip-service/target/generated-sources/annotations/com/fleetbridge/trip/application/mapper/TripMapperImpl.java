package com.fleetbridge.trip.application.mapper;

import com.fleetbridge.trip.application.dto.RouteRequest;
import com.fleetbridge.trip.application.dto.RouteResponse;
import com.fleetbridge.trip.application.dto.TripRequest;
import com.fleetbridge.trip.application.dto.TripResponse;
import com.fleetbridge.trip.domain.entity.Route;
import com.fleetbridge.trip.domain.entity.TripInstance;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-05T15:13:54+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class TripMapperImpl implements TripMapper {

    @Override
    public Route toEntity(RouteRequest request) {
        if ( request == null ) {
            return null;
        }

        Route.RouteBuilder route = Route.builder();

        route.name( request.getName() );
        route.organizationId( request.getOrganizationId() );

        return route.build();
    }

    @Override
    public RouteResponse toResponse(Route route) {
        if ( route == null ) {
            return null;
        }

        RouteResponse.RouteResponseBuilder routeResponse = RouteResponse.builder();

        routeResponse.id( route.getId() );
        routeResponse.name( route.getName() );
        routeResponse.organizationId( route.getOrganizationId() );
        routeResponse.status( route.getStatus() );

        return routeResponse.build();
    }

    @Override
    public TripInstance toEntity(TripRequest request) {
        if ( request == null ) {
            return null;
        }

        TripInstance.TripInstanceBuilder tripInstance = TripInstance.builder();

        tripInstance.route( tripRequestToRoute( request ) );
        tripInstance.driverId( request.getDriverId() );
        tripInstance.scheduledStartTime( request.getScheduledStartTime() );
        tripInstance.vehicleId( request.getVehicleId() );

        return tripInstance.build();
    }

    @Override
    public TripResponse toResponse(TripInstance tripInstance) {
        if ( tripInstance == null ) {
            return null;
        }

        TripResponse.TripResponseBuilder tripResponse = TripResponse.builder();

        tripResponse.routeId( tripInstanceRouteId( tripInstance ) );
        tripResponse.actualEndTime( tripInstance.getActualEndTime() );
        tripResponse.actualStartTime( tripInstance.getActualStartTime() );
        tripResponse.driverId( tripInstance.getDriverId() );
        tripResponse.id( tripInstance.getId() );
        tripResponse.scheduledStartTime( tripInstance.getScheduledStartTime() );
        tripResponse.status( tripInstance.getStatus() );
        tripResponse.vehicleId( tripInstance.getVehicleId() );

        return tripResponse.build();
    }

    protected Route tripRequestToRoute(TripRequest tripRequest) {
        if ( tripRequest == null ) {
            return null;
        }

        Route.RouteBuilder route = Route.builder();

        route.id( tripRequest.getRouteId() );

        return route.build();
    }

    private UUID tripInstanceRouteId(TripInstance tripInstance) {
        if ( tripInstance == null ) {
            return null;
        }
        Route route = tripInstance.getRoute();
        if ( route == null ) {
            return null;
        }
        UUID id = route.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
