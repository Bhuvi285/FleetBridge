package com.fleetbridge.org.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.org.application.dto.OrganizationRequest;
import com.fleetbridge.org.application.dto.OrganizationResponse;
import com.fleetbridge.org.application.mapper.OrganizationMapper;
import com.fleetbridge.org.domain.entity.Organization;
import com.fleetbridge.org.infrastructure.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class OrganizationService {

    private final OrganizationRepository organizationRepository;
    private final OrganizationMapper organizationMapper;

    public ApiResponse<OrganizationResponse> createOrganization(OrganizationRequest request) {
        Organization organization = organizationMapper.toEntity(request);
        organization = organizationRepository.save(organization);
        return ApiResponse.success(organizationMapper.toResponse(organization), "Organization created successfully");
    }

    public ApiResponse<OrganizationResponse> getOrganization(UUID id) {
        return organizationRepository.findById(id)
                .map(org -> ApiResponse.success(organizationMapper.toResponse(org), "Organization retrieved successfully"))
                .orElse(ApiResponse.error("Organization not found"));
    }

    public ApiResponse<List<OrganizationResponse>> getAllOrganizations() {
        List<OrganizationResponse> orgs = organizationRepository.findAll().stream()
                .map(organizationMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(orgs, "Organizations retrieved successfully");
    }
}
