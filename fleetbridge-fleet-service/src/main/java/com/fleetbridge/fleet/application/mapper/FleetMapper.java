package com.fleetbridge.fleet.application.mapper;

import com.fleetbridge.fleet.application.dto.*;
import com.fleetbridge.fleet.domain.entity.Driver;
import com.fleetbridge.fleet.domain.entity.TravelCompany;
import com.fleetbridge.fleet.domain.entity.Vehicle;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface FleetMapper {
    
    TravelCompany toEntity(TravelCompanyRequest request);
    TravelCompanyResponse toResponse(TravelCompany company);

    @Mapping(target = "travelCompany.id", source = "travelCompanyId")
    Vehicle toEntity(VehicleRequest request);
    
    @Mapping(target = "travelCompanyId", source = "travelCompany.id")
    VehicleResponse toResponse(Vehicle vehicle);

    @Mapping(target = "travelCompany.id", source = "travelCompanyId")
    Driver toEntity(DriverRequest request);
    
    @Mapping(target = "travelCompanyId", source = "travelCompany.id")
    DriverResponse toResponse(Driver driver);
}
