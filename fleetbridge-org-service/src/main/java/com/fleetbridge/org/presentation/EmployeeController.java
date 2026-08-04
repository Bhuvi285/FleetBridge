package com.fleetbridge.org.presentation;

import com.fleetbridge.common.dto.ApiResponse;
import com.fleetbridge.org.application.dto.EmployeeRequest;
import com.fleetbridge.org.application.dto.EmployeeResponse;
import com.fleetbridge.org.application.service.EmployeeService;
import jakarta.validation.Valid;
import lombok.RequiredArgsConstructor;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;
import java.util.UUID;

@RestController
@RequestMapping("/api/v1/org/employees")
@RequiredArgsConstructor
public class EmployeeController {

    private final EmployeeService employeeService;

    @PostMapping
    public ResponseEntity<ApiResponse<EmployeeResponse>> createEmployee(@Valid @RequestBody EmployeeRequest request) {
        ApiResponse<EmployeeResponse> response = employeeService.createEmployee(request);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.badRequest().body(response);
    }

    @GetMapping("/{id}")
    public ResponseEntity<ApiResponse<EmployeeResponse>> getEmployee(@PathVariable UUID id) {
        ApiResponse<EmployeeResponse> response = employeeService.getEmployee(id);
        return response.isSuccess() ? ResponseEntity.ok(response) : ResponseEntity.notFound().build();
    }

    @GetMapping("/organization/{organizationId}")
    public ResponseEntity<ApiResponse<List<EmployeeResponse>>> getEmployeesByOrganization(@PathVariable UUID organizationId) {
        return ResponseEntity.ok(employeeService.getEmployeesByOrganization(organizationId));
    }
}
