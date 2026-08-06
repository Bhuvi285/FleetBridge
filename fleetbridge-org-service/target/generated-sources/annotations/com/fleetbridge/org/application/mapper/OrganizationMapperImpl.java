package com.fleetbridge.org.application.mapper;

import com.fleetbridge.org.application.dto.OrganizationRequest;
import com.fleetbridge.org.application.dto.OrganizationResponse;
import com.fleetbridge.org.domain.entity.Organization;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-06T11:03:15+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization.OrganizationBuilder organization = Organization.builder();

        organization.industry( request.getIndustry() );
        organization.name( request.getName() );
        organization.tenantId( request.getTenantId() );

        return organization.build();
    }

    @Override
    public OrganizationResponse toResponse(Organization organization) {
        if ( organization == null ) {
            return null;
        }

        OrganizationResponse.OrganizationResponseBuilder organizationResponse = OrganizationResponse.builder();

        organizationResponse.id( organization.getId() );
        organizationResponse.industry( organization.getIndustry() );
        organizationResponse.name( organization.getName() );
        organizationResponse.tenantId( organization.getTenantId() );

        return organizationResponse.build();
    }
}
