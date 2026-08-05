package com.fleetbridge.org.application.mapper;

import com.fleetbridge.org.application.dto.OrganizationRequest;
import com.fleetbridge.org.application.dto.OrganizationResponse;
import com.fleetbridge.org.domain.entity.Organization;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-05T22:11:23+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
)
@Component
public class OrganizationMapperImpl implements OrganizationMapper {

    @Override
    public Organization toEntity(OrganizationRequest request) {
        if ( request == null ) {
            return null;
        }

        Organization.OrganizationBuilder organization = Organization.builder();

        organization.tenantId( request.getTenantId() );
        organization.name( request.getName() );
        organization.industry( request.getIndustry() );

        return organization.build();
    }

    @Override
    public OrganizationResponse toResponse(Organization organization) {
        if ( organization == null ) {
            return null;
        }

        OrganizationResponse.OrganizationResponseBuilder organizationResponse = OrganizationResponse.builder();

        organizationResponse.id( organization.getId() );
        organizationResponse.tenantId( organization.getTenantId() );
        organizationResponse.name( organization.getName() );
        organizationResponse.industry( organization.getIndustry() );

        return organizationResponse.build();
    }
}
