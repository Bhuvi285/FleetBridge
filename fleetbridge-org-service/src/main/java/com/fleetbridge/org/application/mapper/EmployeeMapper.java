package com.fleetbridge.org.application.mapper;

import com.fleetbridge.org.application.dto.EmployeeRequest;
import com.fleetbridge.org.application.dto.EmployeeResponse;
import com.fleetbridge.org.domain.entity.Employee;
import org.mapstruct.Mapper;
import org.mapstruct.Mapping;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface EmployeeMapper {
    @Mapping(target = "organization.id", source = "organizationId")
    Employee toEntity(EmployeeRequest request);

    @Mapping(target = "organizationId", source = "organization.id")
    EmployeeResponse toResponse(Employee employee);
}
