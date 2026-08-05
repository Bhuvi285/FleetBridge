package com.fleetbridge.org.application.mapper;

import com.fleetbridge.org.application.dto.EmployeeRequest;
import com.fleetbridge.org.application.dto.EmployeeResponse;
import com.fleetbridge.org.domain.entity.Employee;
import com.fleetbridge.org.domain.entity.Organization;
import java.util.UUID;
import javax.annotation.processing.Generated;
import org.springframework.stereotype.Component;

@Generated(
    value = "org.mapstruct.ap.MappingProcessor",
    date = "2026-08-05T15:13:51+0530",
    comments = "version: 1.5.5.Final, compiler: Eclipse JDT (IDE) 3.46.100.v20260624-0231, environment: Java 21.0.11 (Eclipse Adoptium)"
)
@Component
public class EmployeeMapperImpl implements EmployeeMapper {

    @Override
    public Employee toEntity(EmployeeRequest request) {
        if ( request == null ) {
            return null;
        }

        Employee.EmployeeBuilder employee = Employee.builder();

        employee.organization( employeeRequestToOrganization( request ) );
        employee.department( request.getDepartment() );
        employee.email( request.getEmail() );
        employee.firstName( request.getFirstName() );
        employee.lastName( request.getLastName() );
        employee.phoneNumber( request.getPhoneNumber() );

        return employee.build();
    }

    @Override
    public EmployeeResponse toResponse(Employee employee) {
        if ( employee == null ) {
            return null;
        }

        EmployeeResponse.EmployeeResponseBuilder employeeResponse = EmployeeResponse.builder();

        employeeResponse.organizationId( employeeOrganizationId( employee ) );
        employeeResponse.department( employee.getDepartment() );
        employeeResponse.email( employee.getEmail() );
        employeeResponse.firstName( employee.getFirstName() );
        employeeResponse.id( employee.getId() );
        employeeResponse.lastName( employee.getLastName() );
        employeeResponse.phoneNumber( employee.getPhoneNumber() );

        return employeeResponse.build();
    }

    protected Organization employeeRequestToOrganization(EmployeeRequest employeeRequest) {
        if ( employeeRequest == null ) {
            return null;
        }

        Organization.OrganizationBuilder organization = Organization.builder();

        organization.id( employeeRequest.getOrganizationId() );

        return organization.build();
    }

    private UUID employeeOrganizationId(Employee employee) {
        if ( employee == null ) {
            return null;
        }
        Organization organization = employee.getOrganization();
        if ( organization == null ) {
            return null;
        }
        UUID id = organization.getId();
        if ( id == null ) {
            return null;
        }
        return id;
    }
}
