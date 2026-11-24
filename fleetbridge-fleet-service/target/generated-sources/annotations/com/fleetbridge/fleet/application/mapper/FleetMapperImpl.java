package com.fleetbridge.fleet.application.mapper;

import com.fleetbridge.fleet.application.dto.DriverRequest;
import com.fleetbridge.fleet.application.dto.DriverResponse;
import com.fleetbridge.fleet.application.dto.TravelCompanyRequest;
import com.fleetbridge.fleet.application.dto.TravelCompanyResponse;
import com.fleetbridge.fleet.application.dto.VehicleRequest;
import com.fleetbridge.fleet.application.dto.VehicleResponse;
import com.fleetbridge.fleet.domain.entity.Driver;
import com.fleetbridge.fleet.domain.entity.TravelCompany;
import com.fleetbridge.fleet.domain.entity.Vehicle;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-11-24T13:47:10+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.200.v20261008-1115, environment: Java 25.0.4.1 (Eclipse Adoptium)"
)
@Component
public class FleetMapperImpl implements FleetMapper {

    @Override
    public TravelCompany toEntity(TravelCompanyRequest request) {
        if ( request == null ) {
            return null;
        }

        TravelCompany.TravelCompanyBuilder travelCompany = TravelCompany.builder();

        travelCompany.name( request.getName() );
        travelCompany.registrationNumber( request.getRegistrationNumber() );
        travelCompany.tenantId( request.getTenantId() );

        return travelCompany.build();
    }

    @Override
    public TravelCompanyResponse toResponse(TravelCompany company) {
        if ( company == null ) {
            return null;
        }

        TravelCompanyResponse.TravelCompanyResponseBuilder travelCompanyResponse = TravelCompanyResponse.builder();

        travelCompanyResponse.id( company.getId() );
        travelCompanyResponse.name( company.getName() );
        travelCompanyResponse.registrationNumber( company.getRegistrationNumber() );
        travelCompanyResponse.tenantId( company.getTenantId() );

        return travelCompanyResponse.build();
    }

    @Override
    public Vehicle toEntity(VehicleRequest request) {
        if ( request == null ) {
            return null;
        }

        Vehicle.VehicleBuilder vehicle = Vehicle.builder();

        vehicle.travelCompany( vehicleRequestToTravelCompany( request ) );
        vehicle.make( request.getMake() );
        vehicle.model( request.getModel() );
        vehicle.registrationPlate( request.getRegistrationPlate() );
        vehicle.seatingCapacity( request.getSeatingCapacity() );
        vehicle.type( request.getType() );
        vehicle.year( request.getYear() );

        return vehicle.build();
    }

    @Override
    public VehicleResponse toResponse(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }

        VehicleResponse.VehicleResponseBuilder vehicleResponse = VehicleResponse.builder();

        vehicleResponse.travelCompanyId( vehicleTravelCompanyId( vehicle ) );
        vehicleResponse.id( vehicle.getId() );
        vehicleResponse.make( vehicle.getMake() );
        vehicleResponse.model( vehicle.getModel() );
        vehicleResponse.registrationPlate( vehicle.getRegistrationPlate() );
        vehicleResponse.seatingCapacity( vehicle.getSeatingCapacity() );
        vehicleResponse.status( vehicle.getStatus() );
        vehicleResponse.type( vehicle.getType() );
        vehicleResponse.year( vehicle.getYear() );

        return vehicleResponse.build();
    }

    @Override
    public Driver toEntity(DriverRequest request) {
        if ( request == null ) {
            return null;
        }

        Driver.DriverBuilder driver = Driver.builder();

        driver.travelCompany( driverRequestToTravelCompany( request ) );
        driver.firstName( request.getFirstName() );
        driver.lastName( request.getLastName() );
        driver.licenseNumber( request.getLicenseNumber() );
        driver.phoneNumber( request.getPhoneNumber() );

        return driver.build();
    }

    @Override
    public DriverResponse toResponse(Driver driver) {
        if ( driver == null ) {
            return null;
        }

        DriverResponse.DriverResponseBuilder driverResponse = DriverResponse.builder();

        driverResponse.travelCompanyId( driverTravelCompanyId( driver ) );
        driverResponse.firstName( driver.getFirstName() );
        driverResponse.id( driver.getId() );
        driverResponse.lastName( driver.getLastName() );
        driverResponse.licenseNumber( driver.getLicenseNumber() );
        driverResponse.phoneNumber( driver.getPhoneNumber() );
        driverResponse.status( driver.getStatus() );

        return driverResponse.build();
    }

    protected TravelCompany vehicleRequestToTravelCompany(VehicleRequest vehicleRequest) {
        if ( vehicleRequest == null ) {
            return null;
        }

        TravelCompany.TravelCompanyBuilder travelCompany = TravelCompany.builder();

        travelCompany.id( vehicleRequest.getTravelCompanyId() );

        return travelCompany.build();
    }

    private UUID vehicleTravelCompanyId(Vehicle vehicle) {
        if ( vehicle == null ) {
            return null;
        }
        TravelCompany travelCompany = vehicle.getTravelCompany();
        if ( travelCompany == null ) {
            return null;
        }
        UUID id = travelCompany.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }

    protected TravelCompany driverRequestToTravelCompany(DriverRequest driverRequest) {
        if ( driverRequest == null ) {
            return null;
        }

        TravelCompany.TravelCompanyBuilder travelCompany = TravelCompany.builder();

        travelCompany.id( driverRequest.getTravelCompanyId() );

        return travelCompany.build();
    }

    private UUID driverTravelCompanyId(Driver driver) {
        if ( driver == null ) {
            return null;
        }
        TravelCompany travelCompany = driver.getTravelCompany();
        if ( travelCompany == null ) {
            return null;
        }
        UUID id = travelCompany.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
