package com.fleetbridge.org.application.mapper;

import com.fleetbridge.org.application.dto.OrganizationRequest;
import com.fleetbridge.org.application.dto.OrganizationResponse;
import com.fleetbridge.org.domain.entity.Organization;
import org.mapstruct.Mapper;
import org.mapstruct.ReportingPolicy;

@Mapper(componentModel = "spring", unmappedTargetPolicy = ReportingPolicy.IGNORE)
public interface OrganizationMapper {
    Organization toEntity(OrganizationRequest request);
    OrganizationResponse toResponse(Organization organization);
}
