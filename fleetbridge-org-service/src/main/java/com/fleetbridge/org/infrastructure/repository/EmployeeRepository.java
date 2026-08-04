package com.fleetbridge.org.infrastructure.repository;

import com.fleetbridge.org.domain.entity.Employee;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.UUID;
import java.util.List;

@Repository
public interface EmployeeRepository extends JpaRepository<Employee, UUID> {
    List<Employee> findByOrganizationId(UUID organizationId);
    boolean existsByEmail(String email);
}
