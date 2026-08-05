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
    date = "2026-08-05T22:11:22+0530",
    comments = "version: 1.5.5.Final, compiler: javac, environment: Java 21.0.9 (Oracle Corporation)"
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
        employee.firstName( request.getFirstName() );
        employee.lastName( request.getLastName() );
        employee.email( request.getEmail() );
        employee.phoneNumber( request.getPhoneNumber() );
        employee.department( request.getDepartment() );

        return employee.build();
    }

    @Override
    public EmployeeResponse toResponse(Employee employee) {
        if ( employee == null ) {
            return null;
        }

        EmployeeResponse.EmployeeResponseBuilder employeeResponse = EmployeeResponse.builder();

        employeeResponse.organizationId( employeeOrganizationId( employee ) );
        employeeResponse.id( employee.getId() );
        employeeResponse.firstName( employee.getFirstName() );
        employeeResponse.lastName( employee.getLastName() );
        employeeResponse.email( employee.getEmail() );
        employeeResponse.phoneNumber( employee.getPhoneNumber() );
        employeeResponse.department( employee.getDepartment() );

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
