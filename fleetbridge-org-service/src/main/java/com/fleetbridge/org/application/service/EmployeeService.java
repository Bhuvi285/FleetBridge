package com.fleetbridge.org.application.service;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.org.application.dto.EmployeeRequest;
import com.fleetbridge.org.application.dto.EmployeeResponse;
import com.fleetbridge.org.application.mapper.EmployeeMapper;
import com.fleetbridge.org.domain.entity.Employee;
import com.fleetbridge.org.infrastructure.repository.EmployeeRepository;
import com.fleetbridge.org.infrastructure.repository.OrganizationRepository;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;

import java.util.List;
import java.util.UUID;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class EmployeeService {

    private final EmployeeRepository employeeRepository;
    private final OrganizationRepository organizationRepository;
    private final EmployeeMapper employeeMapper;

    public ApiResponse<EmployeeResponse> createEmployee(EmployeeRequest request) {
        if (!organizationRepository.existsById(request.getOrganizationId())) {
            return ApiResponse.error("Organization not found");
        }
        if (employeeRepository.existsByEmail(request.getEmail())) {
            return ApiResponse.error("Email already registered");
        }

        Employee employee = employeeMapper.toEntity(request);
        employee = employeeRepository.save(employee);
        return ApiResponse.success(employeeMapper.toResponse(employee), "Employee created successfully");
    }

    public ApiResponse<EmployeeResponse> getEmployee(UUID id) {
        return employeeRepository.findById(id)
                .map(emp -> ApiResponse.success(employeeMapper.toResponse(emp), "Employee retrieved successfully"))
                .orElse(ApiResponse.error("Employee not found"));
    }

    public ApiResponse<List<EmployeeResponse>> getEmployeesByOrganization(UUID organizationId) {
        List<EmployeeResponse> employees = employeeRepository.findByOrganizationId(organizationId).stream()
                .map(employeeMapper::toResponse)
                .collect(Collectors.toList());
        return ApiResponse.success(employees, "Employees retrieved successfully");
    }
}
