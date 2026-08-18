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
    date = "2026-08-17T16:19:58+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class TripMapperImpl implements TripMapper {

    @Override
    public Route toEntity(RouteRequest request) {
        if ( request == null ) {
            return null;
        }

        Route.RouteBuilder route = Route.builder();

        route.organizationId( request.getOrganizationId() );
        route.name( request.getName() );

        return route.build();
    }

    @Override
    public RouteResponse toResponse(Route route) {
        if ( route == null ) {
            return null;
        }

        RouteResponse.RouteResponseBuilder routeResponse = RouteResponse.builder();

        routeResponse.id( route.getId() );
        routeResponse.organizationId( route.getOrganizationId() );
        routeResponse.name( route.getName() );
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
        tripInstance.vehicleId( request.getVehicleId() );
        tripInstance.driverId( request.getDriverId() );
        tripInstance.scheduledStartTime( request.getScheduledStartTime() );
        tripInstance.status( request.getStatus() );

        return tripInstance.build();
    }

    @Override
    public TripResponse toResponse(TripInstance tripInstance) {
        if ( tripInstance == null ) {
            return null;
        }

        TripResponse.TripResponseBuilder tripResponse = TripResponse.builder();

        tripResponse.routeId( tripInstanceRouteId( tripInstance ) );
        tripResponse.id( tripInstance.getId() );
        tripResponse.vehicleId( tripInstance.getVehicleId() );
        tripResponse.driverId( tripInstance.getDriverId() );
        tripResponse.scheduledStartTime( tripInstance.getScheduledStartTime() );
        tripResponse.actualStartTime( tripInstance.getActualStartTime() );
        tripResponse.actualEndTime( tripInstance.getActualEndTime() );
        tripResponse.status( tripInstance.getStatus() );

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
